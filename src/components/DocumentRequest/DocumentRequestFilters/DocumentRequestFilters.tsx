'use client'

import { useCallback, useState } from 'react'
import { faRotateLeft, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/components/shared/Button'
import { Card } from '@/components/shared/Card'
import { TextInput } from '@/components/shared/FormField'
import { MultiSelect, SelectOption } from '@/components/shared/MultiSelect'
import { MetadataFilterInput } from '@/components/shared/MetadataFilterInput'
import { DateRangePicker, DateRange } from '@/components/shared/DateRangePicker'
import { DocumentRequestFilters as FiltersType, MetadataChip, FILTER_LIMITS } from '@/types/documentRequest'
import { ReferenceData } from '@/types/referenceData'
import styles from './DocumentRequestFilters.module.css'

export interface DocumentRequestFiltersProps {
  /** Current filter values */
  filters: FiltersType
  /** Callback when filters change */
  onFiltersChange: (filters: FiltersType) => void
  /** Callback when search is triggered */
  onSearch: () => void
  /** Callback to reset all filters */
  onReset: () => void
  /** Source systems reference data */
  sourceSystems: ReferenceData[]
  /** Document types reference data */
  documentTypes: ReferenceData[]
  /** Document names reference data */
  documentNames: ReferenceData[]
  /** Document statuses reference data */
  documentStatuses: ReferenceData[]
  /** Metadata keys reference data */
  metadataKeys: ReferenceData[]
  /** Loading state */
  isLoading?: boolean
  /** Whether filters have validation errors */
  hasErrors?: boolean
  /** Validation error messages */
  validationErrors?: {
    requestIds?: string
    batchIds?: string
    metadataChips?: string
    dateRange?: string
  }
}

/**
 * Parse comma-separated IDs string into number array
 */
function parseIds(value: string): number[] {
  if (!value.trim()) return []
  return value
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '')
    .map(s => Number.parseInt(s, 10))
    .filter(n => !Number.isNaN(n))
}

/**
 * Format number array to comma-separated string
 */
function formatIds(ids: number[]): string {
  return ids.join(', ')
}

/**
 * DocumentRequestFilters component
 *
 * Filter panel for document request search with:
 * - ID inputs (comma-separated)
 * - Multi-select dropdowns for reference data
 * - Date range pickers
 * - Metadata key-value filters
 *
 * @example
 * <DocumentRequestFilters
 *   filters={filters}
 *   onFiltersChange={handleFiltersChange}
 *   onSearch={handleSearch}
 *   onReset={handleReset}
 *   sourceSystems={sourceSystems}
 *   documentTypes={documentTypes}
 *   documentNames={documentNames}
 *   documentStatuses={documentStatuses}
 *   metadataKeys={metadataKeys}
 * />
 */
