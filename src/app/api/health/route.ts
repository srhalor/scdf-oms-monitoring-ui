import { NextResponse } from 'next/server'
import { withAuthSimple } from '@/lib/api/withAuth'
import type { HealthResponse } from '@/types/health'

/**
 * Health Check API Route
 * withAuthSimple automatically handles:
 * - Token validation
 * - Authorization header injection
 * - Atradius-Origin-* headers
 */
export const GET = withAuthSimple(async (client) => {
  try {
    // Call backend health endpoint - headers are automatically included
    const response = await client.get<HealthResponse>('/health')
    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Health check failed:', error)
    // Return DOWN status on error
    return NextResponse.json({ status: 'DOWN' }, { status: 200 })
  }
})
