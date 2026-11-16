import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Emits a self-contained server in .next/standalone for the Docker image
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
};

export default nextConfig;
