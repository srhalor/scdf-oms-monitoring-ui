'use client'

import { useCallback, useEffect, useState } from 'react'
import { Tabs, type TabItem } from '@/components/shared/Tabs'
import { logger } from '@/lib/logger'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { ReferenceDataTypesTab } from '@/components/ReferenceData/ReferenceDataTypesTab'
import { ReferenceDataValuesTab } from '@/components/ReferenceData/ReferenceDataValuesTab'
import { ReferenceDataForm } from '@/components/ReferenceData/ReferenceDataForm'
import { DocumentConfigurationsTab } from '@/components/ReferenceData/DocumentConfigurationsTab'
import { DocumentConfigurationForm } from '@/components/ReferenceData/DocumentConfigurationForm'
import { useApiQuery } from '@/hooks/useApiQuery'
import { useApiMutation } from '@/hooks/useApiMutation'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'
import type { DocumentConfiguration, DocumentConfigurationRequest } from '@/types/documentConfiguration'

/**
 * Tab configuration for Reference Data page
 */
const TAB_IDS = {
  TYPES: 'reference-data-types',
  VALUES: 'reference-data-values',
  CONFIGURATIONS: 'document-configurations',
} as const

const TABS: TabItem[] = [
  { id: TAB_IDS.TYPES, label: 'Reference Data Types' },
  { id: TAB_IDS.VALUES, label: 'Reference Data Values' },
  { id: TAB_IDS.CONFIGURATIONS, label: 'Document Configurations' },
]

/**
 * Modal state for create/edit/delete operations
 */
/**
 * Modal actions (use enum to avoid large union literal types)
 */
enum ModalAction {
  Create = 'create',
  Edit = 'edit',
  Delete = 'delete',
}

interface ModalState {
  type: ModalAction | null
  item: ReferenceData | null
  /** Context for which tab the modal is from */
  context: 'types' | 'values' | 'configurations'
}

/**
 * Modal state for document configuration operations
 */
interface DocConfigModalState {
  type: ModalAction | null
  item: DocumentConfiguration | null
}

/**
 * Reference Data Page Content
 *
 * Client component that handles the tab navigation and data fetching
 * for the Reference Data management page.
 */
