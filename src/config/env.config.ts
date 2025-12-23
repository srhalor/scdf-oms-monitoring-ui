export const ENV_CONFIG = {
  isDevelopment: process.env.NEXT_PUBLIC_AUTH_MODE === 'development',

  oidm: {
    baseUrl: process.env.NEXT_PUBLIC_OIDM_BASE_URL || '',
    domain: process.env.NEXT_PUBLIC_OAUTH_DOMAIN || '',
    scope: process.env.NEXT_PUBLIC_OAUTH_SCOPE || '',
    clientId: process.env.OAUTH_CLIENT_ID || '',
    clientSecret: process.env.OAUTH_CLIENT_SECRET || '',
  },

  sso: {
    loginUrl: process.env.NEXT_PUBLIC_SSO_LOGIN_URL || '',
    logoutUrl: process.env.NEXT_PUBLIC_SSO_LOGOUT_URL || '',
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
