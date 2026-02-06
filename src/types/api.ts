/**
 * API Type Definitions
 * 
 * These types match the backend Java Spring Boot error structures exactly.
 * They provide type-safe error handling across all API calls.
 */

/**
 * Field validation error returned by backend
 * Matches Java ValidationError record
 */
export interface ValidationError {
  /** Field name that failed validation */
  field: string
  /** Error message for the field */
  message: string
  /** The value that was rejected (helps with debugging) */
  rejectedValue: unknown
}

/**
 * Standard error response from backend API
 * Matches Java ErrorResponseDto record
 */
export interface ErrorResponseDto {
  /** ISO 8601 timestamp from backend Instant */
  timestamp: string
  /** HTTP status code (e.g., 400, 500) */
  status: number
  /** HTTP status text (e.g., "Bad Request") */
  error: string
  /** Detailed error description */
  errorDescription: string
  /** User-friendly message to display */
  message: string
  /** API endpoint path where error occurred */
  path: string
  /** Field validation errors (present for 400 validation failures) */
  errors?: ValidationError[]
  /** Additional context/metadata */
  metadata?: Record<string, unknown>
}

/**
 * Type guard to check if an error is an ErrorResponseDto
 */
export function isErrorResponseDto(error: unknown): error is ErrorResponseDto {
  if (!error || typeof error !== 'object') return false
  
  const err = error as Partial<ErrorResponseDto>
  
  return (
    typeof err.timestamp === 'string' &&
    typeof err.status === 'number' &&
    typeof err.error === 'string' &&
    typeof err.message === 'string' &&
    typeof err.path === 'string'
  )
}

/**
 * Extract user-friendly error message from ErrorResponseDto
 */
export function getErrorMessage(error: ErrorResponseDto): string {
  // Prefer user-friendly message
  if (error.message) return error.message
  
  // Fallback to error description
  if (error.errorDescription) return error.errorDescription
  
  // Last resort: HTTP status text
  return error.error || 'An unexpected error occurred'
}

/**
 * Check if error has field validation errors
 */
export function hasValidationErrors(error: ErrorResponseDto): boolean {
  return Array.isArray(error.errors) && error.errors.length > 0
}
