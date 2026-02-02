/**
 * Custom Hooks
 *
 * Reusable React hooks for the SCDF OMS Monitoring UI.
 */

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
