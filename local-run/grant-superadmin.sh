#!/bin/bash
#
# grant-superadmin.sh — grant the superadmin role to a logged-in user, with no
# manual token copying.
#
# How it avoids needing a token from the browser:
#   The LOCAL gateway stores each logged-in session in Redis under
#   `auth_access_token:-:<access_token>`. This script SCANs those keys to
#   recover the access token(s), calls /api/auth/user-info with each to get the
#   email + organization (nothing hardcoded), lets you pick if there are
#   several, then:
#     1. ensures that organization + user exist in the LOCAL DB, and
#     2. runs 9999_seed_superadmin.sql to create + assign the superadmin role.
#
# In local-run the UI's superadmin flag is resolved by the LOCAL gateway ->
# LOCAL gatekeeper -> LOCAL DB, so seeding the local DB is what makes it show.
#
# Usage:
#   ./grant-superadmin.sh                 # auto-discover session(s) from Redis
#   ./grant-superadmin.sh <email>         # pick a specific session by email
#   ./grant-superadmin.sh --token <tok>   # skip Redis, use a token directly
#
# Overrides (defaults match local-run):
#   --gateway-url URL              gateway base (default http://localhost:10000)
#   --redis-host H  --redis-port P (default localhost:6379)
#   -h HOST -p PORT -U USER -d DBNAME -W PASSWORD   (Postgres connection)

set -e

# --------------------------------------------------
# Paths
# --------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_UI_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$APP_UI_DIR/.." && pwd)"
SEED_SUPERADMIN_FILE="$MONOREPO_ROOT/sql-scripts/scripts/9999_seed_superadmin.sql"

# --------------------------------------------------
# Defaults (match local-run/start.sh)
# --------------------------------------------------
GATEWAY_URL="${GATEWAY_URL:-http://localhost:10000}"
REDIS_HOST="${REDIS_HOST:-localhost}"
REDIS_PORT="${REDIS_PORT:-6379}"
REDIS_CONTAINER="${REDIS_CONTAINER:-local-redis}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-postgres}"
DB_PASS="${DB_PASS:-postgres}"
DB_NAME="${DB_NAME:-xyz}"

FILTER_EMAIL=""
DIRECT_TOKEN=""

# --------------------------------------------------
# Parse flags + positional email
# --------------------------------------------------
while [ $# -gt 0 ]; do
  case "$1" in
    --token) DIRECT_TOKEN="$2"; shift 2 ;;
    --gateway-url) GATEWAY_URL="$2"; shift 2 ;;
    --redis-host) REDIS_HOST="$2"; shift 2 ;;
    --redis-port) REDIS_PORT="$2"; shift 2 ;;
    -h) DB_HOST="$2"; shift 2 ;;
    -p) DB_PORT="$2"; shift 2 ;;
    -U) DB_USER="$2"; shift 2 ;;
    -d) DB_NAME="$2"; shift 2 ;;
    -W) DB_PASS="$2"; shift 2 ;;
    --help)
      grep '^#' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    -*)
      echo "Unknown option: $1" >&2; exit 1 ;;
    *)
      FILTER_EMAIL="$1"; shift ;;
  esac
done

# --------------------------------------------------
# Prerequisites
# --------------------------------------------------
for tool in curl psql python3; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "ERROR: '$tool' not found on PATH." >&2
    exit 1
  fi
done
if [ ! -f "$SEED_SUPERADMIN_FILE" ]; then
  echo "ERROR: seed script not found at $SEED_SUPERADMIN_FILE" >&2
  exit 1
fi

# --------------------------------------------------
# Redis CLI wrapper (host redis-cli, else the docker container)
# --------------------------------------------------
redis_cli() {
  if command -v redis-cli >/dev/null 2>&1; then
    redis-cli -h "$REDIS_HOST" -p "$REDIS_PORT" "$@"
  elif command -v docker >/dev/null 2>&1 && \
       docker ps --format '{{.Names}}' 2>/dev/null | grep -qx "$REDIS_CONTAINER"; then
    docker exec -i "$REDIS_CONTAINER" redis-cli "$@"
  else
    return 127
  fi
}

# --------------------------------------------------
# Call /api/auth/user-info with a token; prints "email<TAB>org<TAB>is_sa"
# --------------------------------------------------
fetch_user_info() {
  local token="$1"
  local resp
  resp=$(curl -fsS -H "Authorization: Bearer $token" \
    "$GATEWAY_URL/api/auth/user-info" 2>/dev/null || true)
  [ -z "$resp" ] && return 1
  printf '%s' "$resp" | python3 -c '
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    sys.exit(1)
email = d.get("email", "")
org = d.get("organization", "")
sa = d.get("is_super_admin", False)
if not email or not org:
    sys.exit(1)
print(f"{email}\t{org}\t{sa}")
' 2>/dev/null
}

