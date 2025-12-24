import { User } from '@/types/auth'
import { ENV_CONFIG } from '@/config/env.config'
import { logger } from '@/lib/logger'
import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import https from 'node:https'

const { baseUrl } = ENV_CONFIG.api
const { originService, originApplication } = ENV_CONFIG.headers

/**
 * Create axios instance with base configuration
 * Adds required headers to all requests
 *
 * @param user - User object from session
 * @returns Axios instance with interceptors
 */
export const createApiClient = (user: User | null): AxiosInstance => {
  const client = axios.create({
    baseURL: baseUrl,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    // Disable SSL verification in development (self-signed certificates)
    httpsAgent:
      process.env.NODE_ENV === 'development'
        ? new https.Agent({ rejectUnauthorized: false })
        : undefined,
  })

  // Request interceptor: Add required headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add Atradius-Origin headers
      config.headers['Atradius-Origin-Service'] = originService
      config.headers['Atradius-Origin-Application'] = originApplication
      config.headers['Atradius-Origin-User'] = user?.name || 'Development User'

      logger.debug('APIClient', `${config.method?.toUpperCase()} ${config.url}`)
      return config
    },
    error => {
      logger.error('APIClient', 'Request interceptor error', error)
      return Promise.reject(error)
    }
  )

  // Response interceptor: Handle errors
  client.interceptors.response.use(
    response => {
      logger.debug('APIClient', `Response ${response.status} from ${response.config.url}`)
      return response
    },
    error => {
      const status = error.response?.status
      const url = error.config?.url
      logger.error('APIClient', `Request failed: ${status} ${url}`, error.message)
      
      // Handle 401 Unauthorized - could trigger re-authentication
      if (status === 401) {
        logger.warn('API', 'Unauthorized request - token may be expired')
        // Future: trigger token refresh or redirect to login
      }

      return Promise.reject(error)
    }
  )

  return client
}

/**
 * Create API client with Authorization header (server-side only)
 * Adds Authorization header to all requests
 * Adds required headers to all requests
 *
 * @param accessToken - JWT token from session
 * @param user - User object from session
 * @returns Axios instance with interceptors
 */
export const createAuthenticatedClient = (
  accessToken: string,
  user: User | null
): AxiosInstance => {
  const client = createApiClient(user)

  // Add Authorization header
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers['Authorization'] = `Bearer ${accessToken}`
    return config
  })

  return client
}
