import type { NextConfig } from 'next'

// Use basePath for production builds (Kubernetes ingress routing)
// Set SKIP_BASEPATH=true in local development to disable
const basePath = process.env.SKIP_BASEPATH === 'true' ? '' : '/sc/oms/monitoring-ui'

const nextConfig: NextConfig = {
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Base path for ingress routing (production only)
  basePath,
  
  // Turbopack configuration (suppress workspace root warning in Azure Pipeline)
  turbopack: {
    root: process.cwd(),
  },
  
  // Expose basePath to client-side code
  env: {
    NEXT_PUBLIC_BASEPATH: basePath,
  },
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // React strict mode
  reactStrictMode: true,

  // Security headers for production
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

export default nextConfig
