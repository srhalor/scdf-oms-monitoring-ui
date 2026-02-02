'use client'

import { useState, useRef, useCallback, useEffect, useId, useMemo } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCalendar,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'
import styles from './DateRangePicker.module.css'

export interface DateRange {
  /** Start date in YYYY-MM-DD format */
  from: string | null
  /** End date in YYYY-MM-DD format */
  to: string | null
}

export interface DatePreset {
  /** Unique key for the preset */
  key: string
  /** Display label */
  label: string
  /** Function to calculate the date range */
  getRange: () => DateRange
}

export interface DateRangePickerProps {
  /** Label for the field */
  label?: string
  /** Current date range */
  value: DateRange
  /** Callback when date range changes */
  onChange: (range: DateRange) => void
  /** Placeholder text when no date selected */
  placeholder?: string
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Hint text */
  hint?: string
  /** Custom presets (if not provided, default presets are used) */
  presets?: DatePreset[]
  /** Whether to show presets panel */
  showPresets?: boolean
  /** Minimum selectable date (YYYY-MM-DD) */
  minDate?: string
  /** Maximum selectable date (YYYY-MM-DD) */
  maxDate?: string
  /** Additional CSS class */
  className?: string
}

// Date utility functions
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null
  const date = new Date(dateStr + 'T00:00:00')
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDisplayDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = parseDate(dateStr)
  if (!date) return ''
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function getMonthName(month: number): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ]
  return months[month]
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, we want Monday = 0
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

function isDateInRange(date: Date, from: Date | null, to: Date | null): boolean {
  if (!from || !to) return false
  const time = date.getTime()
  return time >= from.getTime() && time <= to.getTime()
}

function isDateDisabled(date: Date, minDate: string | undefined, maxDate: string | undefined): boolean {
  if (minDate) {
    const min = parseDate(minDate)
    if (min && date < min) return true
  }
  if (maxDate) {
    const max = parseDate(maxDate)
    if (max && date > max) return true
  }
  return false
}

// Default presets
function getDefaultPresets(): DatePreset[] {
  const today = new Date()
  const todayStr = formatDate(today)

  return [
    {
      key: 'today',
      label: 'Today',
      getRange: () => ({ from: todayStr, to: todayStr }),
    },
    {
      key: 'yesterday',
      label: 'Yesterday',
      getRange: () => {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const str = formatDate(yesterday)
        return { from: str, to: str }
      },
    },
    {
      key: 'thisWeek',
      label: 'This week',
      getRange: () => {
        const startOfWeek = new Date(today)
        const day = startOfWeek.getDay()
        const diff = day === 0 ? -6 : 1 - day // Monday as start of week
        startOfWeek.setDate(startOfWeek.getDate() + diff)
        return { from: formatDate(startOfWeek), to: todayStr }
      },
    },
    {
      key: 'lastWeek',
      label: 'Last week',
      getRange: () => {
        const startOfLastWeek = new Date(today)
        const day = startOfLastWeek.getDay()
        const diff = day === 0 ? -13 : -6 - day
        startOfLastWeek.setDate(startOfLastWeek.getDate() + diff)
        const endOfLastWeek = new Date(startOfLastWeek)
        endOfLastWeek.setDate(endOfLastWeek.getDate() + 6)
        return { from: formatDate(startOfLastWeek), to: formatDate(endOfLastWeek) }
      },
    },
    {
      key: 'thisMonth',
      label: 'This month',
      getRange: () => {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return { from: formatDate(startOfMonth), to: todayStr }
      },
    },
    {
      key: 'lastMonth',
      label: 'Last month',
      getRange: () => {
        const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        return { from: formatDate(startOfLastMonth), to: formatDate(endOfLastMonth) }
      },
    },
    {
      key: 'thisYear',
      label: 'This year',
      getRange: () => {
        const startOfYear = new Date(today.getFullYear(), 0, 1)
        return { from: formatDate(startOfYear), to: todayStr }
      },
    },
    {
      key: 'lastYear',
      label: 'Last year',
      getRange: () => {
        const startOfLastYear = new Date(today.getFullYear() - 1, 0, 1)
        const endOfLastYear = new Date(today.getFullYear() - 1, 11, 31)
        return { from: formatDate(startOfLastYear), to: formatDate(endOfLastYear) }
      },
    },
    {
      key: 'allTime',
      label: 'All time',
      getRange: () => ({ from: null, to: null }),
    },
  ]
}

