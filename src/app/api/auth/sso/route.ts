import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { ENV_CONFIG } from '@/config/env.config'
import { extractUserInfo } from '@/lib/auth/jwtUtils'
import { createSession } from '@/lib/auth/sessionManager'
import { exchangeJwtBearer } from '@/lib/auth/tokenService'
import { getServerCookie } from '@/utils/cookieUtils'

// ...
export async function GET(request: NextRequest) {
  try {
    const assertion = await getServerCookie(ENV_CONFIG.sso.cookieName)

    if (!assertion) {
      // Fallback to SSO login
      return NextResponse.redirect(new URL(ENV_CONFIG.sso.loginUrl))
    }

    try {
      // Exchange Assertion for Access Token
      const tokenData = await exchangeJwtBearer(assertion)

      // Extract user info from the NEW access token
      const user = extractUserInfo(tokenData.access_token)

      // Create Session
      const expiresAt = Date.now() + tokenData.expires_in * 1000
      await createSession({
        user,
        accessToken: tokenData.access_token,
        expiresAt: expiresAt,
      })

      const nextUrl = request.nextUrl.searchParams.get('next') || '/'
      // Redirect to original destination
      return NextResponse.redirect(new URL(nextUrl, request.url))
    } catch (error) {
      console.error('SSO Token Exchange Failed:', error)
      // If exchange fails, redirect to SSO login to get a fresh assertion
      return NextResponse.redirect(new URL(ENV_CONFIG.sso.loginUrl))
    }
  } catch (error) {
    console.error('SSO Route Error:', error)
    return NextResponse.redirect(new URL(ENV_CONFIG.sso.loginUrl))
  }
}
