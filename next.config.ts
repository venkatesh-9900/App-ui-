import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    const remoteBackend = "https://qa.app.kernelmind.ai";

    return [
      // AUTH → LOCAL gateway (so you can dev/debug the gateway's
      // OAuth + token-exchange flow locally)
      {
        source: "/api/auth/:path*",
        destination: "http://localhost:10000/api/auth/:path*",
      },
      // EVERYTHING ELSE → REMOTE gateway (which already has the full
      // route table + IAM data to reach internal backend services)
      {
        source: "/api/:path*",
        destination: `${remoteBackend}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
