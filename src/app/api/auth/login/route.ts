import { NextResponse } from 'next/server'
import axios from 'axios'
import https from 'https'
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

    // Prepare HTTPS agent for development (self-signed certs)
    const httpsAgent = process.env.NODE_ENV === 'development'
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined

    try {
      const response = await axios.post<TokenResponse>(
        `${baseUrl}/oauth2/rest/token`,
        new URLSearchParams({
          grant_type: 'CLIENT_CREDENTIALS',
          scope,
        }),
        {
          headers: {
            'X-OAUTH-IDENTITY-DOMAIN-NAME': domain,
            'Content-Type': 'application/x-www-form-urlencoded',
            Authorization: `Basic ${credentials}`,
          },
          httpsAgent,
        }
      )

      const tokenData = response.data

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
      if (axios.isAxiosError(error)) {
        console.error('Token request failed:', error.response?.data || error.message)
        return NextResponse.json(
          { error: `Authentication failed: ${error.response?.data || error.message}` },
          { status: error.response?.status || 500 }
        )
      }
      throw error
    }
  } catch (error) {
    console.error('Token API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
