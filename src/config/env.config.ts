export const ENV_CONFIG = {
  logging: {
    enabled: process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true',
    minLevel: (process.env.NEXT_PUBLIC_LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error') || 'debug',
    includeTimestamp: process.env.NODE_ENV === 'development',
    // JSON format for ELK/structured logging - enable in production for log aggregation
    jsonFormat: process.env.NEXT_PUBLIC_LOG_FORMAT === 'json',
  },

  oidm: {
    baseUrl: process.env.NEXT_PUBLIC_OIDM_BASE_URL || '',
    domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN || '',
    scope: process.env.NEXT_PUBLIC_OAUTH_SCOPE || '',
    clientId: process.env.OAUTH_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  },

  sso: {
    loginUrl: process.env.NEXT_PUBLIC_SSO_LOGIN_URL || 'http://localhost:3000',
    logoutUrl: process.env.NEXT_PUBLIC_SSO_LOGOUT_URL || 'http://localhost:3000',
    cookieName: process.env.NEXT_PUBLIC_OAUTH_TOKEN_COOKIE_NAME || 'OAUTH_TOKEN',
  },

  headers: {
    originService: process.env.NEXT_PUBLIC_ORIGIN_SERVICE || 'oms-monitoring-ui',
    originApplication: process.env.NEXT_PUBLIC_ORIGIN_APPLICATION || 'OMS-Monitoring-Tool',
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
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
  },
}
