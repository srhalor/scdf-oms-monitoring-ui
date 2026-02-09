'use client'

import { useState, useEffect, useCallback, type ChangeEvent } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons'
import styles from './SearchInput.module.css'

interface SearchInputProps {
  readonly value: string
  readonly onChange: (value: string) => void
  readonly onSearch?: () => void
  readonly placeholder?: string
  readonly debounceMs?: number
  readonly clearable?: boolean
  readonly loading?: boolean
  readonly disabled?: boolean
  readonly className?: string
  readonly autoFocus?: boolean
}

/**
 * SearchInput - Reusable search input with debouncing and clear functionality
 * Standardizes search UX across the application
 * 
 * @example
 * const [search, setSearch] = useState('')
 * 
 * <SearchInput
 *   value={search}
 *   onChange={setSearch}
 *   placeholder="Search documents..."
 *   debounceMs={300}
 *   clearable
 *   loading={isSearching}
 * />
 */
export const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  debounceMs = 300,
  clearable = true,
  loading = false,
  disabled = false,
  className = '',
  autoFocus = false,
}: SearchInputProps) => {
  const [localValue, setLocalValue] = useState(value)

  // Sync local value with prop value
  useEffect(() => {
    setLocalValue(value)
  }, [value])

  // Debounced onChange
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [localValue, onChange, debounceMs, value])

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value)
  }, [])

  const handleClear = useCallback(() => {
    setLocalValue('')
    onChange('')
    onSearch?.()
  }, [onChange, onSearch])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && onSearch) {
        onSearch()
      }
    },
    [onSearch]
  )

  const showClearButton = clearable && localValue.length > 0 && !loading && !disabled

  const containerClassNames = [
    styles.container,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={containerClassNames}>
      <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} aria-hidden="true" />

      <input
        type="text"
        className={styles.input}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-label={placeholder}
      />

      {loading && (
        <FontAwesomeIcon
          icon={faSpinner}
          className={styles.loadingIcon}
          spin
          aria-label="Loading"
        />
      )}

      {showClearButton && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={handleClear}
          aria-label="Clear search"
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>
      )}
    </div>
  )
}
