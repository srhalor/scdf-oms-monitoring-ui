import { NextResponse } from 'next/server'
import { deleteServerCookie } from '@/utils/cookieUtils'
import { deleteSession } from '@/lib/auth/sessionManager'
import { ENV_CONFIG } from '@/config/env.config'
import { logger } from '@/lib/logger'

/**
 * Logout API
 * Clears session cookie and returns logout URL
 */
export async function POST() {
  logger.info('LogoutAPI', 'Logout request received')
  
  try {
    // Delete session
    await deleteSession()
    logger.debug('LogoutAPI', 'Session deleted')

    // Clear SSO cookie in production
    await deleteServerCookie(ENV_CONFIG.sso.cookieName)
    logger.debug('LogoutAPI', 'SSO cookie cleared')

    const redirectUrl =
      process.env.NODE_ENV === 'development' ? '/login' : ENV_CONFIG.sso.logoutUrl
    logger.info('LogoutAPI', 'Logout successful', { redirectUrl })

    // Return success
    return NextResponse.json({
      success: true,
      redirectUrl,
    })
  } catch (error) {
    logger.error('LogoutAPI', 'Logout error', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
