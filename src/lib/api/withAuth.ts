import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/auth/authHelpers'
import { createAuthenticatedClient } from '@/lib/api/apiClient'
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
        return NextResponse.json(
          { error: 'Unauthorized - No valid session' },
          { status: 401 }
        )
      }

      // Create authenticated client with all required headers
      const client = createAuthenticatedClient(accessToken)

      // Call the actual handler with the authenticated client
      return await handler(request, client)
    } catch (error) {
      console.error('API route error:', error)

      // Handle authentication errors
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return NextResponse.json(
          { error: 'Unauthorized - Invalid token' },
          { status: 401 }
        )
      }

      // Generic error response
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Optional: Handler without parameters (for routes that don't need request)
 */
export type SimpleAuthenticatedRouteHandler = (
  client: AxiosInstance
) => Promise<NextResponse>

export function withAuthSimple(handler: SimpleAuthenticatedRouteHandler) {
  return withAuth(async (_request, client) => handler(client))
}
