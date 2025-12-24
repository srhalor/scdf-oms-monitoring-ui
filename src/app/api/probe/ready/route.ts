import { NextResponse } from 'next/server'
import { ENV_CONFIG } from '@/config/env.config'

/**
 * Kubernetes Readiness Probe Endpoint
 *
 * Returns 200 if the application is ready to receive traffic.
 * Checks that required configuration is present.
 * This endpoint is unauthenticated for K8s probe access.
 *
 * Usage in Helm:
 * readinessProbe:
 *   httpGet:
 *     path: /api/probe/ready
 *     port: 3000
 *   initialDelaySeconds: 5
 *   periodSeconds: 10
 *   timeoutSeconds: 5
 *   failureThreshold: 3
 */
export async function GET() {
  const checks: Record<string, boolean> = {
    // Check essential configuration is available
    apiConfigured: !!ENV_CONFIG.api.baseUrl,
    ssoConfigured: !!ENV_CONFIG.sso.loginUrl,
  }

  const allHealthy = Object.values(checks).every(Boolean)

  if (!allHealthy) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        checks,
      },
      { status: 503 }
    )
  }

  return NextResponse.json(
    {
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: 200 }
  )
}
