import { NextResponse } from 'next/server'

/**
 * Kubernetes Liveness Probe Endpoint
 *
 * Returns 200 if the application is running and can accept requests.
 * This endpoint is unauthenticated for K8s probe access.
 *
 * Usage in Helm:
 * livenessProbe:
 *   httpGet:
 *     path: /api/probe/live
 *     port: 3000
 *   initialDelaySeconds: 10
 *   periodSeconds: 15
 *   timeoutSeconds: 5
 *   failureThreshold: 3
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
