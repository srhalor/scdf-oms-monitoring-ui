'use client'

import styles from './ButtonLoadingIcon.module.css'

interface ButtonLoadingIconProps {
  hierarchy: 'primary' | 'secondary' | 'tertiary'
  variant: 'default' | 'destructive'
  size: 'sm' | 'md' | 'lg'
}

export function ButtonLoadingIcon({
  hierarchy,
  variant,
  size,
}: ButtonLoadingIconProps) {
  const classNames = [
    styles.spinner,
    styles[hierarchy],
    styles[size],
    variant === 'destructive' && styles.destructive,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={classNames} role="status" aria-label="Loading">
      <svg className={styles.circle} viewBox="0 0 16 16">
        {/* Background circle - 30% opacity */}
        <circle
          className={styles.circleBackground}
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2"
        />
        {/* Foreground circle - rotating arc */}
        <circle
          className={styles.circleForeground}
          cx="8"
          cy="8"
          r="6"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="28.27 9.42"
        />
      </svg>
    </span>
  )
}
