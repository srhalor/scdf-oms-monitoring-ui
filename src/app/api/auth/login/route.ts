import { NextResponse } from 'next/server'
import axios from 'axios'
import { extractUserInfo } from '@/lib/auth/jwtUtils'
import { createSession } from '@/lib/auth/sessionManager'
import { exchangeClientCredentials } from '@/lib/auth/tokenService'

/**
 * Development Mode Token API
 * Exchanges client credentials for access token (server-side only)
 * Client credentials never exposed to browser
 */
export async function POST() {
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
    console.error('Token API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
