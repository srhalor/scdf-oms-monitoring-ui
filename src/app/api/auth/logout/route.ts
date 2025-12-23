import { NextResponse } from 'next/server'
import { deleteServerCookie } from '@/utils/cookieUtils'
import { deleteSession } from '@/lib/auth/sessionManager'
import { ENV_CONFIG } from '@/config/env.config'

/**
 * Logout API
 * Clears session cookie and returns logout URL
 */
export async function POST() {
  try {
    // Delete session
    await deleteSession()

    // Clear SSO cookie in production
    await deleteServerCookie(ENV_CONFIG.sso.cookieName)

    // Return success
    return NextResponse.json({
      success: true,
      redirectUrl: ENV_CONFIG.isDevelopment ? '/login' : ENV_CONFIG.sso.logoutUrl,
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
