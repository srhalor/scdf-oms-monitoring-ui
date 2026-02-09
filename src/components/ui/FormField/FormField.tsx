'use client'

import { forwardRef, InputHTMLAttributes, ReactNode, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import styles from './FormField.module.css'

/**
 * Counter for generating unique field IDs
 */
let fieldIdCounter = 0

/**
 * Generate a unique field ID using a counter instead of Math.random()
 * This avoids SonarQube S2245 warning while providing predictable, unique IDs
 */
function generateFieldId(prefix: string, name?: string): string {
  if (name) {
    return `${prefix}-${name}`
  }
  fieldIdCounter++
  return `${prefix}-${fieldIdCounter}`
}

/**
 * Helper function to get aria-describedby value
 */
function getAriaDescribedBy(
  inputId: string,
  error?: string,
  hint?: string
): string | undefined {
  if (error) {
    return `${inputId}-error`
  }
  if (hint) {
    return `${inputId}-hint`
  }
  return undefined
}

/**
 * Helper function to get input type for password fields
 */
function getPasswordInputType(showPassword: boolean, originalType: string): string {
  if (originalType !== 'password') {
    return originalType
  }
  return showPassword ? 'text' : 'password'
}

/**
 * Render trailing icon for text input (password toggle or custom icon)
 */
function renderTrailingIcon(
  isPassword: boolean,
  showPassword: boolean,
  setShowPassword: (show: boolean) => void,
  trailingIcon?: IconDefinition,
  onTrailingIconClick?: () => void
): JSX.Element | null {
  if (isPassword) {
    return (
      <span className={styles.trailingIcon}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      </span>
    )
  }

  if (trailingIcon) {
    return (
      <span className={styles.trailingIcon}>
        {onTrailingIconClick ? (
          <button
            type="button"
            className={styles.iconButton}
            onClick={onTrailingIconClick}
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={trailingIcon} />
          </button>
        ) : (
          <FontAwesomeIcon icon={trailingIcon} />
        )}
      </span>
    )
  }

  return null
}

export interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Field label */
  label?: string

  /** Hint text below input */
  hint?: string

  /** Error message */
  error?: string

  /** Required field indicator */
  required?: boolean

  /** Leading icon */
  leadingIcon?: IconDefinition

  /** Trailing icon (for non-password inputs) */
  trailingIcon?: IconDefinition

  /** Trailing icon click handler */
  onTrailingIconClick?: () => void

  /** Full width */
  fullWidth?: boolean
}

/**
 * TextInput Component
 *
 * Reusable text input with label, hint, error, and icon support.
 * Supports all native input types including password with toggle.
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      label,
      hint,
      error,
      required,
      leadingIcon,
      trailingIcon,
      onTrailingIconClick,
      fullWidth = true,
      type = 'text',
      className,
      id,
      ...rest
    },
    ref
  ) {
    const [showPassword, setShowPassword] = useState(false)
    const isPassword = type === 'password'
    const inputType = getPasswordInputType(showPassword, type)
    const inputId = id ?? generateFieldId('input', rest.name)

    const inputClassNames = [
      styles.input,
      leadingIcon && styles.hasLeadingIcon,
      (trailingIcon || isPassword) && styles.hasTrailingIcon,
      error && styles.hasError,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={styles.fieldWrapper}
        style={fullWidth ? undefined : { width: 'auto' }}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {leadingIcon && (
            <span className={styles.leadingIcon}>
              <FontAwesomeIcon icon={leadingIcon} />
            </span>
          )}

          <input
            ref={ref}
            type={inputType}
            id={inputId}
            className={inputClassNames}
            aria-invalid={!!error}
            aria-describedby={getAriaDescribedBy(inputId, error, hint)}
            {...rest}
          />

          {renderTrailingIcon(isPassword, showPassword, setShowPassword, trailingIcon, onTrailingIconClick)}
        </div>

        {hint && !error && (
          <span id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}

        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

// =============================================================================
// TextArea Component
// =============================================================================

export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Field label */
  label?: string

  /** Hint text below input */
  hint?: string

  /** Error message */
  error?: string

  /** Required field indicator */
  required?: boolean

  /** Number of visible rows */
  rows?: number

  /** Full width */
  fullWidth?: boolean
}

