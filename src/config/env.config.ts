/**
 * Runtime Environment Configuration
 * All values are read at runtime from environment variables (Helm ConfigMaps)
 * No NEXT_PUBLIC_* prefix - these are server-side only
 */
import { LogLevel } from '@/types/logging'
import { isDevelopment } from '@/utils/envUtils'

export const ENV_CONFIG = {
  logging: {
    enabled: isDevelopment() || process.env.ENABLE_LOGGING === 'true',
    minLevel: (process.env.LOG_LEVEL as LogLevel) || LogLevel.info,
    includeTimestamp: isDevelopment(),
    // JSON format for ELK/structured logging - enable in production for log aggregation
    jsonFormat: process.env.LOG_FORMAT === 'json',
  },

  oidm: {
    baseUrl: process.env.OIDM_BASE_URL || '',
    domain: process.env.OAUTH_DOMAIN || '',
    scope: process.env.OAUTH_SCOPE || '',
    clientId: process.env.OAUTH_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  },

  sso: {
    loginUrl: process.env.SSO_LOGIN_URL || 'http://localhost:3000',
    logoutUrl: process.env.SSO_LOGOUT_URL || 'http://localhost:3000',
    cookieName: process.env.OAUTH_TOKEN_COOKIE_NAME || 'OAUTH_TOKEN',
  },

  headers: {
    originService: process.env.ORIGIN_SERVICE || 'oms-monitoring-ui',
    originApplication: process.env.ORIGIN_APPLICATION || 'OMS-Monitoring-Tool',
  },

  session: {
    cookieName: process.env.SESSION_COOKIE_NAME || 'oms-session',
    secret: process.env.SESSION_SECRET || 'dev-secret-change-in-production',
    maxAge: Number(process.env.SESSION_MAX_AGE) || 3600, // 1 hour in seconds
  },

  refresh: {
    bufferSeconds: Number(process.env.REFRESH_BUFFER_SECONDS) || 60, // Refresh 60s before expiry
  },

  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:8080',
  },
}