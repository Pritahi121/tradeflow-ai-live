import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Fix for Vercel path issues
  distDir: '.next',
  // Ensure proper static file handling
  generateEtags: false,
  // Handle API routes properly
  async rewrites() {
    return [];
  },
  // Images optimization for Vercel
  images: {
    domains: ['isnfyeoabzaopqqmmgqz.supabase.co'],
  },
};

export default nextConfig;
