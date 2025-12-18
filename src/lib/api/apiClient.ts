import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import https from 'https'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'
const ORIGIN_SERVICE = process.env.NEXT_PUBLIC_ORIGIN_SERVICE || 'oms-monitoring-ui'
const ORIGIN_APPLICATION = process.env.NEXT_PUBLIC_ORIGIN_APPLICATION || 'OMS-Monitoring'

/**
 * Create axios instance with base configuration
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
    // Disable SSL verification in development (self-signed certificates)
    httpsAgent: process.env.NODE_ENV === 'development' 
      ? new https.Agent({ rejectUnauthorized: false })
      : undefined,
  })

  // Request interceptor: Add required headers
  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Add Atradius-Origin headers
      config.headers['Atradius-Origin-Service'] = ORIGIN_SERVICE
      config.headers['Atradius-Origin-Application'] = ORIGIN_APPLICATION
      config.headers['Atradius-Origin-User'] = 'Development User'

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor: Handle errors
  client.interceptors.response.use(
    (response) => response,
    (error) => {
      // Handle 401 Unauthorized - could trigger re-authentication
      if (error.response?.status === 401) {
        console.error('Unauthorized request - token may be expired')
        // Future: trigger token refresh or redirect to login
      }

      return Promise.reject(error)
    }
  )

  return client
}

/**
 * API client instance with interceptors
 * Use this for all API calls to ensure proper headers are included
 */
export const apiClient = createApiClient()

/**
 * Create API client with Authorization header (server-side only)
 * @param accessToken - JWT token from session
 */
export const createAuthenticatedClient = (accessToken: string): AxiosInstance => {
  const client = createApiClient()

  // Add Authorization header
  client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    config.headers['Authorization'] = `Bearer ${accessToken}`
    return config
  })

  return client
}
