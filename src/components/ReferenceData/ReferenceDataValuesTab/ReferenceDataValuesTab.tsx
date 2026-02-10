'use client'

import { useMemo, useState } from 'react'
import { RefDataTabTemplate, type RefDataColumn } from '@/components/ReferenceData/RefDataTabTemplate'
import { ReferenceDataForm } from '@/components/ReferenceData/ReferenceDataForm'
import refDataStyles from '@/components/ReferenceData/styles.module.css'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useRefDataCrud } from '@/hooks/useRefDataCrud'
import commonStyles from '@/styles/common.module.css'
import { formatDisplayDate } from '@/utils/dateUtils'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'

/**
 * Reference Data Values Tab Component (Refactored)
 *
 * Self-contained tab with type dropdown + filtered data.
 * Uses useRefDataCrud hook with conditional fetching based on selected type.
 *
 * Reduced from 324 lines to ~120 lines.
 */
export function ReferenceDataValuesTab() {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''
  
  // Fetch available reference data types for dropdown
  const { data: refDataTypes, loading: typesLoading } = useApiQuery<ReferenceData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/reference-data/types`)
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`)
      return response.json()
    },
  })

  // Type selection state
  const [selectedType, setSelectedType] = useState('')

  // Use generic CRUD hook with conditional fetch based on selected type
  const crud = useRefDataCrud<ReferenceData, ReferenceDataRequest>({
    endpoint: `${basePath}/api/reference-data/types`,
    queryParams: selectedType ? `refDataType=${encodeURIComponent(selectedType)}` : '',
    enabled: Boolean(selectedType),
  })

  // Column definitions
  const columns: RefDataColumn<ReferenceData>[] = useMemo(
    () => [
      {
        key: 'refDataType',
        label: 'Ref Data Type',
        width: '200px',
      },
      {
        key: 'refDataValue',
        label: 'Value',
        width: '200px',
      },
      {
        key: 'description',
        label: 'Description',
      },
      {
        key: 'effectFromDat',
        label: 'Effective From',
        width: '140px',
        render: (item) => (
          <span className={commonStyles.dateCell}>{formatDisplayDate(item.effectFromDat)}</span>
        ),
      },
      {
        key: 'effectToDat',
        label: 'Effective To',
        width: '140px',
        render: (item) => (
          <span className={commonStyles.dateCell}>{formatDisplayDate(item.effectToDat)}</span>
        ),
      },
      {
        key: 'lastUpdateUid',
        label: 'Updated By',
        width: '120px',
      },
    ],
    []
  )

  // Custom header with type dropdown
  const renderCustomHeader = () => (
    <div className={refDataStyles.typeSelectorWrapper}>
      <label htmlFor="refDataTypeSelect" className={refDataStyles.typeSelectorLabel}>
        Select Reference Data Type:
      </label>
      <select
        id="refDataTypeSelect"
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value)}
        disabled={typesLoading}
        className={refDataStyles.typeSelectorSelect}
      >
        <option value="">-- Select a type --</option>
        {refDataTypes?.map((type) => (
          <option key={type.id} value={type.refDataValue}>
            {type.refDataValue}
          </option>
        ))}
      </select>
    </div>
  )

  // If no type selected, show selection prompt
  if (!selectedType) {
    return (
      <div className={commonStyles.contentWrapper}>
        {renderCustomHeader()}
        <div className={commonStyles.emptyState}>
          Please select a reference data type to view its values.
        </div>
      </div>
    )
  }

  return (
    <div>
      {renderCustomHeader()}
      <RefDataTabTemplate
        title={`Reference Data Values - ${selectedType}`}
        crud={crud}
        columns={columns}
        FormComponent={ReferenceDataForm}
        formProps={{ defaultRefDataType: selectedType }}
        createButtonText="Create New Value"
        emptyMessage={`No values found for type "${selectedType}"`}
        deleteConfirmMessage={(item: ReferenceData) =>
          `Are you sure you want to delete "${item.refDataValue}"? This action cannot be undone.`
        }
      />
    </div>
  )
}
