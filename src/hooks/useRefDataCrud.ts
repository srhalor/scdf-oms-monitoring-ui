import { useCallback, useState } from 'react'
import { useApiQuery } from './useApiQuery'
import { useApiMutation } from './useApiMutation'
import { logger } from '@/lib/logger'

export interface UseRefDataCrudOptions<_TData, _TRequest> {
  /** API endpoint for fetching data */
  endpoint: string
  /** Optional query parameters for fetch */
  queryParams?: string
  /** Whether to enable fetching (default: true) */
  enabled?: boolean
  /** Callback after successful save */
  onSaveSuccess?: () => void
  /** Callback after successful delete */
  onDeleteSuccess?: () => void
}

export interface UseRefDataCrudReturn<TData, TRequest> {
  // Data state
  data: TData[] | null
  loading: boolean
  error: string | null
  
  // Refetch function
  refetch: () => Promise<void>
  
  // Mutation functions
  save: (data: TRequest, isEdit: boolean, id?: number) => void
  remove: (id: number) => void
  
  // Mutation loading states
  isSaving: boolean
  isDeleting: boolean
  
  // Modal state management
  modalState: {
    type: 'create' | 'edit' | 'delete' | null
    item: TData | null
  }
  openCreateModal: () => void
  openEditModal: (item: TData) => void
  openDeleteModal: (item: TData) => void
  closeModal: () => void
}

/**
 * useRefDataCrud Hook
 *
 * Reusable hook for managing CRUD operations on reference data entities.
 * Handles data fetching, create/update/delete mutations, and modal state management.
 *
 * Features:
 * - Data fetching with useApiQuery
 * - Create/Update/Delete mutations with useApiMutation
 * - Automatic refetch after mutations
 * - Modal state management for forms and confirmations
 * - Loading and error states
 *
 * @example
 * ```tsx
 * const {
 *   data: types,
 *   loading,
 *   save,
 *   remove,
 *   modalState,
 *   openCreateModal,
 *   closeModal
 * } = useRefDataCrud<ReferenceData, ReferenceDataRequest>({
 *   endpoint: '/api/reference-data/types'
 * })
 *
 * // In your component
 * <Button onClick={openCreateModal}>Create New</Button>
 * <ReferenceDataForm
 *   isOpen={modalState.type === 'create'}
 *   onClose={closeModal}
 *   onSubmit={(data) => save(data, false)}
 * />
 * ```
 */
export function useRefDataCrud<TData extends { id: number }, TRequest>({
  endpoint,
  queryParams = '',
  enabled = true,
  onSaveSuccess,
  onDeleteSuccess,
}: UseRefDataCrudOptions<TData, TRequest>): UseRefDataCrudReturn<TData, TRequest> {
  const basePath = process.env.NEXT_PUBLIC_BASEPATH || ''
  const fullEndpoint = queryParams ? `${endpoint}?${queryParams}` : endpoint

  // Modal state
  const [modalState, setModalState] = useState<{
    type: 'create' | 'edit' | 'delete' | null
    item: TData | null
  }>({
    type: null,
    item: null,
  })

  // Fetch data
  const {
    data,
    loading,
    error: apiError,
    refetch,
  } = useApiQuery<TData[]>({
    queryFn: async () => {
      const response = await fetch(`${basePath}${fullEndpoint}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`)
      }
      return response.json()
    },
    enabled,
  })

  const error = apiError?.message || null

  // Close modal callback
  const closeModal = useCallback(() => {
    setModalState({ type: null, item: null })
  }, [])

  // Save mutation (create or update)
  const { mutate: saveMutation, loading: isSaving } = useApiMutation<TData, { data: TRequest; isEdit: boolean; id?: number }>({
    mutationFn: async ({ data: requestData, isEdit, id }) => {
      const url = isEdit && id
        ? `${basePath}${endpoint}/${id}`
        : `${basePath}${endpoint}`
      
      const method = isEdit ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? `Failed to ${isEdit ? 'update' : 'create'} item`)
      }

      return response.json()
    },
    onSuccess: () => {
      refetch()
      closeModal()
      onSaveSuccess?.()
    },
    onError: (error) => {
      logger.error('useRefDataCrud', 'Save error', error)
    },
  })

  // Delete mutation
  const { mutate: deleteMutation, loading: isDeleting } = useApiMutation<void, { id: number }>({
    mutationFn: async ({ id }) => {
      const response = await fetch(`${basePath}${endpoint}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? 'Failed to delete item')
      }
    },
    onSuccess: () => {
      refetch()
      closeModal()
      onDeleteSuccess?.()
    },
    onError: (error) => {
      logger.error('useRefDataCrud', 'Delete error', error)
    },
  })

  // Public save function
  const save = useCallback(
    (requestData: TRequest, isEdit: boolean, id?: number) => {
      saveMutation({ data: requestData, isEdit, id })
    },
    [saveMutation]
  )

  // Public remove function
  const remove = useCallback(
    (id: number) => {
      deleteMutation({ id })
    },
    [deleteMutation]
  )

  // Modal management functions
  const openCreateModal = useCallback(() => {
    setModalState({ type: 'create', item: null })
  }, [])

  const openEditModal = useCallback((item: TData) => {
    setModalState({ type: 'edit', item })
  }, [])

  const openDeleteModal = useCallback((item: TData) => {
    setModalState({ type: 'delete', item })
  }, [])

  return {
    data,
    loading,
    error,
    refetch,
    save,
    remove,
    isSaving,
    isDeleting,
    modalState,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
  }
}
