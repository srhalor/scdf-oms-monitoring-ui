/**
 * LoadingSpinner Component
 * 
 * Centralized loading state UI with consistent appearance.
 * Supports multiple sizes and display modes (inline, full-screen, overlay).
 */

import styles from './LoadingSpinner.module.css'

export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg'
  /** Optional message to display below spinner */
  message?: string
  /** Display as full-screen centered spinner */
  fullScreen?: boolean
  /** Display as overlay over parent container */
  overlay?: boolean
  /** Optional additional CSS class */
  className?: string
}

export function LoadingSpinner({
  size = 'md',
  message,
  fullScreen = false,
  overlay = false,
  className,
}: Readonly<LoadingSpinnerProps>) {
  const spinnerClasses = [
    styles.spinner,
    styles[`spinner--${size}`],
    fullScreen && styles['spinner--fullscreen'],
    overlay && styles['spinner--overlay'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const content = (
    <>
      <div className={styles.loader} aria-label="Loading" aria-live="polite">
        <div className={styles.loaderRing}></div>
      </div>
      {message && <p className={styles.message}>{message}</p>}
    </>
  )

  if (fullScreen || overlay) {
    return (
      <div className={spinnerClasses}>
        <div className={styles.spinnerContent}>{content}</div>
      </div>
    )
  }

  return <div className={spinnerClasses}>{content}</div>
}
