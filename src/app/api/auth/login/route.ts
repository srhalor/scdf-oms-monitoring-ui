import { NextResponse } from 'next/server'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import { extractUserInfo } from '@/lib/auth/jwtUtils'
import { createSession } from '@/lib/auth/sessionManager'
import type { TokenResponse } from '@/types/auth'

/**
 * Development Mode Token API
 * Exchanges client credentials for access token (server-side only)
 * Client credentials never exposed to browser
 */
export async function POST() {
  try {
    // Get server-side credentials
    const clientId = process.env.OAUTH_CLIENT_ID
    const clientSecret = process.env.OAUTH_CLIENT_SECRET
    const { baseUrl, domain, scope } = AUTH_CONFIG.oidm

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Server configuration missing' },
        { status: 500 }
      )
    }

    if (!baseUrl) {
      return NextResponse.json({ error: 'OIDM URL not configured' }, { status: 500 })
    }

    // Call OAuth token endpoint
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

    // For development with self-signed certificates, disable SSL verification
    // @ts-expect-error - Node.js global for disabling SSL verification
    if (process.env.NODE_ENV === 'development' && global.fetch) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    }

    const response = await fetch(`${baseUrl}/oauth2/rest/token`, {
      method: 'POST',
      headers: {
        'X-OAUTH-IDENTITY-DOMAIN-NAME': domain,
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        grant_type: 'CLIENT_CREDENTIALS',
        scope,
      }),
    })

    // Re-enable SSL verification after request
    if (process.env.NODE_ENV === 'development') {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
    }

    if (!response.ok) {
      const error = await response.text()
      console.error('Token request failed:', error)
      return NextResponse.json(
        { error: `Authentication failed: ${error}` },
        { status: response.status }
      )
    }

    const tokenData: TokenResponse = await response.json()

    // Extract user info from JWT
    const user = extractUserInfo(tokenData.access_token)

    // Create server-side session
    const expiresAt = Date.now() + tokenData.expires_in * 1000
    await createSession({
      user,
      accessToken: tokenData.access_token,
      expiresAt,
    })

    // Return success (no sensitive data in response)
    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error('Token API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
