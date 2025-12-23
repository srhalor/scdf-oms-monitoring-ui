import axios from 'axios'
import https from 'https'
import { AUTH_CONFIG } from '@/utils/constants/authConfig'
import type { TokenResponse } from '@/types/auth'

const { baseUrl, domain, scope } = AUTH_CONFIG.oidm

const httpsAgent = process.env.NODE_ENV === 'development'
  ? new https.Agent({ rejectUnauthorized: false })
  : undefined

/**
 * Exchange Client Credentials for Token (Development)
 */
export async function exchangeClientCredentials(): Promise<TokenResponse> {
  const clientId = process.env.OAUTH_CLIENT_ID
  const clientSecret = process.env.OAUTH_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Server configuration missing: Client ID or Secret')
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

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

  return response.data
}

/**
 * Exchange Assertion for Token (Production/SSO)
 */
export async function exchangeJwtBearer(assertion: string): Promise<TokenResponse> {
  const response = await axios.post<TokenResponse>(
    `${baseUrl}/oauth2/rest/token`,
    new URLSearchParams({
      grant_type: 'JWT_BEARER',
      scope,
      assertion,
    }),
    {
      headers: {
        'X-OAUTH-IDENTITY-DOMAIN-NAME': domain,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      httpsAgent,
    }
  )

  return response.data
}