export function ReferenceDataContent() {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''
  const [activeTab, setActiveTab] = useState<string>(TAB_IDS.CONFIGURATIONS)

  // Fetch reference data types using useApiQuery
  const {
    data: referenceDataTypes,
    loading: typesLoading,
    error: typesApiError,
    refetch: refetchReferenceDataTypes,
  } = useApiQuery<ReferenceData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/reference-data/types`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      return response.json()
    },
  })

  const typesError = typesApiError?.message || null

  // Reference Data Values tab state
  const [selectedRefDataType, setSelectedRefDataType] = useState('')

  // Fetch reference data values using useApiQuery (conditional on selected type)
  const {
    data: referenceDataValues,
    loading: valuesLoading,
    error: valuesApiError,
    refetch: refetchReferenceDataValues,
  } = useApiQuery<ReferenceData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/reference-data/types?refDataType=${encodeURIComponent(selectedRefDataType)}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      return response.json()
    },
    enabled: Boolean(selectedRefDataType),
  })

  const valuesError = valuesApiError?.message || null

  // Refetch values when selected type changes
  useEffect(() => {
    if (selectedRefDataType) {
      refetchReferenceDataValues()
    }
  }, [selectedRefDataType, refetchReferenceDataValues])

  // Modal state
  const [modalState, setModalState] = useState<ModalState>({ type: null, item: null, context: 'types' })

  // Document Configurations tab state
  const {
    data: documentConfigurations,
    loading: configsLoading,
    error: configsApiError,
    refetch: refetchDocumentConfigurations,
  } = useApiQuery<DocumentConfiguration[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}/api/document-configurations`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      return response.json()
    },
  })

  const configsError = configsApiError?.message || null

  // Document Configuration modal state
  const [docConfigModalState, setDocConfigModalState] = useState<DocConfigModalState>({
    type: null,
    item: null,
  })

  // Document configuration create/update mutation
  const { mutate: saveDocumentConfiguration } = useApiMutation<DocumentConfiguration, { data: DocumentConfigurationRequest; isEdit: boolean; id?: number }>({
    mutationFn: async ({ data, isEdit, id }) => {
      const url = isEdit && id
        ? `${basePath}/api/document-configurations/${id}`
        : `${basePath}/api/document-configurations`
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? `Failed to ${isEdit ? 'update' : 'create'} document configuration`)
      }

      return response.json()
    },
    onSuccess: () => {
      refetchDocumentConfigurations()
      closeDocConfigModal()
    },
  })

  // Document configuration delete mutation
  const { mutate: deleteDocumentConfiguration, loading: docConfigDeleteLoading } = useApiMutation<void, { id: number }>({
    mutationFn: async ({ id }) => {
      const response = await fetch(`${basePath}/api/document-configurations/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to delete document configuration')
      }
    },
    onSuccess: () => {
      refetchDocumentConfigurations()
      closeDocConfigModal()
    },
    onError: (error) => {
      logger.error('ReferenceDataContent', 'Delete document configuration error', error)
    },
  })

  // Dropdown options for document configuration form
  const [footerOptions, setFooterOptions] = useState<ReferenceData[]>([])
  const [appDocSpecOptions, setAppDocSpecOptions] = useState<ReferenceData[]>([])
  const [codeOptions, setCodeOptions] = useState<ReferenceData[]>([])
  const [optionsLoading, setOptionsLoading] = useState(false)

  // Reference data create/update mutation
  const { mutate: saveReferenceData } = useApiMutation<ReferenceData, { data: ReferenceDataRequest; isEdit: boolean; id?: number }>({
    mutationFn: async ({ data, isEdit, id }) => {
      const url = isEdit && id
        ? `${basePath}/api/reference-data/types/${id}`
        : `${basePath}/api/reference-data/types`
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? `Failed to ${isEdit ? 'update' : 'create'} reference data`)
      }

      return response.json()
    },
    onSuccess: () => {
      const isValuesContext = modalState.context === 'values'
      if (isValuesContext) {
        refetchReferenceDataValues()
      } else {
        refetchReferenceDataTypes()
      }
    },
  })

  // Reference data delete mutation
  const { mutate: deleteReferenceData, loading: deleteRefDataLoading } = useApiMutation<void, { id: number }>({
    mutationFn: async ({ id }) => {
      const response = await fetch(`${basePath}/api/reference-data/types/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to delete reference data')
      }
    },
    onSuccess: () => {
      const isValuesContext = modalState.context === 'values'
      if (isValuesContext) {
        refetchReferenceDataValues()
      } else {
        refetchReferenceDataTypes()
      }
      closeModal()
    },
    onError: (error) => {
      logger.error('ReferenceDataContent', 'Delete error', error)
    },
  })

  /**
   * Fetch dropdown options for document configuration form
   */
  const fetchDocConfigOptions = useCallback(async () => {
    setOptionsLoading(true)

    try {
      const [footerRes, appDocSpecRes, codeRes] = await Promise.all([
        fetch(`${basePath}/api/reference-data/types?refDataType=FOOTER_ID`),
        fetch(`${basePath}/api/reference-data/types?refDataType=APP_DOC_SPEC`),
        fetch(`${basePath}/api/reference-data/types?refDataType=DOC_CONFIG_CODE`),
      ])

      if (footerRes.ok) {
        setFooterOptions(await footerRes.json())
      }
      if (appDocSpecRes.ok) {
        setAppDocSpecOptions(await appDocSpecRes.json())
      }
      if (codeRes.ok) {
        setCodeOptions(await codeRes.json())
      }
    } catch (err) {
      logger.error('ReferenceDataContent', 'Failed to fetch dropdown options', err)
    } finally {
      setOptionsLoading(false)
    }
  }, [])


  // Fetch dropdown options when opening document configuration form
  useEffect(() => {
    if (docConfigModalState.type === ModalAction.Create || docConfigModalState.type === ModalAction.Edit) {
      fetchDocConfigOptions()
    }
  }, [docConfigModalState.type, fetchDocConfigOptions])

  /**
   * Handle type selection change in values tab
   */
  const handleTypeChange = useCallback((type: string) => {
    setSelectedRefDataType(type)
  }, [])

  /**
   * Close any open modal
   */
  const closeModal = useCallback(() => {
    setModalState({ type: null, item: null, context: 'types' })
  }, [])

  /**
   * Handle create new reference data (types tab)
   */
  const handleCreateType = useCallback(() => {
    setModalState({ type: ModalAction.Create, item: null, context: 'types' })
  }, [])

  /**
   * Handle create new reference data (values tab)
   */
  const handleCreateValue = useCallback(() => {
    setModalState({ type: ModalAction.Create, item: null, context: 'values' })
  }, [])

  /**
   * Handle edit reference data (types tab)
   */
  const handleEditType = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Edit, item, context: 'types' })
  }, [])

  /**
   * Handle edit reference data (values tab)
   */
  const handleEditValue = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Edit, item, context: 'values' })
  }, [])

  /**
   * Handle delete reference data (types tab)
   */
  const handleDeleteType = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Delete, item, context: 'types' })
  }, [])

  /**
   * Handle delete reference data (values tab)
   */
  const handleDeleteValue = useCallback((item: ReferenceData) => {
    setModalState({ type: ModalAction.Delete, item, context: 'values' })
  }, [])

  /**
   * Submit create/edit form
   */
  const handleFormSubmit = useCallback(
    async (data: ReferenceDataRequest) => {
      const isEdit = modalState.type === 'edit' && modalState.item !== null
      const editItem = modalState.item

      saveReferenceData({
        data,
        isEdit,
        id: editItem?.id,
      })
    },
    [modalState, saveReferenceData]
  )

  /**
   * Confirm delete action
   */
  const handleConfirmDelete = useCallback(async () => {
    if (!modalState.item) {
      return
    }

    deleteReferenceData({ id: modalState.item.id })
  }, [modalState.item, deleteReferenceData])

  /**
   * Close document configuration modal
   */
  const closeDocConfigModal = useCallback(() => {
    setDocConfigModalState({ type: null, item: null })
  }, [])

  /**
   * Handle create new document configuration
   */
  const handleCreateDocConfig = useCallback(() => {
    setDocConfigModalState({ type: ModalAction.Create, item: null })
  }, [])

  /**
   * Handle edit document configuration
   */
  const handleEditDocConfig = useCallback((item: DocumentConfiguration) => {
    setDocConfigModalState({ type: ModalAction.Edit, item })
  }, [])

  /**
   * Handle delete document configuration
   */
  const handleDeleteDocConfig = useCallback((item: DocumentConfiguration) => {
    setDocConfigModalState({ type: ModalAction.Delete, item })
  }, [])

  /**
   * Submit document configuration create/edit form
   */
  const handleDocConfigFormSubmit = useCallback(
    async (data: DocumentConfigurationRequest) => {
      const isEdit = docConfigModalState.type === 'edit' && docConfigModalState.item !== null
      const editItem = docConfigModalState.item

      saveDocumentConfiguration({
        data,
        isEdit,
        id: editItem?.id,
      })
    },
    [docConfigModalState, saveDocumentConfiguration]
  )

  /**
   * Confirm delete document configuration
   */
  const handleConfirmDeleteDocConfig = useCallback(async () => {
    if (!docConfigModalState.item) {
      return
    }

    deleteDocumentConfiguration({ id: docConfigModalState.item.id })
  }, [docConfigModalState.item, deleteDocumentConfiguration])

  /**
   * Render tab content based on active tab
   */
  const renderTabContent = (tabId: string) => {
    switch (tabId) {
      case TAB_IDS.TYPES:
        return (
          <ReferenceDataTypesTab
            data={referenceDataTypes ?? []}
            loading={typesLoading}
            error={typesError}
            onRefresh={refetchReferenceDataTypes}
            onCreate={handleCreateType}
            onEdit={handleEditType}
            onDelete={handleDeleteType}
          />
        )
      case TAB_IDS.VALUES:
        return (
          <ReferenceDataValuesTab
            refDataTypes={referenceDataTypes ?? []}
            typesLoading={typesLoading}
            data={referenceDataValues ?? []}
            loading={valuesLoading}
            error={valuesError}
            selectedType={selectedRefDataType}
            onTypeChange={handleTypeChange}
            onRefresh={refetchReferenceDataValues}
            onCreate={handleCreateValue}
            onEdit={handleEditValue}
            onDelete={handleDeleteValue}
          />
        )
      case TAB_IDS.CONFIGURATIONS:
        return (
          <DocumentConfigurationsTab
            data={documentConfigurations ?? []}
            loading={configsLoading}
            error={configsError}
            onRefresh={refetchDocumentConfigurations}
            onCreate={handleCreateDocConfig}
            onEdit={handleEditDocConfig}
            onDelete={handleDeleteDocConfig}
          />
        )
      default:
        return null
    }
  }

  return (
    <>
      <Tabs
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        variant="underline"
      >
        {renderTabContent}
      </Tabs>

      {/* Create/Edit Form Modal */}
      <ReferenceDataForm
        isOpen={modalState.type === 'create' || modalState.type === 'edit'}
        onClose={closeModal}
        onSubmit={handleFormSubmit}
        initialData={modalState.item}
        defaultRefDataType={modalState.context === 'values' ? selectedRefDataType : 'REF_DATA_TYPE'}
        mode={modalState.type === 'edit' ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={modalState.type === 'delete'}
        onClose={closeModal}
        onConfirm={handleConfirmDelete}
        title="Delete Reference Data"
        message={
          <>
            Are you sure you want to delete{' '}
            <strong>{modalState.item?.refDataValue}</strong>?
          </>
        }
        details="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteRefDataLoading}
      />

      {/* Document Configuration Create/Edit Form Modal */}
      <DocumentConfigurationForm
        isOpen={docConfigModalState.type === 'create' || docConfigModalState.type === 'edit'}
        onClose={closeDocConfigModal}
        onSubmit={handleDocConfigFormSubmit}
        initialData={docConfigModalState.item}
        mode={docConfigModalState.type === 'edit' ? 'edit' : 'create'}
        footerOptions={footerOptions}
        appDocSpecOptions={appDocSpecOptions}
        codeOptions={codeOptions}
        optionsLoading={optionsLoading}
      />

      {/* Document Configuration Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={docConfigModalState.type === 'delete'}
        onClose={closeDocConfigModal}
        onConfirm={handleConfirmDeleteDocConfig}
        title="Delete Document Configuration"
        message={
          <>
            Are you sure you want to delete document configuration{' '}
            <strong>{docConfigModalState.item?.value}</strong>?
          </>
        }
        details="This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={docConfigDeleteLoading}
      />
    </>
  )
}
