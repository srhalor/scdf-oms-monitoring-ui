/**
 * API Utilities
 *
 * Shared utilities for API routes and services.
 */

import axios from 'axios'
import { logger } from '@/lib/logger'

/**
 * Log API error with detailed information
 *
 * @param serviceName - Name of the service (for log context)
 * @param operation - Description of the failed operation
 * @param error - The caught error
 */
export function logApiError(serviceName: string, operation: string, error: unknown): void {
  if (axios.isAxiosError(error) && error.response) {
    logger.error(serviceName, `${operation} - Backend error`, {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
      url: error.config?.url,
    })
  } else {
    logger.error(serviceName, operation, error)
  }
}

/**
 * Extract error message from an error object
 *
 * @param error - The caught error
 * @param fallback - Fallback message if error is not an Error instance
 * @returns Error message string
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback
}

/**
 * Extract ID from URL path (last segment)
 *
 * @param url - Full URL string
 * @returns Numeric ID from the last path segment
 *
 * @example
 * extractIdFromUrl('http://localhost/api/items/123') // returns 123
 */
export function extractIdFromUrl(url: string): number {
  const segments = new URL(url).pathname.split('/')
  return Number(segments.at(-1))
}
