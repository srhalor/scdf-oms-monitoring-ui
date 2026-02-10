import axios from 'axios'
import { ENV_CONFIG } from '@/config/env.config'
import { httpsAgent } from '@/lib/api/certHelper'
import { logger } from '@/lib/logger'
import type { TokenResponse } from '@/types/auth'

const { clientId, clientSecret, baseUrl, domain, scope } = ENV_CONFIG.oidm


/**
 * Exchange Client Credentials for Token (Development)
 */
export async function exchangeClientCredentials(): Promise<TokenResponse> {
  logger.debug('TokenService', 'Exchanging client credentials')
  
  if (!clientId || !clientSecret) {
    logger.error('TokenService', 'Missing client credentials configuration')
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
  logger.debug('TokenService', 'Exchanging JWT bearer assertion')
  
  if (!baseUrl) {
    logger.error('TokenService', 'OIDM URL not configured')
    throw new Error('OIDM URL not configured')
  }

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
