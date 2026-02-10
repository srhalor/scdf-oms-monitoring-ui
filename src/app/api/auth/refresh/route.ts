import { NextResponse } from 'next/server'
import { ENV_CONFIG } from '@/config/env.config'
import { updateSession } from '@/lib/auth/sessionManager'
import { exchangeClientCredentials, exchangeJwtBearer } from '@/lib/auth/tokenService'
import { logger } from '@/lib/logger'
import { getServerCookie } from '@/utils/cookieUtils'
import { isDevelopment } from '@/utils/envUtils'

export async function POST() {
  logger.debug('RefreshAPI', 'Token refresh request received')
  
  try {
    let tokenData

    if (isDevelopment()) {
      logger.debug('RefreshAPI', 'Development mode: using client credentials')
      // Development: Refresh using Client Credentials
      tokenData = await exchangeClientCredentials()
    } else {
      // Production: Refresh using SSO Cookie (JWT Bearer Flow)
      const assertion = await getServerCookie(ENV_CONFIG.sso.cookieName)

      if (!assertion) {
        logger.warn('RefreshAPI', 'SSO cookie missing during refresh')
        return NextResponse.json({ error: 'SSO cookie missing' }, { status: 401 })
      }
      logger.debug('RefreshAPI', 'Production mode: using JWT bearer flow')

      tokenData = await exchangeJwtBearer(assertion)
    }

    // Update Session with new Access Token
    const expiresAt = Date.now() + tokenData.expires_in * 1000

    await updateSession({
      accessToken: tokenData.access_token,
      expiresAt,
    })
    logger.info('RefreshAPI', 'Token refreshed successfully', { expiresIn: tokenData.expires_in })

    return NextResponse.json({ success: true, expiresIn: tokenData.expires_in })
  } catch (error) {
    logger.error('RefreshAPI', 'Token refresh failed', error)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
  }
}