/**
 * TextArea Component
 *
 * Reusable textarea with label, hint, and error support.
 */
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  function TextArea(
    {
      label,
      hint,
      error,
      required,
      rows = 3,
      fullWidth = true,
      className,
      id,
      ...rest
    },
    ref
  ) {
    const inputId = id ?? generateFieldId('textarea', rest.name)

    const textareaClassNames = [
      styles.input,
      styles.textarea,
      error && styles.hasError,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={styles.fieldWrapper}
        style={fullWidth ? undefined : { width: 'auto' }}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          className={textareaClassNames}
          aria-invalid={!!error}
          aria-describedby={getAriaDescribedBy(inputId, error, hint)}
          {...rest}
        />

        {hint && !error && (
          <span id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}

        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

// =============================================================================
// Select Component
// =============================================================================

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Field label */
  label?: string

  /** Hint text below input */
  hint?: string

  /** Error message */
  error?: string

  /** Required field indicator */
  required?: boolean

  /** Select options */
  options: SelectOption[]

  /** Placeholder option */
  placeholder?: string

  /** Full width */
  fullWidth?: boolean
}

/**
 * Select Component
 *
 * Reusable select dropdown with label, hint, and error support.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    {
      label,
      hint,
      error,
      required,
      options,
      placeholder,
      fullWidth = true,
      className,
      id,
      ...rest
    },
    ref
  ) {
    const inputId = id ?? generateFieldId('select', rest.name)

    const selectClassNames = [
      styles.input,
      styles.select,
      error && styles.hasError,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={styles.fieldWrapper}
        style={fullWidth ? undefined : { width: 'auto' }}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={inputId}
            className={selectClassNames}
            aria-invalid={!!error}
            aria-describedby={getAriaDescribedBy(inputId, error, hint)}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.selectIcon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {hint && !error && (
          <span id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}

        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

// =============================================================================
// DateInput Component
// =============================================================================

export interface DateInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Field label */
  label?: string

  /** Hint text below input */
  hint?: string

  /** Error message */
  error?: string

  /** Required field indicator */
  required?: boolean

  /** Full width */
  fullWidth?: boolean
}

/**
 * DateInput Component
 *
 * Reusable date input with label, hint, and error support.
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  function DateInput(
    { label, hint, error, required, fullWidth = true, className, id, ...rest },
    ref
  ) {
    const inputId = id ?? generateFieldId('date', rest.name)

    const inputClassNames = [
      styles.input,
      styles.dateInput,
      styles.hasTrailingIcon,
      error && styles.hasError,
      className,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div
        className={styles.fieldWrapper}
        style={fullWidth ? undefined : { width: 'auto' }}
      >
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          <input
            ref={ref}
            type="date"
            id={inputId}
            className={inputClassNames}
            aria-invalid={!!error}
            aria-describedby={getAriaDescribedBy(inputId, error, hint)}
            {...rest}
          />
          <span className={styles.trailingIcon} style={{ pointerEvents: 'none' }}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.66667 1.66667V4.16667M13.3333 1.66667V4.16667M2.91667 7.575H17.0833M17.5 7.08333V14.1667C17.5 16.6667 16.25 18.3333 13.3333 18.3333H6.66667C3.75 18.3333 2.5 16.6667 2.5 14.1667V7.08333C2.5 4.58333 3.75 2.91667 6.66667 2.91667H13.3333C16.25 2.91667 17.5 4.58333 17.5 7.08333Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>

        {hint && !error && (
          <span id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}

        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

// =============================================================================
// Checkbox Component
// =============================================================================

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Checkbox label */
  label: ReactNode

  /** Error message */
  error?: string

  /** Hint text */
  hint?: string
}

/**
 * Checkbox Component
 *
 * Reusable checkbox with label support.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox({ label, error, hint, className, id, ...rest }, ref) {
    const inputId = id ?? generateFieldId('checkbox', rest.name)

    return (
      <div className={styles.fieldWrapper}>
        <label
          htmlFor={inputId}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            cursor: rest.disabled ? 'not-allowed' : 'pointer',
          }}
        >
          <input
            ref={ref}
            type="checkbox"
            id={inputId}
            className={className}
            aria-invalid={!!error}
            aria-describedby={getAriaDescribedBy(inputId, error, hint)}
            {...rest}
          />
          <span
            style={{
              fontSize: 'var(--text-sm-size)',
              color: rest.disabled
                ? 'var(--color-text-disabled)'
                : 'var(--color-text-primary)',
            }}
          >
            {label}
          </span>
        </label>

        {hint && !error && (
          <span id={`${inputId}-hint`} className={styles.hint}>
            {hint}
          </span>
        )}

        {error && (
          <span id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)
