/**
 * Custom Hooks
 *
 * Reusable React hooks for the SCDF OMS Monitoring UI.
 */

// API Hooks - MANDATORY for all API calls
export { useApiQuery, type UseApiQueryOptions, type UseApiQueryReturn } from './useApiQuery'
export {
  useApiMutation,
  type UseApiMutationOptions,
  type UseApiMutationReturn,
} from './useApiMutation'

// Document Request Hooks
export {
  useDocumentRequestFilters,
  type UseDocumentRequestFiltersReturn,
  type FilterValidation,
} from './useDocumentRequestFilters'

export {
  useMultiColumnSort,
  type UseMultiColumnSortReturn,
} from './useMultiColumnSort'

export {
  useRowSelection,
  type UseRowSelectionReturn,
} from './useRowSelection'

export {
  useDocumentRequestSearch,
  type UseDocumentRequestSearchReturn,
  type SearchState,
} from './useDocumentRequestSearch'

export {
  useSearchStatePreservation,
  getDefaultSearchState,
  type UseSearchStatePreservationReturn,
  type UseSearchStatePreservationOptions,
  type PersistedSearchState,
} from './useSearchStatePreservation'

export {
  useClientSidePagination,
  type UseClientSidePaginationReturn,
  type UseClientSidePaginationOptions,
} from './useClientSidePagination'

export {
  useReferenceDataLookups,
  type UseReferenceDataLookupsReturn,
  type ReferenceDataLookup,
} from './useReferenceDataLookups'

export {
  useRefDataCrud,
  type UseRefDataCrudOptions,
  type UseRefDataCrudReturn,
} from './useRefDataCrud'

// Utility Hooks
export {
  useDisclosure,
  type UseDisclosureOptions,
  type UseDisclosureReturn,
} from './useDisclosure'

export {
  useClipboard,
  type UseClipboardOptions,
  type UseClipboardReturn,
} from './useClipboard'

export {
  useLocalStorage,
  type UseLocalStorageOptions,
  type UseLocalStorageReturn,
} from './useLocalStorage'
