import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, getCurrentUser } from '@/lib/auth/authHelpers'
import { createAuthenticatedClient } from '@/lib/api/apiClient'
import { logger } from '@/lib/logger'
import type { AxiosInstance } from 'axios'

/**
 * API Route Handler with authenticated client
 */
export type AuthenticatedRouteHandler = (
  request: NextRequest,
  client: AxiosInstance
) => Promise<NextResponse>

/**
 * Higher-order function to wrap API routes with authentication
 * Adds required headers to all requests
 * Adds Authorization header to all requests
 *
 * Usage:
 * ```ts
 * export const GET = withAuth(async (request, client) => {
 *   const response = await client.get('/api/v2/data')
 *   return NextResponse.json(response.data)
 * })
 * ```
 *
 * @param handler - Route handler that receives authenticated axios client
 * @returns Next.js route handler with automatic auth validation
 */
export function withAuth(handler: AuthenticatedRouteHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Get access token from session
      const accessToken = await getAccessToken()

      if (!accessToken) {
        return NextResponse.json({ error: 'Unauthorized - No valid session' }, { status: 401 })
      }

      const user = await getCurrentUser()

      // Create authenticated client with all required headers
      const client = createAuthenticatedClient(accessToken, user)

      // Call the actual handler with the authenticated client
      return await handler(request, client)
    } catch (error) {
      logger.error('API', 'Route handler error', error)

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json({ error: 'Unauthorized - Invalid token' }, { status: 401 })
      }

      // Generic error response
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
  }
}

/**
 * Optional: API route handler with authenticated client
 */
export type SimpleAuthenticatedRouteHandler = (client: AxiosInstance) => Promise<NextResponse>

/**
 * Higher-order function to wrap API routes with authentication
 * This is a convenience wrapper for routes that don't need request parameters
 * Adds required headers to all requests
 * Adds Authorization header to all requests
 *
 * Usage:
 * ```ts
 * export const GET = withAuthSimple(async (client) => {
 *   const response = await client.get('/api/v2/data')
 *   return NextResponse.json(response.data)
 * })
 * ```
 */
export function withAuthSimple(handler: SimpleAuthenticatedRouteHandler) {
  return withAuth(async (_request, client) => handler(client))
}
