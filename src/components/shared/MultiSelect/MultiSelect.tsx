'use client'

import { useState, useRef, useCallback, useEffect, useId } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faCheck, faXmark, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import styles from './MultiSelect.module.css'

export interface SelectOption {
  /** Unique value for the option */
  value: string | number
  /** Display label for the option */
  label: string
}

export interface MultiSelectProps {
  /** Label for the field */
  label?: string
  /** Available options */
  options: SelectOption[]
  /** Currently selected values */
  selected: (string | number)[]
  /** Callback when selection changes */
  onChange: (selected: (string | number)[]) => void
  /** Placeholder text when nothing selected */
  placeholder?: string
  /** Enable search/filter functionality */
  searchable?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Hint text */
  hint?: string
  /** Max items to display before showing count (e.g., "3 selected") */
  maxDisplayItems?: number
  /** Full width mode */
  fullWidth?: boolean
  /** Additional CSS class */
  className?: string
}

/**
 * MultiSelect component
 *
 * A dropdown that allows selecting multiple options with checkboxes.
 * Features searchable options, chip display, and keyboard navigation.
 *
 * @example
 * <MultiSelect
 *   label="Source Systems"
 *   options={[
 *     { value: 1, label: 'ARCADE' },
 *     { value: 2, label: 'LEGACY' },
 *   ]}
 *   selected={selectedSystems}
 *   onChange={setSelectedSystems}
 *   searchable
 *   placeholder="Select source systems..."
 * />
 */
export function MultiSelect({
  label,
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  searchable = false,
  disabled = false,
  error,
  hint,
  maxDisplayItems = 2,
  fullWidth = false,
  className,
}: Readonly<MultiSelectProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(-1)

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const inputId = useId()
  const listboxId = useId()
  const labelId = useId()

  // Filter options based on search query
  const filteredOptions = searchable && searchQuery
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options

  // Get selected option labels for display
  const selectedLabels = options
    .filter(option => selected.includes(option.value))
    .map(option => option.label)

  // Display text for the trigger button
  const getDisplayText = () => {
    if (selectedLabels.length === 0) {
      return placeholder
    }
    if (selectedLabels.length <= maxDisplayItems) {
      return selectedLabels.join(', ')
    }
    return `${selectedLabels.length} selected`
  }

  // Toggle dropdown open/close
  const toggleDropdown = useCallback(() => {
    if (disabled) return
    setIsOpen(prev => !prev)
    setSearchQuery('')
    setFocusedIndex(-1)
  }, [disabled])

  // Handle option toggle
  const toggleOption = useCallback((value: string | number) => {
    const newSelected = selected.includes(value)
      ? selected.filter(v => v !== value)
      : [...selected, value]
    onChange(newSelected)
  }, [selected, onChange])

  // Clear all selections
  const clearAll = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange([])
  }, [onChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery('')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen, searchable])

  // Keyboard handler: Enter/Space
  const handleEnterSpace = useCallback((event: React.KeyboardEvent) => {
    if (isOpen) {
      if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        event.preventDefault()
        toggleOption(filteredOptions[focusedIndex].value)
      }
    } else {
      event.preventDefault()
      setIsOpen(true)
    }
  }, [isOpen, focusedIndex, filteredOptions, toggleOption])

  // Keyboard handler: Arrow navigation
  const handleArrowDown = useCallback((event: React.KeyboardEvent) => {
    event.preventDefault()
    if (isOpen) {
      setFocusedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : prev))
    } else {
      setIsOpen(true)
    }
  }, [isOpen, filteredOptions.length])

  const handleArrowUp = useCallback((event: React.KeyboardEvent) => {
    event.preventDefault()
    if (isOpen) {
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : prev))
    }
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case 'Enter':
      case ' ':
        handleEnterSpace(event)
        break
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        buttonRef.current?.focus()
        break
      case 'ArrowDown':
        handleArrowDown(event)
        break
      case 'ArrowUp':
        handleArrowUp(event)
        break
      case 'Home':
        if (isOpen) {
          event.preventDefault()
          setFocusedIndex(0)
        }
        break
      case 'End':
        if (isOpen) {
          event.preventDefault()
          setFocusedIndex(filteredOptions.length - 1)
        }
        break
    }
  }, [disabled, isOpen, filteredOptions.length, handleEnterSpace, handleArrowDown, handleArrowUp])

  // Scroll focused option into view
  useEffect(() => {
    if (focusedIndex >= 0 && listboxRef.current) {
      const focusedElement = listboxRef.current.children[focusedIndex] as HTMLElement
      focusedElement?.scrollIntoView({ block: 'nearest' })
    }
  }, [focusedIndex])

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${fullWidth ? styles.fullWidth : ''} ${className ?? ''}`}
    >
      {label && (
        <label id={labelId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <button
          ref={buttonRef}
          type="button"
          id={inputId}
          className={`${styles.trigger} ${isOpen ? styles.open : ''} ${error ? styles.hasError : ''} ${disabled ? styles.disabled : ''}`}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby={label ? labelId : undefined}
          aria-controls={isOpen ? listboxId : undefined}
        >
          <span className={`${styles.displayText} ${selected.length === 0 ? styles.placeholder : ''}`}>
            {getDisplayText()}
          </span>
          <span className={styles.icons}>
            {/* Placeholder for clear button space when visible */}
            {selected.length > 0 && !disabled && <span className={styles.clearButtonPlaceholder} />}
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`}
            />
          </span>
        </button>

        {/* Clear button positioned absolutely over the trigger */}
        {selected.length > 0 && !disabled && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={clearAll}
            aria-label="Clear all selections"
            tabIndex={-1}
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        )}

        {isOpen && (
          <div className={styles.dropdown}>
            {searchable && (
              <div className={styles.searchWrapper}>
                <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  className={styles.searchInput}
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => {
                    setSearchQuery(e.target.value)
                    setFocusedIndex(-1)
                  }}
                  onKeyDown={handleKeyDown}
                  aria-label="Search options"
                />
              </div>
            )}

            <div
              ref={listboxRef}
              id={listboxId}
              className={styles.listbox}
              aria-labelledby={label ? labelId : undefined}
            >
              {filteredOptions.length === 0 ? (
                <div className={styles.noResults}>No options found</div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = selected.includes(option.value)
                  const isFocused = index === focusedIndex
                  const optionId = `${listboxId}-option-${option.value}`

                  return (
                    <label
                      key={option.value}
                      htmlFor={optionId}
                      className={`${styles.option} ${isSelected ? styles.selected : ''} ${isFocused ? styles.focused : ''}`}
                      onMouseEnter={() => setFocusedIndex(index)}
                    >
                      <input
                        type="checkbox"
                        id={optionId}
                        checked={isSelected}
                        onChange={() => toggleOption(option.value)}
                        className={styles.hiddenCheckbox}
                        tabIndex={-1}
                      />
                      <span className={`${styles.checkbox} ${isSelected ? styles.checked : ''}`}>
                        {isSelected && <FontAwesomeIcon icon={faCheck} />}
                      </span>
                      <span className={styles.optionLabel}>{option.label}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
        )}
      </div>

      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
