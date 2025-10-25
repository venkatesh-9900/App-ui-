import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },  
// /* ENABLE FOR LOCAL DEVELOPMENT */
//   async rewrites() {
//     // Get API destination from environment variable, with fallback for development
//     const apiDestination = process.env.API_BASE_URL
//     return [
//       {
//         source: "/api/:path*",
//         destination: `${apiDestination}/api/:path*`,
//       },
//     ];
//   },
};

export default nextConfig;
