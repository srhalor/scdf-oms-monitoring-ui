'use client'

import { useState, useCallback, useId } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import type { ReferenceData } from '@/types/referenceData'
import styles from './MetadataFilterInput.module.css'

export interface MetadataChip {
  /** Reference data ID for the metadata key */
  keyId: number
  /** Display label for the key (for UI display) */
  keyLabel?: string
  /** Value entered by user (can be string, number, or combination - stored as string) */
  value: string
}

export interface MetadataFilterInputProps {
  /** Label for the field */
  label?: string
  /** Available metadata keys from reference data */
  metadataKeys: ReferenceData[]
  /** Current metadata chips */
  chips: MetadataChip[]
  /** Callback when chips change */
  onChange: (chips: MetadataChip[]) => void
  /** Disabled state */
  disabled?: boolean
  /** Error message */
  error?: string
  /** Maximum number of pairs allowed */
  maxPairs?: number
  /** Additional CSS class */
  className?: string
}

/**
 * MetadataFilterInput component
 *
 * Allows users to add multiple metadata key-value pairs for filtering.
 * Keys are selected from a dropdown (reference data), values are free-form text.
 *
 * @example
 * <MetadataFilterInput
 *   label="Metadata Filters"
 *   metadataKeys={metadataKeyOptions}
 *   chips={metadataChips}
 *   onChange={setMetadataChips}
 *   maxPairs={10}
 * />
 */
export function MetadataFilterInput({
  label,
  metadataKeys,
  chips,
  onChange,
  disabled = false,
  error,
  maxPairs = 10,
  className,
}: Readonly<MetadataFilterInputProps>) {
  const [selectedKeyId, setSelectedKeyId] = useState<number | ''>('')
  const [inputValue, setInputValue] = useState('')

  const labelId = useId()
  const canAddMore = chips.length < maxPairs

  // Get available keys (exclude already selected ones)
  const availableKeys = metadataKeys.filter(
    key => !chips.some(chip => chip.keyId === key.id)
  )

  // Add a new chip
  const handleAdd = useCallback(() => {
    if (!selectedKeyId || !inputValue.trim()) return

    const selectedKey = metadataKeys.find(k => k.id === selectedKeyId)
    if (!selectedKey) return

    const newChip: MetadataChip = {
      keyId: selectedKeyId,
      keyLabel: selectedKey.refDataValue,
      value: inputValue.trim(),
    }

    onChange([...chips, newChip])
    setSelectedKeyId('')
    setInputValue('')
  }, [selectedKeyId, inputValue, metadataKeys, chips, onChange])

  // Remove a chip
  const handleRemove = useCallback((keyId: number) => {
    onChange(chips.filter(chip => chip.keyId !== keyId))
  }, [chips, onChange])

  // Handle Enter key to add chip
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && selectedKeyId && inputValue.trim()) {
      event.preventDefault()
      handleAdd()
    }
  }, [selectedKeyId, inputValue, handleAdd])

  return (
    <div className={`${styles.container} ${className ?? ''}`}>
      {label && (
        <label id={labelId} className={styles.label}>
          {label}
        </label>
      )}

      {/* Existing chips */}
      {chips.length > 0 && (
        <ul className={styles.chipList} aria-label="Applied metadata filters">
          {chips.map(chip => (
            <li key={chip.keyId} className={styles.chip}>
              <span className={styles.chipKey}>{chip.keyLabel ?? chip.keyId}</span>
              <span className={styles.chipSeparator}>=</span>
              <span className={styles.chipValue}>{chip.value}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => handleRemove(chip.keyId)}
                disabled={disabled}
                aria-label={`Remove ${chip.keyLabel ?? chip.keyId} filter`}
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Add new chip input */}
      {canAddMore && (
        <div className={styles.addRow}>
          <select
            className={`${styles.keySelect} ${error ? styles.hasError : ''}`}
            value={selectedKeyId}
            onChange={e => setSelectedKeyId(e.target.value ? Number(e.target.value) : '')}
            disabled={disabled || availableKeys.length === 0}
            aria-labelledby={labelId}
          >
            <option value="">Select key...</option>
            {availableKeys.map(key => (
              <option key={key.id} value={key.id}>
                {key.refDataValue}
              </option>
            ))}
          </select>

          <input
            type="text"
            className={`${styles.valueInput} ${error ? styles.hasError : ''}`}
            placeholder="Enter value..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || !selectedKeyId}
            aria-label="Metadata value"
          />

          <Button
            hierarchy="secondary"
            size="sm"
            icon={faPlus}
            label="Add filter"
            onClick={handleAdd}
            disabled={disabled || !selectedKeyId || !inputValue.trim()}
            showTooltip={false}
          />
        </div>
      )}

      {/* Max pairs reached message */}
      {!canAddMore && (
        <span className={styles.maxReached}>
          Maximum of {maxPairs} metadata filters reached
        </span>
      )}

      {error && <span className={styles.error}>{error}</span>}
    </div>
  )
}
