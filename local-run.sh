#!/bin/bash

set -e

# --------------------------------------------------
# Environment (dev | qa | prod)
# --------------------------------------------------
ENVIRONMENT=${1:-dev}
API_BASE_URL="https://${ENVIRONMENT}.app.kernelmind.io"

cleanup() {
  echo ""
  echo "Stopping services..."

  if [ -n "$GATEWAY_PID" ]; then
    kill $GATEWAY_PID 2>/dev/null || true
  fi

  if [ -n "$UI_PID" ]; then
    kill $UI_PID 2>/dev/null || true
  fi

  wait
  echo "All services stopped"
  exit 0
}

trap cleanup INT TERM

# --------------------------------------------------

echo "Using environment: $ENVIRONMENT"
echo "Remote backend: $API_BASE_URL"

echo "Writing next.config.ts in app-ui ..."

cat > next.config.ts <<EOF
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const apiDestination = "${API_BASE_URL}";

    return [
      // AUTH → LOCAL gateway
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:10000/api/auth/:path*",
      },
      // EVERYTHING ELSE → REMOTE backend
      {
        source: "/api/:path*",
        destination: \`\${apiDestination}/api/:path*\`,
      },
    ];
  },
};

export default nextConfig;
EOF

echo "next.config.ts updated"

# --------------------------------------------------

echo "Starting gateway..."
cd ../gateway
cargo run -- config.yaml &
GATEWAY_PID=$!
cd ..

# --------------------------------------------------

echo "Starting app-ui..."
export API_BASE_URL="$API_BASE_URL"

cd app-ui
npm run dev &
UI_PID=$!
cd ..

# --------------------------------------------------

echo "Waiting for services to start..."
sleep 5

echo "Opening browser at http://localhost:20000"

open http://localhost:20000 || xdg-open http://localhost:20000 || true

echo "Local environment running (Ctrl+C to stop)"

wait