# --------------------------------------------------
# Collect candidate sessions: lines of "email<TAB>org<TAB>is_sa"
# --------------------------------------------------
CANDIDATES=""

if [ -n "$DIRECT_TOKEN" ]; then
  info=$(fetch_user_info "$DIRECT_TOKEN" || true)
  [ -n "$info" ] && CANDIDATES="$info"
else
  echo "Discovering logged-in sessions from Redis ($REDIS_HOST:$REDIS_PORT)..."
  if ! KEYS=$(redis_cli --scan --pattern 'auth_access_token:-:*' 2>/dev/null); then
    echo "ERROR: could not reach Redis (no redis-cli and no '$REDIS_CONTAINER' container)." >&2
    echo "       Pass a token directly:  $0 --token <access_token>" >&2
    exit 1
  fi
  if [ -z "$KEYS" ]; then
    echo "ERROR: no active sessions found in Redis. Log in via the UI first," >&2
    echo "       or pass a token directly:  $0 --token <access_token>" >&2
    exit 1
  fi
  while IFS= read -r key; do
    [ -z "$key" ] && continue
    token="${key#auth_access_token:-:}"
    info=$(fetch_user_info "$token" || true)
    [ -n "$info" ] && CANDIDATES="${CANDIDATES}${info}"$'\n'
  done <<< "$KEYS"
fi

# Dedupe by email+org.
CANDIDATES=$(printf '%s' "$CANDIDATES" | awk 'NF' | sort -u)

if [ -z "$CANDIDATES" ]; then
  echo "ERROR: could not resolve any user from sessions (tokens expired?)." >&2
  exit 1
fi

# Optional filter by email.
if [ -n "$FILTER_EMAIL" ]; then
  CANDIDATES=$(printf '%s\n' "$CANDIDATES" | awk -F'\t' -v e="$FILTER_EMAIL" '$1==e')
  if [ -z "$CANDIDATES" ]; then
    echo "ERROR: no logged-in session found for '$FILTER_EMAIL'." >&2
    exit 1
  fi
fi

# --------------------------------------------------
# Select a session
# --------------------------------------------------
COUNT=$(printf '%s\n' "$CANDIDATES" | wc -l | tr -d '[:space:]')
if [ "$COUNT" -eq 1 ]; then
  CHOSEN="$CANDIDATES"
else
  echo "Multiple logged-in users found:"
  i=1
  while IFS=$'\t' read -r e o s; do
    echo "  [$i] $e   (org=$o, superadmin=$s)"
    i=$((i+1))
  done <<< "$CANDIDATES"
  if [ ! -t 0 ]; then
    echo "ERROR: multiple sessions and no TTY to choose. Re-run with an email arg." >&2
    exit 1
  fi
  read -r -p "Select a user [1-$((i-1))]: " sel
  CHOSEN=$(printf '%s\n' "$CANDIDATES" | sed -n "${sel}p")
  [ -z "$CHOSEN" ] && { echo "Invalid selection." >&2; exit 1; }
fi

EMAIL=$(printf '%s' "$CHOSEN" | cut -f1)
ORG_ID=$(printf '%s' "$CHOSEN" | cut -f2)
IS_SA=$(printf '%s' "$CHOSEN" | cut -f3)

echo "============================================="
echo "  Grant superadmin (from user-info)"
echo "  DB:           $DB_USER@$DB_HOST:$DB_PORT/$DB_NAME"
echo "  Email:        $EMAIL"
echo "  Organization: $ORG_ID"
echo "  Currently superadmin? $IS_SA"
echo "============================================="

export PGPASSWORD="$DB_PASS"
PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1"

# --------------------------------------------------
# Ensure organization + user exist locally
# --------------------------------------------------
echo "Ensuring organization and user exist locally..."
$PSQL_CMD -v org_id="$ORG_ID" -v email="$EMAIL" <<'SQL'
INSERT INTO organizations (org_id, name, created_at, updated_at)
SELECT :'org_id', :'org_id', now(), now()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE org_id = :'org_id');

INSERT INTO users (email, organization_id, created_at, updated_at)
SELECT :'email', o.id, now(), now()
FROM organizations o
WHERE o.org_id = :'org_id'
  AND NOT EXISTS (
    SELECT 1 FROM users u WHERE u.email = :'email' AND u.organization_id = o.id
  );
SQL

# --------------------------------------------------
# Grant superadmin
# --------------------------------------------------
echo "Applying superadmin grant..."
if $PSQL_CMD -v email="$EMAIL" -f "$SEED_SUPERADMIN_FILE"; then
  echo ""
  echo ">>> SUCCESS: superadmin granted to '$EMAIL'."
  echo "    Refresh the UI (or re-fetch user-info) to see it take effect."
else
  echo ""
  echo ">>> ERROR: grant failed for '$EMAIL'."
  unset PGPASSWORD
  exit 1
fi

unset PGPASSWORD
