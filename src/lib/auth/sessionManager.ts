import { SignJWT, jwtVerify } from 'jose'
import { ENV_CONFIG } from '@/config/env.config'
import { getServerCookie, setServerCookie, deleteServerCookie } from '@/utils/cookieUtils'
import type { SessionData } from '@/types/auth'

const secret = new TextEncoder().encode(ENV_CONFIG.session.secret)

/**
 * Encrypt session data into JWT token
 * Stateless - works across multiple AKS replicas
 */
export async function encryptSession(data: SessionData): Promise<string> {
  return await new SignJWT(data as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${ENV_CONFIG.session.maxAge}s`)
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
  const sessionToken = await getServerCookie(ENV_CONFIG.session.cookieName)
  if (!sessionToken) return null
  return await decryptSession(sessionToken)
}

/**
 * Create new session and set HTTP-only cookie
 * Secure, SameSite=Lax for AKS deployment
 */
export async function createSession(data: SessionData): Promise<void> {
  const sessionToken = await encryptSession(data)

  await setServerCookie(ENV_CONFIG.session.cookieName, sessionToken, {
    httpOnly: true,
    secure: !ENV_CONFIG.isDevelopment,
    sameSite: 'lax',
    maxAge: ENV_CONFIG.session.maxAge,
    path: '/',
  })
}

/**
 * Delete session cookie
 */
export async function deleteSession(): Promise<void> {
  await deleteServerCookie(ENV_CONFIG.session.cookieName)
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
