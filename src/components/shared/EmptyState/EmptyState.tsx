/**
 * EmptyState Component
 * 
 * Displays consistent empty state messages with optional icon and action button.
 * Used for "no data", "no results", "no selection", and error scenarios.
 */

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import {
  faInbox,
  faMagnifyingGlass,
  faCheckSquare,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { Button } from '../Button'
import styles from './EmptyState.module.css'

const illustrationIcons: Record<string, IconDefinition> = {
  noData: faInbox,
  noResults: faMagnifyingGlass,
  noSelection: faCheckSquare,
  error: faTriangleExclamation,
}

export interface EmptyStateProps {
  /** Custom icon (overrides illustration) */
  icon?: IconDefinition
  /** Main title text */
  title: string
  /** Optional description text */
  description?: string
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Predefined illustration type */
  illustration?: 'noData' | 'noResults' | 'noSelection' | 'error'
  /** Optional additional CSS class */
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  illustration = 'noData',
  className,
}: Readonly<EmptyStateProps>) {
  const displayIcon = icon || illustrationIcons[illustration]

  return (
    <div className={`${styles.emptyState} ${className || ''}`}>
      {displayIcon && (
        <div className={styles.icon}>
          <FontAwesomeIcon icon={displayIcon} />
        </div>
      )}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <div className={styles.action}>
          <Button hierarchy="primary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  )
}
