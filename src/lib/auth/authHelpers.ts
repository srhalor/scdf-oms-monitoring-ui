import { getSession } from './sessionManager'
import type { User } from '@/types/auth'

/**
 * Get current authenticated user
 * Server-side only - use in server components and route handlers
 */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  return session?.user || null
}
/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession()
  return session !== null && session.expiresAt > Date.now()
}

/**
 * Get access token for API calls
 * Server-side only - never expose to client
 */
export async function getAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.accessToken || null
}
