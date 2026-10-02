import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // This application has no uploads. Keeping action bodies small reduces the
    // amount of memory an attacker can make the server allocate per request.
    serverActions: {
      bodySizeLimit: '32kb',
    },
  },
};

export default nextConfig;
