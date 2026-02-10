import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // standalone output for Railway deployment (set STANDALONE_BUILD=true on Railway)
  ...(process.env.STANDALONE_BUILD === 'true'
    ? { output: 'standalone' as const }
    : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;