export function DocumentRequestFilters({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  sourceSystems,
  documentTypes,
  documentNames,
  documentStatuses,
  metadataKeys,
  isLoading = false,
  hasErrors = false,
  validationErrors = {},
}: Readonly<DocumentRequestFiltersProps>) {
  // Local state for ID text inputs
  const [requestIdsText, setRequestIdsText] = useState(formatIds(filters.requestIds))
  const [batchIdsText, setBatchIdsText] = useState(formatIds(filters.batchIds))

  // Convert reference data to select options
  const toSelectOptions = useCallback((data: ReferenceData[]): SelectOption[] => {
    return data.map(item => ({
      value: item.id,
      label: item.refDataValue,
    }))
  }, [])

  // Handle ID text changes
  const handleRequestIdsChange = useCallback((value: string) => {
    setRequestIdsText(value)
    const ids = parseIds(value)
    onFiltersChange({ ...filters, requestIds: ids.slice(0, FILTER_LIMITS.maxRequestIds) })
  }, [filters, onFiltersChange])

  const handleBatchIdsChange = useCallback((value: string) => {
    setBatchIdsText(value)
    const ids = parseIds(value)
    onFiltersChange({ ...filters, batchIds: ids.slice(0, FILTER_LIMITS.maxBatchIds) })
  }, [filters, onFiltersChange])

  // Handle multi-select changes
  const handleSourceSystemsChange = useCallback((selected: (string | number)[]) => {
    onFiltersChange({ ...filters, sourceSystems: selected as number[] })
  }, [filters, onFiltersChange])

  const handleDocumentTypesChange = useCallback((selected: (string | number)[]) => {
    onFiltersChange({ ...filters, documentTypes: selected as number[] })
  }, [filters, onFiltersChange])

  const handleDocumentNamesChange = useCallback((selected: (string | number)[]) => {
    onFiltersChange({ ...filters, documentNames: selected as number[] })
  }, [filters, onFiltersChange])

  const handleDocumentStatusesChange = useCallback((selected: (string | number)[]) => {
    onFiltersChange({ ...filters, documentStatuses: selected as number[] })
  }, [filters, onFiltersChange])

  // Handle date range changes
  const handleDateRangeChange = useCallback((range: DateRange) => {
    onFiltersChange({ ...filters, fromDate: range.from, toDate: range.to })
  }, [filters, onFiltersChange])

  // Handle metadata chips
  const handleMetadataChipsChange = useCallback((chips: MetadataChip[]) => {
    onFiltersChange({ ...filters, metadataChips: chips })
  }, [filters, onFiltersChange])

  // Handle reset
  const handleReset = useCallback(() => {
    setRequestIdsText('')
    setBatchIdsText('')
    onReset()
  }, [onReset])

  return (
    <Card title="Search Filters" className={styles.filtersCard}>
      <form
        className={styles.filtersContainer}
        onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
          e.preventDefault()
          if (!hasErrors && !isLoading) {
            onSearch()
          }
        }}
      >
        {/* Row 1: ID inputs + Date range */}
        <div className={styles.filterRow}>
          <TextInput
            label="Request IDs"
            name="requestIds"
            type="text"
            placeholder="e.g., 101, 102, 103"
            value={requestIdsText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleRequestIdsChange(e.target.value)}
            hint={`Max ${FILTER_LIMITS.maxRequestIds} IDs, comma-separated`}
            error={validationErrors.requestIds}
            className={styles.idInput}
          />
          <TextInput
            label="Batch IDs"
            name="batchIds"
            type="text"
            placeholder="e.g., 501, 502"
            value={batchIdsText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBatchIdsChange(e.target.value)}
            hint={`Max ${FILTER_LIMITS.maxBatchIds} IDs, comma-separated`}
            error={validationErrors.batchIds}
            className={styles.idInput}
          />
          <DateRangePicker
            label="Date Range"
            value={{ from: filters.fromDate, to: filters.toDate }}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            error={validationErrors.dateRange}
            showPresets
            className={styles.dateRangePicker}
          />
        </div>

        {/* Row 2: Reference data dropdowns */}
        <div className={styles.filterRow}>
          <MultiSelect
            label="Source Systems"
            options={toSelectOptions(sourceSystems)}
            selected={filters.sourceSystems}
            onChange={handleSourceSystemsChange}
            placeholder="All source systems"
            searchable
            className={styles.multiSelect}
          />
          <MultiSelect
            label="Document Types"
            options={toSelectOptions(documentTypes)}
            selected={filters.documentTypes}
            onChange={handleDocumentTypesChange}
            placeholder="All document types"
            searchable
            className={styles.multiSelect}
          />
          <MultiSelect
            label="Document Names"
            options={toSelectOptions(documentNames)}
            selected={filters.documentNames}
            onChange={handleDocumentNamesChange}
            placeholder="All document names"
            searchable
            className={styles.multiSelect}
          />
          <MultiSelect
            label="Document Statuses"
            options={toSelectOptions(documentStatuses)}
            selected={filters.documentStatuses}
            onChange={handleDocumentStatusesChange}
            placeholder="All statuses"
            className={styles.multiSelect}
          />
        </div>

        {/* Row 3: Metadata filters */}
        <div className={styles.filterRow}>
          <MetadataFilterInput
            label="Metadata Filters"
            metadataKeys={metadataKeys}
            chips={filters.metadataChips}
            onChange={handleMetadataChipsChange}
            maxPairs={FILTER_LIMITS.maxMetadataChips}
            error={validationErrors.metadataChips}
            className={styles.metadataInput}
          />
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <Button
            hierarchy="primary"
            size="md"
            iconBefore={faMagnifyingGlass}
            type="submit"
            disabled={hasErrors || isLoading}
          >
            Search
          </Button>
          <Button
            hierarchy="secondary"
            size="md"
            iconBefore={faRotateLeft}
            onClick={handleReset}
            type="button"
            disabled={isLoading}
          >
            Reset
          </Button>
        </div>
      </form>
    </Card>
  )
}
