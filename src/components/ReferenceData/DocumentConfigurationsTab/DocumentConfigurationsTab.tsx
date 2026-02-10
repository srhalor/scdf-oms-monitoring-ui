'use client'

import { useMemo, useCallback } from 'react'
import {
  DocumentConfigurationForm,
  type DocumentConfigurationFormProps,
} from '@/components/ReferenceData/DocumentConfigurationForm'
import { RefDataTabTemplate, type RefDataColumn } from '@/components/ReferenceData/RefDataTabTemplate'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useRefDataCrud } from '@/hooks/useRefDataCrud'
import commonStyles from '@/styles/common.module.css'
import { formatDisplayDate } from '@/utils/dateUtils'
import type { DocumentConfiguration, DocumentConfigurationRequest } from '@/types/documentConfiguration'
import type { ReferenceData } from '@/types/referenceData'

/**
 * Document Configurations Tab Component (Refactored)
 *
 * Self-contained tab using useRefDataCrud hook and RefDataTabTemplate.
 * Fetches dropdown options and passes to form.
 *
 * Reduced from 284 lines to ~120 lines.
 */
export function DocumentConfigurationsTab() {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''

  // Use generic CRUD hook for document configurations
  const crud = useRefDataCrud<DocumentConfiguration, DocumentConfigurationRequest>({
    endpoint: `${basePath}/api/document-configurations`,
  })

  // Fetch dropdown options for the form
  const { data: footerOptionsData, loading: footerLoading } = useApiQuery<ReferenceData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/reference-data/types?refDataType=FOOTER_ID`)
      if (!response.ok) throw new Error('Failed to fetch footer options')
      return response.json()
    },
  })

  const { data: appDocSpecOptionsData, loading: appDocSpecLoading } = useApiQuery<ReferenceData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/reference-data/types?refDataType=APP_DOC_SPEC`)
      if (!response.ok) throw new Error('Failed to fetch app doc spec options')
      return response.json()
    },
  })

  const { data: codeOptionsData, loading: codeLoading } = useApiQuery<ReferenceData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/reference-data/types?refDataType=DOC_CONFIG_CODE`)
      if (!response.ok) throw new Error('Failed to fetch code options')
      return response.json()
    },
  })

  const footerOptions = footerOptionsData ?? []
  const appDocSpecOptions = appDocSpecOptionsData ?? []
  const codeOptions = codeOptionsData ?? []
  const optionsLoading = footerLoading || appDocSpecLoading || codeLoading

  // Column definitions
  const columns: RefDataColumn<DocumentConfiguration>[] = useMemo(
    () => [
      {
        key: 'value',
        label: 'Value',
        width: '200px',
      },
      {
        key: 'desc',
        label: 'Description',
      },
      {
        key: 'footer',
        label: 'Footer',
        width: '150px',
        render: (item) => item.footer?.refDataValue || '-',
      },
      {
        key: 'appDocSpec',
        label: 'App Doc Spec',
        width: '150px',
        render: (item) => item.appDocSpec?.refDataValue || '-',
      },
      {
        key: 'code',
        label: 'Code',
        width: '120px',
        render: (item) => item.code?.refDataValue || '-',
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

  // Memoize form component with dropdown options
  const FormComponentWithOptions = useCallback(
    (
      props: Omit<
        DocumentConfigurationFormProps,
        'footerOptions' | 'appDocSpecOptions' | 'codeOptions' | 'optionsLoading'
      >
    ) => (
      <DocumentConfigurationForm
        {...props}
        footerOptions={footerOptions}
        appDocSpecOptions={appDocSpecOptions}
        codeOptions={codeOptions}
        optionsLoading={optionsLoading}
      />
    ),
    [footerOptions, appDocSpecOptions, codeOptions, optionsLoading]
  )

  return (
    <RefDataTabTemplate
      title="Document Configurations"
      crud={crud}
      columns={columns}
      FormComponent={FormComponentWithOptions}
      createButtonText="Create New Configuration"
      emptyMessage="No document configurations found"
      deleteConfirmMessage={(item: DocumentConfiguration) =>
        `Are you sure you want to delete document configuration "${item.value}"? This action cannot be undone.`
      }
    />
  )
}
