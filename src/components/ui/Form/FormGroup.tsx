import type { ReactNode } from 'react'
import styles from './FormGroup.module.css'

interface FormGroupProps {
  readonly children: ReactNode
  readonly label?: string
  readonly required?: boolean
  readonly error?: string
  readonly hint?: string
  readonly htmlFor?: string
  readonly className?: string
  readonly disabled?: boolean
  readonly fullWidth?: boolean
}

/**
 * FormGroup - Wrapper for form fields with consistent label, error, and hint display
 * Provides standard spacing and accessibility attributes
 * 
 * @example
 * <FormGroup
 *   label="Email Address"
 *   required
 *   error={errors.email}
 *   hint="We'll never share your email"
 *   htmlFor="email-input"
 * >
 *   <input id="email-input" type="email" />
 * </FormGroup>
 */
export const FormGroup = ({
  children,
  label,
  required = false,
  error,
  hint,
  htmlFor,
  className = '',
  disabled = false,
  fullWidth = true,
}: FormGroupProps) => {
  const groupClassNames = [
    styles['form-group'],
    error && styles['has-error'],
    disabled && styles.disabled,
    fullWidth && styles['full-width'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={groupClassNames}>
      {label && (
        <label htmlFor={htmlFor} className={styles.label}>
          {label}
          {required && <span className={styles.required} aria-label="required">*</span>}
        </label>
      )}

      <div className={styles.control}>{children}</div>

      {hint && !error && <p className={styles.hint}>{hint}</p>}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
