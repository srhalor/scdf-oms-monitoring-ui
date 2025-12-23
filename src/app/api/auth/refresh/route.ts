import { NextResponse } from 'next/server'
import { getServerCookie } from '@/utils/cookieUtils'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import { updateSession } from '@/lib/auth/sessionManager'
import { exchangeClientCredentials, exchangeJwtBearer } from '@/lib/auth/tokenService'

export async function POST() {
  try {
    const isProduction = !AUTH_CONFIG.isDevelopment
    let tokenData

    if (isProduction) {
      // Production: Refresh using SSO Cookie (JWT Bearer Flow)
      const assertion = await getServerCookie(AUTH_CONFIG.sso.cookieName)

      if (!assertion) {
        return NextResponse.json({ error: 'SSO cookie missing' }, { status: 401 })
      }


      tokenData = await exchangeJwtBearer(assertion)
    } else {
      // Development: Refresh using Client Credentials
      tokenData = await exchangeClientCredentials()
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
