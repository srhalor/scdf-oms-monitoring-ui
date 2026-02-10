import { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'

/**
 * Server-side Cookie Utilities
 * Wraps next/headers cookies() to provide a simplified async API.
 */

export async function getServerCookie(name: string): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(name)?.value
}

export async function setServerCookie(
  name: string, 
  value: string, 
  options: Partial<ResponseCookie> = {}
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(name, value, options)
}

export async function deleteServerCookie(name: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(name)
}
