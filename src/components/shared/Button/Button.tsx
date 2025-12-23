'use client'

import { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Tooltip } from '@/components/shared/Tooltip'
import type { TooltipPosition } from '@/components/shared/Tooltip'
import styles from './Button.module.css'
import { ButtonLoadingIcon } from './ButtonLoadingIcon'

export interface ButtonProps {
  /** Button visual hierarchy */
  hierarchy?: 'primary' | 'secondary' | 'tertiary'

  /** Button size variant */
  size?: 'sm' | 'md' | 'lg'

  /** Visual variant */
  variant?: 'default' | 'destructive'

  /** Disabled state */
  disabled?: boolean

  /** Loading state - shows spinner, disables interaction */
  loading?: boolean

  /** Single icon (for icon-only buttons) */
  icon?: IconDefinition

  /** Icon before text */
  iconBefore?: IconDefinition

  /** Icon after text */
  iconAfter?: IconDefinition

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void

  /** Button type attribute */
  type?: 'button' | 'submit' | 'reset'

  /** Button content (optional for icon-only buttons) */
  children?: ReactNode

  /** Accessible label (required for icon-only buttons) */
  label?: string

  /** Additional CSS class */
  className?: string

  /** Focus ring variant for error states */
  focusVariant?: 'default' | 'error'

  /** Full width button */
  fullWidth?: boolean

  /** Badge content (for icon-only buttons, e.g., notification count) */
  badge?: number | string

  /** Badge variant */
  badgeVariant?: 'error' | 'warning' | 'info'

  /** Show tooltip on hover (icon-only buttons) */
  showTooltip?: boolean

  /** Tooltip position (only for icon-only buttons) */
  tooltipPosition?: TooltipPosition
}

export function Button({
  hierarchy = 'primary',
  size = 'md',
  variant = 'default',
  disabled = false,
  loading = false,
  icon,
  iconBefore,
  iconAfter,
  onClick,
  type = 'button',
  children,
  label,
  className,
  focusVariant = 'default',
  fullWidth = false,
  badge,
  badgeVariant = 'error',
  showTooltip = true,
  tooltipPosition = 'bottom',
}: ButtonProps) {
  // Detect button type based on content
  const isIconOnly = !children && (icon || iconBefore || iconAfter)
  const iconToUse = icon || iconBefore || iconAfter

  // Validate: icon-only buttons require label for accessibility
  if (isIconOnly && !label) {
    console.warn('Button: icon-only buttons require a label prop for accessibility')
  }

  // Validate: conflicting icon props
  if (icon && (iconBefore || iconAfter)) {
    console.warn(
      'Button: icon prop is for icon-only buttons. Use iconBefore/iconAfter for text buttons with icons.'
    )
  }

  const classNames = [
    styles.button,
    styles[hierarchy],
    styles[size],
    isIconOnly && styles.iconOnly,
    variant === 'destructive' && styles.destructive,
    focusVariant === 'error' && styles.focusError,
    fullWidth && styles.fullWidth,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const buttonElement = (
    <button
      type={type}
      className={classNames}
      onClick={onClick}
      disabled={disabled || loading}
      data-loading={loading}
      aria-busy={loading}
      aria-label={isIconOnly ? label : undefined}
    >
      {loading ? (
        <ButtonLoadingIcon hierarchy={hierarchy} variant={variant} size={size} />
      ) : isIconOnly ? (
        // Icon-only rendering
        <>
          <FontAwesomeIcon icon={iconToUse!} className={styles.icon} />
          {badge !== undefined && (
            <span
              className={`${styles.badge} ${styles[`badge${badgeVariant.charAt(0).toUpperCase()}${badgeVariant.slice(1)}`]}`}
              aria-label={`${badge} notifications`}
            >
              {typeof badge === 'number' && badge > 99 ? '99+' : badge}
            </span>
          )}
        </>
      ) : (
        // Text or icon+text rendering
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

  // Wrap icon-only buttons with Tooltip if showTooltip is enabled
  if (isIconOnly && showTooltip && label) {
    return (
      <Tooltip message={label} position={tooltipPosition}>
        {buttonElement}
      </Tooltip>
    )
  }

  return buttonElement
}
