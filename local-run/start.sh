#!/bin/bash

set -e

# --------------------------------------------------
# Configuration
# --------------------------------------------------
ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_UI_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
MONOREPO_ROOT="$(cd "$APP_UI_DIR/.." && pwd)"

# Per-environment hosts.
#   dev  -> dev.app.kernelmind.ai   + dev.brokeridp.kernelmind.ai
#   qa   -> qa.app.kernelmind.ai    + qa.brokeridp.kernelmind.ai
#   prod -> app.kernelmind.ai       + brokeridp.kernelmind.ai
case "$ENVIRONMENT" in
  dev)
    REMOTE_URL="https://dev.app.kernelmind.ai"
    KEYCLOAK_HOST="dev.brokeridp.kernelmind.ai"
    ;;
  qa)
    REMOTE_URL="https://qa.app.kernelmind.ai"
    KEYCLOAK_HOST="qa.brokeridp.kernelmind.ai"
    ;;
  prod)
    REMOTE_URL="https://app.kernelmind.ai"
    KEYCLOAK_HOST="brokeridp.kernelmind.ai"
    ;;
  *)
    echo "ERROR: unknown environment '$ENVIRONMENT' (expected: dev | qa | prod)"
    exit 1
    ;;
esac

KEYCLOAK_REALM="brokeridp"
KEYCLOAK_BASE_URL="https://${KEYCLOAK_HOST}"
KC_REALM_BASE="${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}/protocol/openid-connect"

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASS=postgres
DB_NAME=xyz

GATEWAY_PORT=10000
GATEKEEPER_PORT=16007
UI_PORT=20000

# PIDs to clean up
GATEWAY_PID=""
GATEKEEPER_PID=""
UI_PID=""
COMPOSE_UP=false

# --------------------------------------------------
# Cleanup
# --------------------------------------------------
cleanup() {
  echo ""
  echo "Stopping services..."

  [ -n "$UI_PID" ]         && kill "$UI_PID" 2>/dev/null || true
  [ -n "$GATEWAY_PID" ]    && kill "$GATEWAY_PID" 2>/dev/null || true
  [ -n "$GATEKEEPER_PID" ] && kill "$GATEKEEPER_PID" 2>/dev/null || true

  if $COMPOSE_UP; then
    echo "Stopping docker-compose infra..."
    docker compose -f "$SCRIPT_DIR/docker-compose-local.yml" down 2>/dev/null || true
  fi

  wait 2>/dev/null
  echo "All services stopped."
  exit 0
}

trap cleanup INT TERM

# --------------------------------------------------
# Prerequisite checks (+ optional auto-install)
# --------------------------------------------------
# Each entry: <cmd>|<description>|<macos-install-cmd>|<linux-install-cmd>
# Use "MANUAL" if the tool requires human interaction (e.g. Docker Desktop).
REQUIRED_TOOLS=(
  "docker|Docker (Postgres / Redis / NATS / OTel collector)|MANUAL|MANUAL"
  "cargo|Rust toolchain — builds & runs the gateway|curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y|curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y"
  "gradle|Gradle — builds & runs the gatekeeper (needs Java 23)|brew install gradle openjdk@23|sudo apt-get install -y gradle openjdk-23-jdk"
  "node|Node.js — runs app-ui|brew install node|sudo apt-get install -y nodejs npm"
  "npm|npm — starts the dev server|brew install node|sudo apt-get install -y nodejs npm"
  "psql|PostgreSQL client — applies idempotent seed scripts|brew install libpq && brew link --force libpq|sudo apt-get install -y postgresql-client"
  "atlas|Atlas CLI — applies versioned DB migrations from sql-scripts/migrations|brew install ariga/tap/atlas|curl -sSf https://atlasgo.sh | sh"
  "lsof|lsof — frees required ports before startup|MANUAL|sudo apt-get install -y lsof"
  "curl|curl — readiness probes|MANUAL|sudo apt-get install -y curl"
  "openssl|OpenSSL — generates the gateway's root signing keypair|brew install openssl|sudo apt-get install -y openssl"
)