// Calendar component for a single month
interface CalendarProps {
  year: number
  month: number
  selectedFrom: Date | null
  selectedTo: Date | null
  selectionMode: 'from' | 'to'
  onDateClick: (date: Date) => void
  onPrevMonth: () => void
  onNextMonth: () => void
  showNavigation?: boolean
  minDate?: string
  maxDate?: string
}

function Calendar({
  year,
  month,
  selectedFrom,
  selectedTo,
  selectionMode,
  onDateClick,
  onPrevMonth,
  onNextMonth,
  showNavigation = true,
  minDate,
  maxDate,
}: Readonly<CalendarProps>) {
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  const weekDays = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

  const days: (number | null)[] = []
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null)
  }
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(day)
  }

  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHeader}>
        {showNavigation && (
          <button
            type="button"
            className={styles.navButton}
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
        )}
        <span className={styles.monthYear}>
          {getMonthName(month)} {year}
        </span>
        {showNavigation && (
          <button
            type="button"
            className={styles.navButton}
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <FontAwesomeIcon icon={faChevronRight} />
          </button>
        )}
      </div>

      <div className={styles.weekDays}>
        {weekDays.map(day => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${year}-${month}-${index}`} className={styles.emptyDay} />
          }

          const date = new Date(year, month, day)
          const isDisabled = isDateDisabled(date, minDate, maxDate)
          const isFromDate = selectedFrom && isSameDay(date, selectedFrom)
          const isToDate = selectedTo && isSameDay(date, selectedTo)
          const isInRange = isDateInRange(date, selectedFrom, selectedTo)
          const isToday = isSameDay(date, new Date())
          const isSelected = Boolean(isFromDate || isToDate)

          return (
            <button
              key={day}
              type="button"
              className={`
                ${styles.dayButton}
                ${isFromDate ? styles.fromDate : ''}
                ${isToDate ? styles.toDate : ''}
                ${isInRange && !isFromDate && !isToDate ? styles.inRange : ''}
                ${isToday && !isFromDate && !isToDate ? styles.today : ''}
                ${isDisabled ? styles.disabled : ''}
              `.trim()}
              onClick={() => !isDisabled && onDateClick(date)}
              disabled={isDisabled}
              aria-label={`${day} ${getMonthName(month)} ${year}${isSelected ? ', selected' : ''}`}
              aria-pressed={isSelected}
            >
              {day}
            </button>
          )
        })}
      </div>

      <div className={styles.calendarLabel}>
        {selectionMode === 'from' ? 'From' : 'To'}
      </div>
    </div>
  )
}

/**
 * DateRangePicker component
 *
 * A date range picker with quick select presets and dual calendar view.
 * Allows users to select a from and to date either by clicking presets
 * or by selecting dates directly from the calendars.
 *
 * @example
 * <DateRangePicker
 *   label="Date Range"
 *   value={{ from: '2025-01-01', to: '2025-01-31' }}
 *   onChange={handleDateRangeChange}
 *   showPresets
 * />
 */
export function DateRangePicker({
  label,
  value,
  onChange,
  placeholder = 'Select dates',
  disabled = false,
  error,
  hint,
  presets,
  showPresets = true,
  minDate,
  maxDate,
  className,
}: Readonly<DateRangePickerProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectionMode, setSelectionMode] = useState<'from' | 'to'>('from')
  // Pending value for Apply/Cancel behavior - selections are stored here until Apply is clicked
  const [pendingValue, setPendingValue] = useState<DateRange>(value)
  // Track which preset was selected (for display only until Apply)
  const [pendingPreset, setPendingPreset] = useState<string | null>(null)

  // Sync pending value when the dropdown opens or external value changes
  useEffect(() => {
    if (isOpen) {
      setPendingValue(value)
      setPendingPreset(null)
    }
  }, [isOpen, value])

  // Calendar view states - use pending value for display
  const fromDate = parseDate(pendingValue.from)
  const toDate = parseDate(pendingValue.to)

  const initialFromMonth = useMemo(() => {
    if (fromDate) {
      return { year: fromDate.getFullYear(), month: fromDate.getMonth() }
    }
    // Default to previous month for left calendar
    const now = new Date()
    const prevMonth = now.getMonth() - 1
    return {
      year: prevMonth < 0 ? now.getFullYear() - 1 : now.getFullYear(),
      month: prevMonth < 0 ? 11 : prevMonth,
    }
  }, [fromDate])

  const initialToMonth = useMemo(() => {
    // Default to current month for right calendar
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  }, [])

  const [fromCalendar, setFromCalendar] = useState(initialFromMonth)
  const [toCalendar, setToCalendar] = useState(initialToMonth)

  // Ensure calendars always show different months (left should be before right)
  useEffect(() => {
    // If both calendars are showing the same month, adjust the left calendar to previous month
    if (fromCalendar.year === toCalendar.year && fromCalendar.month === toCalendar.month) {
      const prevMonth = toCalendar.month - 1
      setFromCalendar({
        year: prevMonth < 0 ? toCalendar.year - 1 : toCalendar.year,
        month: prevMonth < 0 ? 11 : prevMonth,
      })
    }
  }, [fromCalendar, toCalendar])

  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const inputId = useId()
  const labelId = useId()

  const activePresets = presets ?? getDefaultPresets()

  // Get display text
  const displayText = useMemo(() => {
    if (!value.from && !value.to) {
      return placeholder
    }
    if (value.from && value.to) {
      return `${formatDisplayDate(value.from)} - ${formatDisplayDate(value.to)}`
    }
    if (value.from) {
      return `From ${formatDisplayDate(value.from)}`
    }
    return `To ${formatDisplayDate(value.to)}`
  }, [value.from, value.to, placeholder])

  const hasValue = value.from || value.to

  // Toggle dropdown
  const toggleDropdown = useCallback(() => {
    if (disabled) return
    setIsOpen(prev => !prev)
  }, [disabled])

  // Clear selection
  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onChange({ from: null, to: null })
  }, [onChange])

  // Handle preset click - just update pending value, don't apply yet
  const handlePresetClick = useCallback((preset: DatePreset) => {
    const range = preset.getRange()
    setPendingValue(range)
    setPendingPreset(preset.key)

    // If preset has valid from/to dates, update calendar views
    const from = parseDate(range.from)
    const to = parseDate(range.to)
    if (from && to) {
      setFromCalendar({ year: from.getFullYear(), month: from.getMonth() })
      setToCalendar({ year: to.getFullYear(), month: to.getMonth() })
    }
  }, [])

  // Handle date click in calendar - update pending value, don't apply yet
  const handleDateClick = useCallback((date: Date) => {
    const dateStr = formatDate(date)
    setPendingPreset(null) // Clear preset selection when manually selecting dates

    if (selectionMode === 'from') {
      // If clicked date is after current "to" date, reset "to"
      if (toDate && date > toDate) {
        setPendingValue({ from: dateStr, to: null })
      } else {
        setPendingValue(prev => ({ ...prev, from: dateStr }))
      }
      setSelectionMode('to')
    } else if (fromDate && date < fromDate) {
      // "to" mode - If clicked date is before current "from" date, set it as "from" instead
      setPendingValue(prev => ({ from: dateStr, to: prev.to }))
      setSelectionMode('to')
    } else {
      // "to" mode - normal case
      setPendingValue(prev => ({ ...prev, to: dateStr }))
      // Stay open - user needs to click Apply to confirm
      setSelectionMode('from')
    }
  }, [selectionMode, fromDate, toDate])

  // Calendar navigation
  const handleFromPrevMonth = useCallback(() => {
    setFromCalendar(prev => {
      const newMonth = prev.month - 1
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { ...prev, month: newMonth }
    })
  }, [])

  const handleFromNextMonth = useCallback(() => {
    setFromCalendar(prev => {
      const newMonth = prev.month + 1
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { ...prev, month: newMonth }
    })
  }, [])

  const handleToNextMonth = useCallback(() => {
    setToCalendar(prev => {
      const newMonth = prev.month + 1
      if (newMonth > 11) {
        return { year: prev.year + 1, month: 0 }
      }
      return { ...prev, month: newMonth }
    })
  }, [])

  const handleToPrevMonth = useCallback(() => {
    setToCalendar(prev => {
      const newMonth = prev.month - 1
      if (newMonth < 0) {
        return { year: prev.year - 1, month: 11 }
      }
      return { ...prev, month: newMonth }
    })
  }, [])

  // Apply the pending selection
  const handleApply = useCallback(() => {
    onChange(pendingValue)
    setIsOpen(false)
    setSelectionMode('from')
    setPendingPreset(null)
  }, [pendingValue, onChange])

  // Cancel and reset to original value
  const handleCancel = useCallback(() => {
    setPendingValue(value)
    setIsOpen(false)
    setSelectionMode('from')
    setPendingPreset(null)
  }, [value])

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectionMode('from')
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  // Keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return

    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        setIsOpen(false)
        setSelectionMode('from')
        buttonRef.current?.focus()
        break
      case 'Enter':
      case ' ':
        if (!isOpen) {
          event.preventDefault()
          setIsOpen(true)
        }
        break
    }
  }, [disabled, isOpen])

  // Check if a preset is currently active (based on pending value while dropdown is open)
  const isPresetActive = useCallback((preset: DatePreset): boolean => {
    // Check if this preset was explicitly selected
    if (pendingPreset === preset.key) return true
    // Or if the pending values match this preset's range
    const range = preset.getRange()
    return range.from === pendingValue.from && range.to === pendingValue.to
  }, [pendingValue, pendingPreset])

  return (
    <div
      ref={containerRef}
      className={`${styles.container} ${className ?? ''}`}
    >
      {label && (
        <label id={labelId} htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}

      <div className={styles.inputWrapper}>
        <button
          ref={buttonRef}
          id={inputId}
          type="button"
          className={`
            ${styles.trigger}
            ${isOpen ? styles.open : ''}
            ${error ? styles.hasError : ''}
            ${disabled ? styles.disabled : ''}
          `.trim()}
          onClick={toggleDropdown}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-labelledby={label ? labelId : undefined}
        >
          <FontAwesomeIcon icon={faCalendar} className={styles.calendarIcon} />
          <span className={`${styles.displayText} ${hasValue ? '' : styles.placeholder}`}>
            {displayText}
          </span>
          <div className={styles.icons}>
            {hasValue && !disabled && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                aria-label="Clear date range"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            )}
            <FontAwesomeIcon
              icon={faChevronDown}
              className={`${styles.chevron} ${isOpen ? styles.rotated : ''}`}
            />
          </div>
        </button>

        {isOpen && (
          <fieldset className={styles.dropdown}>
            <legend className={styles.srOnly}>Date range picker</legend>
            {showPresets && (
              <div className={styles.presets}>
                {activePresets.map(preset => (
                  <button
                    key={preset.key}
                    type="button"
                    className={`${styles.presetButton} ${isPresetActive(preset) ? styles.active : ''}`}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <div className={styles.trailingContent}>
              <div className={styles.calendars}>
                <Calendar
                  year={fromCalendar.year}
                  month={fromCalendar.month}
                  selectedFrom={fromDate}
                  selectedTo={toDate}
                  selectionMode="from"
                  onDateClick={(date) => {
                    setSelectionMode('from')
                    handleDateClick(date)
                  }}
                  onPrevMonth={handleFromPrevMonth}
                  onNextMonth={handleFromNextMonth}
                  minDate={minDate}
                  maxDate={maxDate}
                />
                <Calendar
                  year={toCalendar.year}
                  month={toCalendar.month}
                  selectedFrom={fromDate}
                  selectedTo={toDate}
                  selectionMode="to"
                  onDateClick={(date) => {
                    setSelectionMode('to')
                    handleDateClick(date)
                  }}
                  onPrevMonth={handleToPrevMonth}
                  onNextMonth={handleToNextMonth}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              </div>

              {/* Action buttons footer */}
              <div className={styles.footer}>
                <div className={styles.dateInputs}>
                  <div className={styles.dateInput}>
                    <span className={styles.dateInputValue}>
                      {pendingValue.from ? formatDisplayDate(pendingValue.from) : 'DD/MM/YYYY'}
                    </span>
                  </div>
                  <span className={styles.dateSeparator}>–</span>
                  <div className={styles.dateInput}>
                    <span className={styles.dateInputValue}>
                      {pendingValue.to ? formatDisplayDate(pendingValue.to) : 'DD/MM/YYYY'}
                    </span>
                  </div>
                </div>
                <div className={styles.footerActions}>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={styles.applyButton}
                    onClick={handleApply}
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </fieldset>
        )}
      </div>

      {hint && !error && <span className={styles.hint}>{hint}</span>}
      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
