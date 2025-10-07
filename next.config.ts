import type { NextConfig } from "next";

const nextConfig: NextConfig = {
<<<<<<< HEAD
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
=======
  devIndicators: false,
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
>>>>>>> 332fc36a941c505e50583ca28baea7de11c244ae
  },
};

export default nextConfig;
<<<<<<< HEAD
=======

>>>>>>> 332fc36a941c505e50583ca28baea7de11c244ae
