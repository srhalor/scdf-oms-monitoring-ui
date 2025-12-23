import { SignJWT, jwtVerify } from 'jose'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import { getServerCookie, setServerCookie, deleteServerCookie } from '@/utils/cookieUtils'
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
  const sessionToken = await getServerCookie(AUTH_CONFIG.session.cookieName)
  if (!sessionToken) return null
  return await decryptSession(sessionToken)
}

/**
 * Create new session and set HTTP-only cookie
 * Secure, SameSite=Lax for AKS deployment
 */
export async function createSession(data: SessionData): Promise<void> {
  const sessionToken = await encryptSession(data)

  await setServerCookie(AUTH_CONFIG.session.cookieName, sessionToken, {
    httpOnly: true,
    secure: !AUTH_CONFIG.isDevelopment,
    sameSite: 'lax',
    maxAge: AUTH_CONFIG.session.maxAge,
    path: '/',
  })
}

/**
 * Delete session cookie
 */
export async function deleteSession(): Promise<void> {
  await deleteServerCookie(AUTH_CONFIG.session.cookieName)
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
