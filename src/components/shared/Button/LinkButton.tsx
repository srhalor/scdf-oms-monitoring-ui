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

/**
 * Validates LinkButton props in development mode (complexity reduction helper)
 */
function validateLinkButtonProps(
  isIconOnly: boolean,
  label: string | undefined,
  icon: IconDefinition | undefined,
  iconBefore: IconDefinition | undefined,
  iconAfter: IconDefinition | undefined
): void {
  if (process.env.NODE_ENV === 'development') {
    if (isIconOnly && !label) {
      logger.warn('LinkButton', 'icon-only buttons require a label prop for accessibility')
    }
    if (icon && (iconBefore || iconAfter)) {
      logger.warn(
        'LinkButton',
        'icon prop is for icon-only buttons. Use iconBefore/iconAfter for text buttons with icons.'
      )
    }
  }
}

/**
 * Builds LinkButton className string (complexity reduction helper)
 */
function buildLinkButtonClassNames(
  variant: string,
  size: string,
  isIconOnly: boolean,
  destructive: boolean,
  className: string | undefined
): string {
  return [
    styles.linkButton,
    styles[variant],
    styles[size],
    isIconOnly && styles.iconOnly,
    destructive && styles.destructive,
    className,
  ]
    .filter(Boolean)
    .join(' ')
}

interface LinkButtonContentProps {
  isIconOnly: boolean
  iconToUse: IconDefinition | undefined
  iconBefore: IconDefinition | undefined
  iconAfter: IconDefinition | undefined
  children: ReactNode
}

/**
 * Renders LinkButton content (complexity reduction helper)
 */
function LinkButtonContent({
  isIconOnly,
  iconToUse,
  iconBefore,
  iconAfter,
  children,
}: Readonly<LinkButtonContentProps>) {
  if (isIconOnly && iconToUse) {
    return <FontAwesomeIcon icon={iconToUse} className={styles.icon} />
  }

  return (
    <>
      {iconBefore && (
        <FontAwesomeIcon icon={iconBefore} className={styles.iconBefore} />
      )}
      {children && <span className={styles.label}>{children}</span>}
      {iconAfter && <FontAwesomeIcon icon={iconAfter} className={styles.iconAfter} />}
    </>
  )
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
  const isIconOnly = !children && Boolean(icon ?? iconBefore ?? iconAfter)
  const iconToUse = icon ?? iconBefore ?? iconAfter

  // Development validation (stripped in production)
  validateLinkButtonProps(isIconOnly, label, icon, iconBefore, iconAfter)

  const classNames = buildLinkButtonClassNames(
    variant,
    size,
    isIconOnly,
    destructive,
    className
  )

  const ariaLabel = isIconOnly ? label : undefined
  const title = isIconOnly && showTooltip ? label : undefined

  return (
    <button
      type="button"
      className={classNames}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      <LinkButtonContent
        isIconOnly={isIconOnly}
        iconToUse={iconToUse}
        iconBefore={iconBefore}
        iconAfter={iconAfter}
      >
        {children}
      </LinkButtonContent>
    </button>
  )
}
