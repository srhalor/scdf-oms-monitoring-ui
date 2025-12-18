import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,
}

export default nextConfig
