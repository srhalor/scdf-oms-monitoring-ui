'use client'

import { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { logger } from '@/lib/logger'
import styles from './LinkButton.module.css'

export interface LinkButtonProps {
  /** Link button variant */
  variant?: 'primary' | 'secondary'

  /** Button size (affects text and icon size) */
  size?: 'sm' | 'md' | 'lg'

  /** Destructive styling */
  destructive?: boolean

  /** Disabled state */
  disabled?: boolean

  /** Single icon (for icon-only link buttons) */
  icon?: IconDefinition

  /** Icon before text */
  iconBefore?: IconDefinition

  /** Icon after text */
  iconAfter?: IconDefinition

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

  /** Button content (optional for icon-only) */
  children?: ReactNode

  /** Accessible label (required for icon-only) */
  label?: string

  /** Additional CSS class */
  className?: string

  /** Show tooltip on hover (icon-only) */
  showTooltip?: boolean
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  destructive = false,
  disabled = false,
  icon,
  iconBefore,
  iconAfter,
  onClick,
  children,
  label,
  className,
  showTooltip = true,
}: Readonly<LinkButtonProps>) {
  // Detect button type
  const isIconOnly = !children && (icon || iconBefore || iconAfter)
  const iconToUse = icon || iconBefore || iconAfter

  // Development validation (stripped in production)
  if (process.env.NODE_ENV === 'development') {
    // Validate: icon-only buttons require label
    if (isIconOnly && !label) {
      logger.warn('LinkButton', 'icon-only buttons require a label prop for accessibility')
    }

    // Validate: conflicting icon props
    if (icon && (iconBefore || iconAfter)) {
      logger.warn(
        'LinkButton',
        'icon prop is for icon-only buttons. Use iconBefore/iconAfter for text buttons with icons.'
      )
    }
  }

  const classNames = [
    styles.linkButton,
    styles[variant],
    styles[size],
    isIconOnly && styles.iconOnly,
    destructive && styles.destructive,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={isIconOnly ? label : undefined}
      title={isIconOnly && showTooltip ? label : undefined}
    >
      {isIconOnly ? (
        <FontAwesomeIcon icon={iconToUse!} className={styles.icon} />
      ) : (
        <>
          {iconBefore && (
            <FontAwesomeIcon icon={iconBefore} className={styles.iconBefore} />
          )}
          {children && <span className={styles.label}>{children}</span>}
          {iconAfter && <FontAwesomeIcon icon={iconAfter} className={styles.iconAfter} />}
        </>
      )}
    </button>
  )
}
