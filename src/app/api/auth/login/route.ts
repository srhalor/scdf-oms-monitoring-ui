import { NextResponse } from 'next/server'
import axios from 'axios'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import { extractUserInfo } from '@/lib/auth/jwtUtils'
import { createSession } from '@/lib/auth/sessionManager'
import { exchangeClientCredentials } from '@/lib/auth/tokenService'

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
    const { baseUrl } = AUTH_CONFIG.oidm

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
    try {
      // Exchange credentials for token
      const tokenData = await exchangeClientCredentials()

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
