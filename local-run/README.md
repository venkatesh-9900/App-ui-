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

## Run

From the `app-ui/` directory:

```bash
./local-run/start.sh          # dev   (default)
./local-run/start.sh qa       # qa
./local-run/start.sh prod     # prod
```

## Stop

- `Ctrl+C` — kills the local processes and tears down the docker-compose infra. Postgres / NATS data persists across runs in named docker volumes.
