import { jwtDecode } from 'jwt-decode'
import type { DecodedToken, User } from '@/types/auth'

export const decodeToken = (token: string): DecodedToken => {
  return jwtDecode<DecodedToken>(token)
}

export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token)
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

export const extractUserInfo = (token: string): User => {
  const decoded = decodeToken(token)
  
  // For CLIENT_CREDENTIALS tokens, create mock user from available data
  const username = decoded.sub || decoded.client
  
  const displayName = 'Development User'
  
  // Generate initials from display name
  const initials = displayName
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
  
  // Create mock email from domain
  const email = `dev.user@atradius.com`

  return {
    username,
    name: displayName,
    email,
    initials,
  }
}

export const getTokenExpiryTime = (token: string): number => {
  const decoded = decodeToken(token)
  return decoded.exp * 1000 // Convert to milliseconds
}
