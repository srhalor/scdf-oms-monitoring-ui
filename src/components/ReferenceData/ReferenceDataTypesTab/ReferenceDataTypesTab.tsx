'use client'

import { useMemo } from 'react'
import { RefDataTabTemplate, type RefDataColumn } from '@/components/ReferenceData/RefDataTabTemplate'
import { ReferenceDataForm } from '@/components/ReferenceData/ReferenceDataForm'
import { useRefDataCrud } from '@/hooks/useRefDataCrud'
import { formatDisplayDate } from '@/utils/dateUtils'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'
import commonStyles from '@/styles/common.module.css'

/**
 * Reference Data Types Tab Component (Refactored)
 *
 * Self-contained tab using useRefDataCrud hook and RefDataTabTemplate.
 * Displays a table of reference data types with CRUD operations.
 *
 * This replaces the old 262-line implementation with a clean 60-line version
 * that delegates all complexity to reusable hooks and components.
 */
export function ReferenceDataTypesTab() {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''

  // Use generic CRUD hook - handles fetch, create, update, delete, modals
  const crud = useRefDataCrud<ReferenceData, ReferenceDataRequest>({
    endpoint: `${basePath}/api/reference-data/types`,
  })

  // Column definitions - only what's unique to this tab
  const columns: RefDataColumn<ReferenceData>[] = useMemo(
    () => [
      {
        key: 'refDataValue',
        label: 'Ref Data Type',
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

  // Render using template - handles table, modals, CRUD actions
  return (
    <RefDataTabTemplate
      title="Reference Data Types"
      crud={crud}
      columns={columns}
      FormComponent={ReferenceDataForm}
      formProps={{ defaultRefDataType: 'REF_DATA_TYPE' }}
      createButtonText="Create New Type"
      emptyMessage="No reference data types found"
      deleteConfirmMessage={(item: ReferenceData) =>
        `Are you sure you want to delete "${item.refDataValue}"? This action cannot be undone.`
      }
    />
  )
}
