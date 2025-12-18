import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth/sessionManager'

/**
 * Session Status API
 * Returns current user info if authenticated
 * Used by client components to check auth status
 */
export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    // Return user info (no access token)
    return NextResponse.json({
      authenticated: true,
      user: session.user,
    })
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}
