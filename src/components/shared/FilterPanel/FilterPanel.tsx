'use client'

import { useState, type ReactNode } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import styles from './FilterPanel.module.css'

interface FilterPanelProps {
  readonly title?: string
  readonly children: ReactNode
  readonly collapsible?: boolean
  readonly defaultExpanded?: boolean
  readonly onReset?: () => void
  readonly hasActiveFilters?: boolean
  readonly className?: string
}

/**
 * FilterPanel - Collapsible wrapper for filter sections
 * Provides consistent UI for filter groups with reset functionality
 * 
 * @example
 * <FilterPanel
 *   title="Filter Documents"
 *   collapsible
 *   defaultExpanded
 *   onReset={handleResetFilters}
 *   hasActiveFilters={hasFilters}
 * >
 *   <FormGroup label="Status">
 *     <select>...</select>
 *   </FormGroup>
 *   <FormGroup label="Date Range">
 *     <input type="date" />
 *   </FormGroup>
 * </FilterPanel>
 */
export const FilterPanel = ({
  title,
  children,
  collapsible = false,
  defaultExpanded = true,
  onReset,
  hasActiveFilters = false,
  className = '',
}: FilterPanelProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const panelClassNames = [
    styles.panel,
    !isExpanded && styles.collapsed,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={panelClassNames}>
      {(title || onReset || collapsible) && (
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            {collapsible && (
              <button
                type="button"
                className={styles.collapseButton}
                onClick={() => setIsExpanded(!isExpanded)}
                aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
                aria-expanded={isExpanded}
              >
                <FontAwesomeIcon
                  icon={isExpanded ? faChevronUp : faChevronDown}
                  className={styles.collapseIcon}
                />
              </button>
            )}

            {title && (
              <h3 className={styles.title}>
                {title}
                {hasActiveFilters && (
                  <span className={styles.badge} aria-label="Has active filters">
                    •
                  </span>
                )}
              </h3>
            )}
          </div>

          {onReset && hasActiveFilters && isExpanded && (
            <Button
              hierarchy="secondary"
              size="sm"
              onClick={onReset}
              showTooltip={false}
            >
              Reset
            </Button>
          )}
        </div>
      )}

      {isExpanded && <div className={styles.content}>{children}</div>}
    </div>
  )
}
