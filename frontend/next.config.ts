import type { NextConfig } from "next";

const apiOrigin = process.env.API_ORIGIN?.trim().replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    if (!apiOrigin) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiOrigin}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
