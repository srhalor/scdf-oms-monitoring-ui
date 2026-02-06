/**
 * ValidationErrors Component
 * 
 * Displays field validation errors from backend ErrorResponseDto.
 * Shows field name, error message, and rejected value for debugging.
 */

import type { ValidationError } from '@/types/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleExclamation } from '@fortawesome/free-solid-svg-icons'
import styles from './ValidationErrors.module.css'

export interface ValidationErrorsProps {
  /** Array of validation errors from ErrorResponseDto.errors */
  errors: ValidationError[]
  /** Optional additional CSS class */
  className?: string
  /** Show rejected values (useful for debugging, default: NODE_ENV === 'development') */
  showRejectedValues?: boolean
}

export function ValidationErrors({
  errors,
  className,
  showRejectedValues = process.env.NODE_ENV === 'development',
}: Readonly<ValidationErrorsProps>) {
  if (!errors || errors.length === 0) {
    return null
  }

  return (
    <div className={`${styles.validationErrors} ${className || ''}`} role="alert">
      <div className={styles.header}>
        <FontAwesomeIcon icon={faCircleExclamation} className={styles.icon} />
        <h4 className={styles.title}>Validation Errors</h4>
      </div>
      <ul className={styles.errorList}>
        {errors.map((error, index) => (
          <li key={`${error.field}-${index}`} className={styles.errorItem}>
            <div className={styles.errorContent}>
              <strong className={styles.fieldName}>{error.field}:</strong>
              <span className={styles.errorMessage}>{error.message}</span>
            </div>
            {showRejectedValues && error.rejectedValue !== undefined && (
              <div className={styles.rejectedValue}>
                <span className={styles.label}>Rejected value:</span>
                <code className={styles.value}>
                  {JSON.stringify(error.rejectedValue)}
                </code>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
