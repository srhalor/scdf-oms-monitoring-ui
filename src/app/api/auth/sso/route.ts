import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import { extractUserInfo } from '@/lib/auth/jwtUtils'
import { createSession } from '@/lib/auth/sessionManager'
import { exchangeJwtBearer } from '@/lib/auth/tokenService'
import { cookies } from 'next/headers'

/**
 * SSO Production Auth Handler
 * Exchanges OAUTH_TOKEN (Assertion) for Access Token via JWT_BEARER flow
 */
export async function GET(request: NextRequest) {
  try {
    const ssoCookie = (await cookies()).get(AUTH_CONFIG.sso.cookieName)
    const assertion = ssoCookie?.value
    const nextUrl = request.nextUrl.searchParams.get('next') || '/dashboard'

    if (!assertion) {
      return NextResponse.redirect(new URL(AUTH_CONFIG.sso.loginUrl)) // Fallback to SSO login
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

      // Redirect to original destination
      return NextResponse.redirect(new URL(nextUrl, request.url))

    } catch (error) {
       console.error('SSO Token Exchange Failed:', error)
       // If exchange fails, redirect to SSO login to get a fresh assertion
       return NextResponse.redirect(new URL(AUTH_CONFIG.sso.loginUrl))
    }

  } catch (error) {
    console.error('SSO Route Error:', error)
    return NextResponse.redirect(new URL(AUTH_CONFIG.sso.loginUrl))
  }
}
