import { NextResponse } from 'next/server'
import { deleteServerCookie } from '@/utils/cookieUtils'
import { deleteSession } from '@/lib/auth/sessionManager'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'

/**
 * Logout API
 * Clears session cookie and returns logout URL
 */
export async function POST() {
  try {
    // Delete session
    await deleteSession()

    // Clear SSO cookie in production
    await deleteServerCookie(AUTH_CONFIG.sso.cookieName)

    // Return success
    return NextResponse.json({
      success: true,
      redirectUrl: AUTH_CONFIG.isDevelopment ? '/login' : AUTH_CONFIG.sso.logoutUrl,
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
