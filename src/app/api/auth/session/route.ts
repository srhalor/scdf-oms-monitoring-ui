import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/sessionManager'
import { logger } from '@/lib/logger'

/**
 * Session Status API
 * Returns current user info if authenticated
 * Used by client components to check auth status
 */
export async function GET() {
  logger.debug('SessionAPI', 'Session check request')
  
  try {
    const session = await getSession()

    if (!session) {
      logger.debug('SessionAPI', 'No active session found')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    const isExpired = session.expiresAt < Date.now()
    if (isExpired) {
      logger.debug('SessionAPI', 'Session expired')
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    logger.debug('SessionAPI', 'Valid session found', { userName: session.user?.name })

    // Return user info (no access token)
    return NextResponse.json({
      authenticated: true,
      user: session.user,
      expiresAt: session.expiresAt,
    })
  } catch (error) {
    logger.error('SessionAPI', 'Session check error', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