case "$(uname -s)" in
  Darwin) OS_KEY="macos" ;;
  Linux)  OS_KEY="linux" ;;
  *)      OS_KEY="unknown" ;;
esac

MISSING=()
for entry in "${REQUIRED_TOOLS[@]}"; do
  IFS='|' read -r cmd desc mac_cmd lin_cmd <<< "$entry"
  if ! command -v "$cmd" &>/dev/null; then
    case "$OS_KEY" in
      macos) install_cmd="$mac_cmd" ;;
      linux) install_cmd="$lin_cmd" ;;
      *)     install_cmd="MANUAL" ;;
    esac
    MISSING+=("$cmd|$desc|$install_cmd")
  fi
done

if [ ${#MISSING[@]} -ne 0 ]; then
  echo "Missing required tools:"
  for m in "${MISSING[@]}"; do
    IFS='|' read -r cmd desc install_cmd <<< "$m"
    echo "  - $cmd : $desc"
    if [ "$install_cmd" = "MANUAL" ]; then
      echo "      install: (manual — see local-run/README.md)"
    else
      echo "      install: $install_cmd"
    fi
  done

  echo ""
  if [ "$OS_KEY" = "macos" ] && ! command -v brew &>/dev/null; then
    echo "Homebrew not found. Install brew first: https://brew.sh"
    exit 1
  fi

  read -r -p "Attempt to install missing tools now? [y/N] " yn
  case "$yn" in
    [yY]|[yY][eE][sS]) ;;
    *) echo "Aborting. Install the tools above and re-run."; exit 1 ;;
  esac

  for m in "${MISSING[@]}"; do
    IFS='|' read -r cmd desc install_cmd <<< "$m"
    if [ "$install_cmd" = "MANUAL" ]; then
      echo ""
      echo "SKIPPING $cmd — requires manual install (see README)."
      continue
    fi
    echo ""
    echo "Installing $cmd ..."
    if ! bash -c "$install_cmd"; then
      echo "ERROR: Failed to install $cmd. Install it manually and re-run."
      exit 1
    fi
  done

  echo ""
  echo "Install step complete. Re-checking tools..."
  STILL_MISSING=()
  for entry in "${REQUIRED_TOOLS[@]}"; do
    IFS='|' read -r cmd _ _ _ <<< "$entry"
    if ! command -v "$cmd" &>/dev/null; then
      STILL_MISSING+=("$cmd")
    fi
  done
  if [ ${#STILL_MISSING[@]} -ne 0 ]; then
    echo "Still missing after install: ${STILL_MISSING[*]}"
    echo "You may need to open a new shell (for PATH updates from rustup/brew) and re-run."
    exit 1
  fi
fi

if ! docker compose version &>/dev/null; then
  echo "ERROR: 'docker compose' (v2) is required. Install Docker Desktop or the compose plugin."
  exit 1
fi

echo "============================================="
echo "  Local Gateway Dev Environment"
echo "  Environment:    $ENVIRONMENT"
echo "  Remote backend: $REMOTE_URL"
echo "  Keycloak:       $KEYCLOAK_BASE_URL (realm=$KEYCLOAK_REALM)"
echo "============================================="

# --------------------------------------------------
# Load .env (OAuth client_id / client_secret) and prompt for any missing
# values. The file lives next to this script and is gitignored.
# --------------------------------------------------
ENV_FILE="$SCRIPT_DIR/.env"
ENV_EXAMPLE="$SCRIPT_DIR/.env.example"

if [ ! -f "$ENV_FILE" ]; then
  if [ -f "$ENV_EXAMPLE" ]; then
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo "Created $ENV_FILE from .env.example — secrets will be prompted below."
  else
    : > "$ENV_FILE"
  fi
fi

# Source .env. `allexport` makes every assignment automatically exported
# so child processes (gateway, gatekeeper) inherit them.
set -o allexport
# shellcheck disable=SC1090
source "$ENV_FILE"
set +o allexport

# Persist a key=value back into .env (creating or replacing the line).
write_env() {
  local key="$1"
  local value="$2"
  local tmp
  tmp="$(mktemp)"
  if [ -f "$ENV_FILE" ] && grep -q "^${key}=" "$ENV_FILE"; then
    awk -v k="$key" -v v="$value" -F= '
      BEGIN { OFS="=" }
      $1 == k { print k "=" v; next }
      { print }
    ' "$ENV_FILE" > "$tmp"
    mv "$tmp" "$ENV_FILE"
  else
    cat "$ENV_FILE" 2>/dev/null > "$tmp" || true
    echo "${key}=${value}" >> "$tmp"
    mv "$tmp" "$ENV_FILE"
  fi
}

# Prompt (hidden input) for a secret if not already set, then persist it.
prompt_secret() {
  local var="$1"
  local label="$2"
  if [ -z "${!var:-}" ]; then
    if [ ! -t 0 ]; then
      echo "ERROR: $var is not set in $ENV_FILE and stdin is not a TTY (cannot prompt)."
      exit 1
    fi
    local value
    read -r -s -p "Enter $label ($var): " value
    echo
    if [ -z "$value" ]; then
      echo "ERROR: $var is required."
      exit 1
    fi
    export "$var=$value"
    write_env "$var" "$value"
  fi
}

# Defaults for the non-secret IDs (per-env they rarely change; .env can override).
: "${KEYCLOAK_OAUTH_CLIENT_ID:=kernelmind-auth}"
: "${KEYCLOAK_ADMIN_CLIENT_ID:=gatekeeper-admin}"

prompt_secret KEYCLOAK_OAUTH_CLIENT_SECRET "OAuth client_secret for $KEYCLOAK_OAUTH_CLIENT_ID"
prompt_secret KEYCLOAK_ADMIN_CLIENT_SECRET "Admin client_secret for $KEYCLOAK_ADMIN_CLIENT_ID"

# Export everything Gateway + Gatekeeper need.
#
# Gateway (Rust) does whole-string ENV_* substitution only, so it gets the
# fully-built endpoint URLs.
# Gatekeeper (Spring Boot) uses ${KEYCLOAK_BASE_URL} placeholders directly.
export KEYCLOAK_BASE_URL
export KEYCLOAK_REALM
export KEYCLOAK_OAUTH_CLIENT_ID
export KEYCLOAK_OAUTH_CLIENT_SECRET
export KEYCLOAK_ADMIN_CLIENT_ID
export KEYCLOAK_ADMIN_CLIENT_SECRET
export KEYCLOAK_ISSUER_URL="${KEYCLOAK_BASE_URL}/realms/${KEYCLOAK_REALM}"
export KEYCLOAK_TOKEN_URL="${KC_REALM_BASE}/token"
export KEYCLOAK_JWKS_URL="${KC_REALM_BASE}/certs"
export KEYCLOAK_AUTH_URL="${KC_REALM_BASE}/auth"
export KEYCLOAK_LOGOUT_URL="${KC_REALM_BASE}/logout"

# --------------------------------------------------
# Gateway root signing keypair.
#
# The gateway signs its own JWTs (separate from Keycloak's tokens) with an
# RSA keypair declared at `auth.root.{private_key,public_key}`. Instead of
# committing real keys, we generate a per-developer pair on first run,
# stash them under `local-run/.keys/` (gitignored), and inject them via
# env vars. Delete the directory to rotate.
# --------------------------------------------------
KEYS_DIR="$SCRIPT_DIR/.keys"
GATEWAY_PRIVATE_KEY_PATH="$KEYS_DIR/gateway-root.private.pem"
GATEWAY_PUBLIC_KEY_PATH="$KEYS_DIR/gateway-root.public.pem"

mkdir -p "$KEYS_DIR"
chmod 700 "$KEYS_DIR"

if [ ! -s "$GATEWAY_PRIVATE_KEY_PATH" ] || [ ! -s "$GATEWAY_PUBLIC_KEY_PATH" ]; then
  echo "Generating gateway root RSA-2048 keypair at $KEYS_DIR ..."
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 \
    -out "$GATEWAY_PRIVATE_KEY_PATH" 2>/dev/null
  openssl rsa -pubout \
    -in "$GATEWAY_PRIVATE_KEY_PATH" \
    -out "$GATEWAY_PUBLIC_KEY_PATH" 2>/dev/null
  chmod 600 "$GATEWAY_PRIVATE_KEY_PATH"
  chmod 644 "$GATEWAY_PUBLIC_KEY_PATH"
fi

GATEWAY_ROOT_PRIVATE_KEY="$(cat "$GATEWAY_PRIVATE_KEY_PATH")"
GATEWAY_ROOT_PUBLIC_KEY="$(cat "$GATEWAY_PUBLIC_KEY_PATH")"
export GATEWAY_ROOT_PRIVATE_KEY
export GATEWAY_ROOT_PUBLIC_KEY

# --------------------------------------------------
# 0. Free up required ports (kill leftover processes)
# --------------------------------------------------
echo ""
echo "[0/6] Freeing required ports..."
for port in $UI_PORT $GATEWAY_PORT $GATEKEEPER_PORT; do
  pids=$(lsof -ti tcp:$port 2>/dev/null || true)
  if [ -n "$pids" ]; then
    echo "  Port $port in use by PID(s): $pids — killing..."
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
done
echo "  Ports clear."

# --------------------------------------------------
# 1. Start infrastructure (Postgres, Redis, NATS, OTel)
# --------------------------------------------------
echo ""
echo "[1/6] Starting infrastructure (Postgres, Redis, NATS, OTel collector)..."

# Clear any stale containers. Two cleanup paths:
#  (a) `compose down` — removes containers under the current project label
#      (project = parent dir name). Preserves named volumes, so DB data survives.
#  (b) Explicit `docker rm -f` by container_name — catches containers left
#      behind by older versions of the script that ran from a different
#      directory and therefore a different compose project label. Container
#      names are global across projects, so this is the only way to clean them.
docker compose -f "$SCRIPT_DIR/docker-compose-local.yml" down --remove-orphans 2>/dev/null || true
for c in local-postgres local-redis local-nats local-otel-collector; do
  if docker ps -a --format '{{.Names}}' | grep -qx "$c"; then
    echo "  Removing stale container: $c"
    docker rm -f "$c" >/dev/null 2>&1 || true
  fi
done

docker compose -f "$SCRIPT_DIR/docker-compose-local.yml" up -d --wait
COMPOSE_UP=true
echo "  Infrastructure is healthy."

# --------------------------------------------------
# 2. Apply DB schema + seeds
# --------------------------------------------------
echo ""
echo "[2/6] Applying database migrations and seeds..."

export PGPASSWORD="$DB_PASS"
PSQL_CMD="psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -v ON_ERROR_STOP=1"

MIGRATIONS_DIR="$MONOREPO_ROOT/sql-scripts/migrations"
SEED_FILE="$MONOREPO_ROOT/sql-scripts/scripts/0002_seed_api_registry.sql"
ATLAS_URL="postgres://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}?sslmode=disable"

# Detect stale state from older versions of this script that used a
# custom _local_run_migrations tracker before we switched to Atlas.
LEGACY=$($PSQL_CMD -tAc \
  "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='_local_run_migrations'" 2>/dev/null || echo "")
HAS_ATLAS_TBL=$($PSQL_CMD -tAc \
  "SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='atlas_schema_revisions'" 2>/dev/null || echo "")
if [ "$LEGACY" = "1" ] && [ "$HAS_ATLAS_TBL" != "1" ]; then
  echo ""
  echo "ERROR: This DB was previously initialized by an older version of"
  echo "  this script (table '_local_run_migrations' exists but Atlas has"
  echo "  not been initialized). Atlas would try to re-apply every migration"
  echo "  and fail on 'table already exists'."
  echo ""
  echo "  Wipe and retry:"
  echo "    docker compose -f $SCRIPT_DIR/docker-compose-local.yml down -v"
  echo "    $0 $ENVIRONMENT"
  unset PGPASSWORD
  exit 1
fi

echo "  Running 'atlas migrate apply'..."
if ! atlas migrate apply \
      --dir "file://${MIGRATIONS_DIR}" \
      --url "$ATLAS_URL"; then
  echo "  ERROR: atlas migrate apply failed."
  unset PGPASSWORD
  exit 1
fi

echo "  Applying API registry seed (idempotent)..."
$PSQL_CMD -f "$SEED_FILE" >/dev/null 2>&1

unset PGPASSWORD

# --------------------------------------------------
# 3. Start Gatekeeper (Java/Spring Boot)
# --------------------------------------------------
echo ""
echo "[3/6] Starting Gatekeeper (port $GATEKEEPER_PORT)..."
cd "$MONOREPO_ROOT/gatekeeper"
gradle bootRun &
GATEKEEPER_PID=$!

echo "  Waiting for Gatekeeper to be ready..."
for i in $(seq 1 60); do
  if curl -sf "http://localhost:$GATEKEEPER_PORT/api/v1/docs" >/dev/null 2>&1 || \
     curl -sf "http://localhost:$GATEKEEPER_PORT/api/v1/authz/routes" >/dev/null 2>&1; then
    echo "  Gatekeeper is ready."
    break
  fi
  if ! kill -0 "$GATEKEEPER_PID" 2>/dev/null; then
    echo "ERROR: Gatekeeper process exited unexpectedly."
    cleanup
  fi
  sleep 2
done

# --------------------------------------------------
# 4. Start Gateway (Rust)
# --------------------------------------------------
echo ""
echo "[4/6] Starting Gateway (port $GATEWAY_PORT)..."
cd "$MONOREPO_ROOT/gateway"
cargo run -- config.yaml &
GATEWAY_PID=$!

echo "  Waiting for Gateway to be ready..."
for i in $(seq 1 30); do
  if curl -sf "http://localhost:$GATEWAY_PORT/api/health/info" >/dev/null 2>&1; then
    echo "  Gateway is ready."
    break
  fi
  if ! kill -0 "$GATEWAY_PID" 2>/dev/null; then
    echo "ERROR: Gateway process exited unexpectedly."
    cleanup
  fi
  sleep 2
done

# --------------------------------------------------
# 5. Write next.config.ts and start app-ui
# --------------------------------------------------
echo ""
echo "[5/6] Configuring and starting app-ui (port $UI_PORT)..."

cat > "$APP_UI_DIR/next.config.ts" <<EOF
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const remoteBackend = "${REMOTE_URL}";

    return [
      // AUTH → LOCAL gateway (so you can dev/debug the gateway's
      // OAuth + token-exchange flow locally)
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:${GATEWAY_PORT}/api/auth/:path*",
      },
      // EVERYTHING ELSE → REMOTE gateway (which already has the full
      // route table + IAM data to reach internal backend services)
      {
        source: "/api/:path*",
        destination: \`\${remoteBackend}/api/:path*\`,
      },
    ];
  },
};

export default nextConfig;
EOF

echo "  next.config.ts updated:"
echo "    /api/auth/* → local gateway (localhost:${GATEWAY_PORT})"
echo "    /api/*      → remote gateway (${REMOTE_URL})"

cd "$APP_UI_DIR"
npm run dev &
UI_PID=$!

# --------------------------------------------------
# 6. Open browser
# --------------------------------------------------
echo ""
echo "[6/6] Waiting for UI to compile..."
sleep 5

echo ""
echo "============================================="
echo "  Local environment running!"
echo ""
echo "  UI:         http://localhost:$UI_PORT"
echo "  Gateway:    http://localhost:$GATEWAY_PORT"
echo "  Gatekeeper: http://localhost:$GATEKEEPER_PORT"
echo ""
echo "  Infra (docker-compose):"
echo "    Postgres:  localhost:$DB_PORT"
echo "    Redis:     localhost:6379"
echo "    NATS:      localhost:4222"
echo "    OTel:      localhost:4317 (grpc), 4318 (http)"
echo ""
echo "  Request routing:"
echo "    /api/auth/*  → LOCAL gateway (OAuth + token exchange)"
echo "    /api/*       → REMOTE gateway ($REMOTE_URL)"
echo ""
echo "  Both gateways validate against the same Keycloak,"
echo "  so a token issued via local auth is accepted by"
echo "  the remote gateway for all backend service calls."
echo ""
echo "  Press Ctrl+C to stop everything."
echo "============================================="

open "http://localhost:$UI_PORT" || xdg-open "http://localhost:$UI_PORT" || true

wait
