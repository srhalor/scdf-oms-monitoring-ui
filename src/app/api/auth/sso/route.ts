import { NextResponse } from 'next/server'
import { ENV_CONFIG } from '@/config/env.config'
import { extractUserInfo } from '@/lib/auth/jwtUtils'
import { createSession } from '@/lib/auth/sessionManager'
import { exchangeJwtBearer } from '@/lib/auth/tokenService'
import { logger } from '@/lib/logger'
import { getServerCookie } from '@/utils/cookieUtils'
import type { NextRequest } from 'next/server'

// ...
export async function GET(request: NextRequest) {
  const nextUrl = request.nextUrl.searchParams.get('next') || '/'
  logger.info('SSOAPI', 'SSO authentication request', { nextUrl })
  
  try {
    const assertion = await getServerCookie(ENV_CONFIG.sso.cookieName)

    if (!assertion) {
      logger.warn('SSOAPI', 'No SSO cookie found, redirecting to SSO login')
      // Fallback to SSO login
      return NextResponse.redirect(new URL(ENV_CONFIG.sso.loginUrl))
    }
    logger.debug('SSOAPI', 'SSO cookie found, exchanging for token')

    try {
      // Exchange Assertion for Access Token
      const tokenData = await exchangeJwtBearer(assertion)
      logger.debug('SSOAPI', 'Token exchange successful')

      // Extract user info from the NEW access token
      const user = extractUserInfo(tokenData.access_token)
      logger.debug('SSOAPI', 'User info extracted', { userName: user.name })

      // Create Session
      const expiresAt = Date.now() + tokenData.expires_in * 1000
      await createSession({
        user,
        accessToken: tokenData.access_token,
        expiresAt,
      })
      
      // Set user context for logging
      logger.setUser({ name: user.name, email: user.email })
      logger.info('SSOAPI', 'SSO session created successfully', { userName: user.name, nextUrl })

      // Redirect to original destination
      return NextResponse.redirect(new URL(nextUrl, request.url))
    } catch (error) {
      logger.error('SSOAPI', 'Token exchange failed', error)
      // If exchange fails, redirect to SSO login to get a fresh assertion
      return NextResponse.redirect(new URL(ENV_CONFIG.sso.loginUrl))
    }
  } catch (error) {
    logger.error('SSOAPI', 'Route error', error)
    return NextResponse.redirect(new URL(ENV_CONFIG.sso.loginUrl))
  }
}
