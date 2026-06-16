# local-run

## Prerequisites

- **Repos cloned side-by-side** under the same parent folder:
  ```bash
  mkdir void-kernel-apps && cd void-kernel-apps
  git clone https://github.com/void-kernel/app-ui.git
  git clone https://github.com/void-kernel/gateway.git
  git clone https://github.com/void-kernel/gatekeeper.git
  git clone https://github.com/void-kernel/sql-scripts.git
  ```
- **Toolchain** — the script verifies everything on startup and offers to auto-install missing tools via `brew` (macOS) or `apt-get` (Linux).
- **app-ui deps installed** once:
  ```bash
  cd app-ui && npm install
  ```

## Secrets (`.env`)

The local gateway + gatekeeper need Keycloak OAuth credentials. They are
**not** committed; the script reads them from `local-run/.env` (gitignored).

On first run the script will:

1. Copy `local-run/.env.example` → `local-run/.env`.
2. Prompt for any blank secret (hidden input) and write it back into
   `.env` so future runs are silent.

You can also pre-populate `.env` yourself:

```bash
cp local-run/.env.example local-run/.env
$EDITOR local-run/.env
```

Variables:

| Variable | Used by | Purpose |
|---|---|---|
| `KEYCLOAK_OAUTH_CLIENT_ID` | Gateway | Realm client used for the user-login OAuth flow (default `kernelmind-auth`). |
| `KEYCLOAK_OAUTH_CLIENT_SECRET` | Gateway | Secret for the above. **Required.** |
| `KEYCLOAK_ADMIN_CLIENT_ID` | Gatekeeper | Realm client used for the Keycloak admin REST API (default `gatekeeper-admin`). |
| `KEYCLOAK_ADMIN_CLIENT_SECRET` | Gatekeeper | Secret for the above. **Required.** |

## Gateway root signing keys

The gateway signs its own JWTs (distinct from Keycloak's tokens) with an
RSA-2048 keypair. `start.sh` auto-generates a per-developer pair on first
run via `openssl` and stores it at:

```
app-ui/local-run/.keys/gateway-root.private.pem
app-ui/local-run/.keys/gateway-root.public.pem
```

The directory is gitignored. The keys are read into env vars
(`GATEWAY_ROOT_PRIVATE_KEY` / `GATEWAY_ROOT_PUBLIC_KEY`) and injected into
`gateway/config.yaml` at `auth.root.{private_key,public_key}`.

To rotate (will invalidate all tokens issued so far):

```bash
rm -rf app-ui/local-run/.keys
```

## Environments

The first script argument selects the broker IDP host:

| Env | Remote app | Keycloak host |
|---|---|---|
| `dev` (default) | `https://dev.app.kernelmind.ai` | `dev.brokeridp.kernelmind.ai` |
| `qa` | `https://qa.app.kernelmind.ai` | `qa.brokeridp.kernelmind.ai` |
| `prod` | `https://app.kernelmind.ai` | `brokeridp.kernelmind.ai` |

Both `gateway/config.yaml` and `gatekeeper/application.yaml` are now
parameterized — the script exports the right Keycloak URLs at startup
based on `$ENVIRONMENT` and the secrets from `.env`. The committed YAMLs
stay valid as dev defaults.

## Run

From the `app-ui/` directory:

```bash
./local-run/start.sh          # dev   (default)
./local-run/start.sh qa       # qa
./local-run/start.sh prod     # prod
```

## Grant superadmin

Use `./local-run/grant-superadmin.sh` to give a logged-in user the superadmin role — no manual token copying.

- **Prereqs**: stack running (`start.sh`) and you've logged in via the UI at least once.
- **Common usage**:
  ```bash
  ./local-run/grant-superadmin.sh                 # auto-discover session(s) from Redis
  ```
- If multiple sessions are found, it prompts you to pick one (pass `<email>` to skip the prompt).
- **After granting**: refresh the UI to see the role take effect.

## Stop

- `Ctrl+C` — kills the local processes and tears down the docker-compose infra. Postgres / NATS data persists across runs in named docker volumes.
