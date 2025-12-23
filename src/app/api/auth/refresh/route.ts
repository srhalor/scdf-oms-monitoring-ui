import { NextResponse } from 'next/server'
import { getServerCookie } from '@/utils/cookieUtils'
import { ENV_CONFIG } from '@/config/env.config'
import { updateSession } from '@/lib/auth/sessionManager'
import { exchangeClientCredentials, exchangeJwtBearer } from '@/lib/auth/tokenService'

export async function POST() {
  try {
    let tokenData

    if (ENV_CONFIG.isDevelopment) {
      // Development: Refresh using Client Credentials
      tokenData = await exchangeClientCredentials()
    } else {
      // Production: Refresh using SSO Cookie (JWT Bearer Flow)
      const assertion = await getServerCookie(ENV_CONFIG.sso.cookieName)

      if (!assertion) {
        return NextResponse.json({ error: 'SSO cookie missing' }, { status: 401 })
      }

      tokenData = await exchangeJwtBearer(assertion)
    }

    // Update Session with new Access Token
    const expiresAt = Date.now() + tokenData.expires_in * 1000

    await updateSession({
      accessToken: tokenData.access_token,
      expiresAt,
    })

    return NextResponse.json({ success: true, expiresIn: tokenData.expires_in })
  } catch (error) {
    console.error('Token Refresh Failed:', error)
    return NextResponse.json({ error: 'Refresh failed' }, { status: 401 })
  }
}
