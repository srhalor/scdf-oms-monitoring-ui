import { NextResponse } from 'next/server'

/**
 * Kubernetes Startup Probe Endpoint
 *
 * Returns 200 once the application has completed startup.
 * Used to prevent liveness/readiness probes during slow startups.
 * This endpoint is unauthenticated for K8s probe access.
 *
 * Usage in Helm:
 * startupProbe:
 *   httpGet:
 *     path: /api/probe/startup
 *     port: 3000
 *   initialDelaySeconds: 0
 *   periodSeconds: 5
 *   timeoutSeconds: 5
 *   failureThreshold: 30  # 30 * 5 = 150 seconds max startup time
 */
export async function GET() {
  // For Next.js, if this endpoint responds, the app is started
  return NextResponse.json(
    {
      status: 'started',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
    },
    { status: 200 }
  )
}
