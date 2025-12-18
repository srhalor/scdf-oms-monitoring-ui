import { NextResponse } from 'next/server'
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

    // Return success
    return NextResponse.json({
      success: true,
      redirectUrl: AUTH_CONFIG.mode === 'production' ? AUTH_CONFIG.sso.logoutUrl : '/login',
    })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
