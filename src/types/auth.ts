export type AuthMode = 'development' | 'production'

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface DecodedToken {
  iss: string
  aud: string[]
  exp: number
  jti: string
  iat: number
  sub: string
  client: string
  scope: string[]
  domain: string
  v: string
  rem_exp: number
}

export interface User {
  username: string
  name: string
  email: string
  initials: string
}

export interface SessionData {
  user: User
  accessToken: string
  expiresAt: number
}
