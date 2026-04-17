import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow reading files from the posts directory at build time
  serverExternalPackages: ['gray-matter'],
  // Image optimization
  images: {
    unoptimized: true,
  },
  // 输出独立目录，用于 Docker 部署
  output: 'standalone',
};

export default nextConfig;
