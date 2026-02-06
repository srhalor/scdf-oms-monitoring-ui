import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes, type IconDefinition } from '@fortawesome/free-solid-svg-icons'
import styles from './FilterChip.module.css'

interface FilterChipProps {
  readonly label: string
  readonly value: string | string[]
  readonly onRemove: () => void
  readonly icon?: IconDefinition
  readonly className?: string
}

/**
 * FilterChip - Display active filter with remove functionality
 * Shows filter label and value(s) with a clear button
 * 
 * @example
 * <FilterChip
 *   label="Status"
 *   value="Completed"
 *   onRemove={() => clearStatusFilter()}
 * />
 * 
 * @example
 * <FilterChip
 *   label="Types"
 *   value={['PDF', 'XML', 'JSON']}
 *   onRemove={() => clearTypesFilter()}
 *   icon={faFileAlt}
 * />
 */
export const FilterChip = ({
  label,
  value,
  onRemove,
  icon,
  className = '',
}: FilterChipProps) => {
  const displayValue = Array.isArray(value) ? value.join(', ') : value

  const chipClassNames = [styles.chip, className].filter(Boolean).join(' ')

  return (
    <div className={chipClassNames}>
      {icon && (
        <FontAwesomeIcon icon={icon} className={styles.icon} aria-hidden="true" />
      )}

      <span className={styles.content}>
        <span className={styles.label}>{label}:</span>
        <span className={styles.value}>{displayValue}</span>
      </span>

      <button
        type="button"
        className={styles.removeButton}
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  )
}
