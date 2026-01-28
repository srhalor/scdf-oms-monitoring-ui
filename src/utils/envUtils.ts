/**
 * Environment utility helpers
 * Centralises NODE_ENV checks and local-development overrides
 *
 * NOTE: This module intentionally avoids importing `ENV_CONFIG` to prevent
 * circular initialization when `env.config` reads values that rely on this
 * helper. Read values directly from `process.env` instead.
 */

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

export function isDevelopment(): boolean {
  // The standalone server may set NODE_ENV to 'production' at runtime.
  // Allow explicit override via FORCE_DEV_LOGIN and auto-detect localhost SSO URL
  if (process.env.FORCE_DEV_LOGIN === 'true') {
    return true
  }
  const ssoUrl = process.env.SSO_LOGIN_URL || ''
  if (ssoUrl.includes('localhost')) {
    return true
  }
  return process.env.NODE_ENV === 'development'
}

export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

export function shouldEnableDevLogin(): boolean {
  return isDevelopment()
}

export default { isProduction, isDevelopment, isTest, shouldEnableDevLogin }
