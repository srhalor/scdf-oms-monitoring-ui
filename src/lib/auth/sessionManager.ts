import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import type { SessionData } from '@/types/auth'

const secret = new TextEncoder().encode(AUTH_CONFIG.session.secret)

/**
 * Encrypt session data into JWT token
 * Stateless - works across multiple AKS replicas
 */
export async function encryptSession(data: SessionData): Promise<string> {
  return await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CONFIG.session.maxAge}s`)
    .sign(secret)
}

/**
 * Decrypt and verify session JWT token
 */
export async function decryptSession(token: string): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as SessionData
  } catch {
    return null
  }
}

/**
 * Get current session from HTTP-only cookie
 * Server-side only - never exposed to client
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(AUTH_CONFIG.session.cookieName)

  if (!sessionCookie?.value) {
    return null
  }

  const session = await decryptSession(sessionCookie.value)

  // Check if session is expired
  if (session && session.expiresAt < Date.now()) {
    await deleteSession()
    return null
  }

  return session
}

/**
 * Create new session and set HTTP-only cookie
 * Secure, SameSite=Lax for AKS deployment
 */
export async function createSession(data: SessionData): Promise<void> {
  const cookieStore = await cookies()
  const sessionToken = await encryptSession(data)

  cookieStore.set(AUTH_CONFIG.session.cookieName, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: AUTH_CONFIG.session.maxAge,
    path: '/',
  })
}

/**
 * Delete session cookie
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(AUTH_CONFIG.session.cookieName)
}

/**
 * Update existing session with new data
 */
export async function updateSession(data: Partial<SessionData>): Promise<void> {
  const currentSession = await getSession()

  if (!currentSession) {
    throw new Error('No active session to update')
  }

  await createSession({
    ...currentSession,
    ...data,
  })
}
