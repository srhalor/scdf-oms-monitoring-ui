'use client'

import { ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { Tooltip } from '@/components/shared/Tooltip'
import type { TooltipPosition } from '@/components/shared/Tooltip'
import { logger } from '@/lib/logger'
import styles from './Button.module.css'
import { ButtonLoadingIcon } from './ButtonLoadingIcon'

/** Badge variant type */
type BadgeVariant = 'error' | 'warning' | 'info'

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
  badgeVariant?: BadgeVariant

  /** Show tooltip on hover (icon-only buttons) */
  showTooltip?: boolean

  /** Tooltip position (only for icon-only buttons) */
  tooltipPosition?: TooltipPosition
}

/** Maps badge variant to CSS class name */
const BADGE_CLASS_MAP: Record<BadgeVariant, string> = {
  error: styles.badgeError,
  warning: styles.badgeWarning,
  info: styles.badgeInfo,
}

interface ButtonBadgeProps {
  badge: number | string
  badgeVariant: BadgeVariant
}

/** Renders badge for icon-only buttons */
function ButtonBadge({ badge, badgeVariant }: Readonly<ButtonBadgeProps>) {
  const displayValue = typeof badge === 'number' && badge > 99 ? '99+' : badge
  return (
    <span
      className={`${styles.badge} ${BADGE_CLASS_MAP[badgeVariant]}`}
      aria-label={`${badge} notifications`}
    >
      {displayValue}
    </span>
  )
}

interface IconOnlyContentProps {
  icon: IconDefinition
  badge?: number | string
  badgeVariant: BadgeVariant
}

/** Renders icon-only button content */
function IconOnlyContent({ icon, badge, badgeVariant }: Readonly<IconOnlyContentProps>) {
  return (
    <>
      <FontAwesomeIcon icon={icon} className={styles.icon} />
      {badge !== undefined && <ButtonBadge badge={badge} badgeVariant={badgeVariant} />}
    </>
  )
}

interface TextButtonContentProps {
  iconBefore?: IconDefinition
  iconAfter?: IconDefinition
  children?: ReactNode
}

/** Renders text button content with optional icons */
function TextButtonContent({ 
  iconBefore, 
  iconAfter, 
  children 
}: Readonly<TextButtonContentProps>) {
  return (
    <>
      {iconBefore && <FontAwesomeIcon icon={iconBefore} className={styles.iconBefore} />}
      {children && <span className={styles.label}>{children}</span>}
      {iconAfter && <FontAwesomeIcon icon={iconAfter} className={styles.iconAfter} />}
    </>
  )
}

/**
 * Validates button props in development mode (complexity reduction helper)
 */
function validateButtonProps(
  isIconOnly: boolean,
  label: string | undefined,
  icon: IconDefinition | undefined,
  iconBefore: IconDefinition | undefined,
  iconAfter: IconDefinition | undefined
): void {
  if (process.env.NODE_ENV === 'development') {
    if (isIconOnly && !label) {
      logger.warn('Button', 'icon-only buttons require a label prop for accessibility')
    }
    if (icon && (iconBefore || iconAfter)) {
      logger.warn('Button', 'icon prop is for icon-only buttons. Use iconBefore/iconAfter for text buttons.')
    }
  }
}

/**
 * Builds button className string (complexity reduction helper)
 */
function buildButtonClassNames(
  hierarchy: string,
  size: string,
  isIconOnly: boolean,
  variant: string,
  focusVariant: string,
  fullWidth: boolean,
  className: string | undefined
): string {
  return [
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
}: Readonly<ButtonProps>) {
  // Detect button type based on content
  const isIconOnly = !children && Boolean(icon ?? iconBefore ?? iconAfter)
  const iconToUse = icon ?? iconBefore ?? iconAfter

  // Development validation (stripped in production)
  validateButtonProps(isIconOnly, label, icon, iconBefore, iconAfter)

  const classNames = buildButtonClassNames(
    hierarchy,
    size,
    isIconOnly,
    variant,
    focusVariant,
    fullWidth,
    className
  )

  const renderContent = () => {
    if (loading) {
      return <ButtonLoadingIcon hierarchy={hierarchy} variant={variant} size={size} />
    }
    if (isIconOnly && iconToUse) {
      return <IconOnlyContent icon={iconToUse} badge={badge} badgeVariant={badgeVariant} />
    }
    return <TextButtonContent iconBefore={iconBefore} iconAfter={iconAfter}>{children}</TextButtonContent>
  }

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
      {renderContent()}
    </button>
  )

  // Wrap icon-only buttons with Tooltip if showTooltip is enabled
  if (isIconOnly && showTooltip && label) {
    return (
      <Tooltip message={label} position={tooltipPosition} hasInteractiveChild>
        {buttonElement}
      </Tooltip>
    )
  }

  return buttonElement
}
