/**
 * Document Request Types
 *
 * TypeScript interfaces for Document Request API responses and requests.
 * Based on API design v2 specification.
 */

// =============================================================================
// Reference Data Embedded Types
// =============================================================================

/**
 * Reference data embedded in document request response
 */
export interface ReferenceDataRef {
  id: number
  refDataValue: string
  description: string
}

// =============================================================================
// Document Request Types
// =============================================================================

/**
 * Document Request from search API
 */
export interface DocumentRequest {
  id: number
  sourceSystem: ReferenceDataRef
  documentType: ReferenceDataRef
  documentName: ReferenceDataRef
  documentStatus: ReferenceDataRef
  createdDat: string
  lastUpdateDat: string
  createUidHeader: string
  createUidToken: string
}

/**
 * Document Request Status (fixed codes)
 */
export type DocumentRequestStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'STOPPED'

/**
 * Document Request status color mapping
 */
export const DOCUMENT_REQUEST_STATUS_COLORS: Record<DocumentRequestStatus, string> = {
  QUEUED: 'var(--color-olive-200)',
  PROCESSING: 'var(--color-informative-400)',
  COMPLETED: 'var(--color-positive-400)',
  FAILED: 'var(--color-error-400)',
  STOPPED: 'var(--color-warning-400)',
}

// =============================================================================
// Search & Filter Types
// =============================================================================

/**
 * Metadata chip for filtering
 */
export interface MetadataChip {
  keyId: number
  value: string // Can be number, string, or combination - stored as string
}

/**
 * Sort item for multi-column sorting
 */
export interface SortItem {
  property: string
  direction: 'ASC' | 'DESC'
}

/**
 * Document Request search filters (UI state)
 */
export interface DocumentRequestFilters {
  requestIds: number[]
  batchIds: number[]
  sourceSystems: number[]
  documentTypes: number[]
  documentNames: number[]
  documentStatuses: number[]
  fromDate: string | null
  toDate: string | null
  metadataChips: MetadataChip[]
}

/**
 * Document Request search request body (API payload)
 */
export interface DocumentRequestSearchRequest {
  requestIds?: number[]
  batchIds?: number[]
  sourceSystems?: number[]
  documentTypes?: number[]
  documentNames?: number[]
  documentStatuses?: number[]
  fromDate?: string
  toDate?: string
  metadataChips?: MetadataChip[]
  sorts?: SortItem[]
}

/**
 * Pagination links from API response
 */
export interface PaginationLinks {
  self: string
  first: string
  previous: string | null
  next: string | null
  last: string
}

/**
 * Document Request search response
 */
export interface DocumentRequestSearchResponse {
  content: DocumentRequest[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
  sorts: SortItem[]
  links: PaginationLinks
}

// =============================================================================
// Reprocess Types
// =============================================================================

/**
 * Reprocess request
 */
export interface ReprocessRequest {
  requestIds: number[]
}

/**
 * Reprocess response
 */
export interface ReprocessResponse {
  message: string
  submittedRequestIds: number[]
  notFoundRequestIds: number[]
  totalSubmitted: number
  totalNotFound: number
}

// =============================================================================
// Document Content Types
// =============================================================================

/**
 * Document content response (JSON/XML)
 */
export interface DocumentContentResponse {
  requestId: number
  contentType: 'JSON' | 'XML'
  content: string
}

// =============================================================================
// Metadata Types
// =============================================================================

/**
 * Document Request Metadata
 */
export interface DocumentRequestMetadata {
  id: number
  requestId: number
  metadataKey: ReferenceDataRef
  metadataValue: string
}

// =============================================================================
// Batch Types
// =============================================================================

/**
 * Batch from document request
 */
export interface Batch {
  id: number
  requestId: number
  batchId: number
  batchStatus: ReferenceDataRef
  batchName: string
  dmsDocumentId: number | null
  syncStatus: boolean
  eventStatus: boolean
  retryCount: number
  createdDat: string
  lastUpdateDat: string
  createUidHeader: string
  createUidToken: string
}

/**
 * Batch Status (fixed codes)
 */
export type BatchStatusType =
  | 'PROCESSING_OMS'
  | 'PROCESSING_THUNDERHEAD'
  | 'STOPPED_THUNDERHEAD'
  | 'FAILED_OMS'
  | 'FAILED_THUNDERHEAD'
  | 'COMPLETED'

/**
 * Batch status color mapping
 */
export const BATCH_STATUS_COLORS: Record<BatchStatusType, string> = {
  PROCESSING_OMS: 'var(--color-informative-400)',
  PROCESSING_THUNDERHEAD: 'var(--color-informative-400)',
  STOPPED_THUNDERHEAD: 'var(--color-warning-400)',
  FAILED_OMS: 'var(--color-error-400)',
  FAILED_THUNDERHEAD: 'var(--color-error-400)',
  COMPLETED: 'var(--color-positive-400)',
}

/**
 * Failed batch statuses that show error details
 */
export const FAILED_BATCH_STATUSES: BatchStatusType[] = ['FAILED_OMS', 'FAILED_THUNDERHEAD']

// =============================================================================
// Batch Error Types
// =============================================================================

/**
 * Batch Error
 */
export interface BatchError {
  id: number
  batchId: number
  category: string
  description: string
}

// =============================================================================
// Defaults & Constants
// =============================================================================

/**
 * Default sort for document request search
 */
export const DEFAULT_SORT: SortItem[] = [{ property: 'id', direction: 'DESC' }]

/**
 * Pagination defaults (1-based page numbers)
 */
export const PAGINATION_DEFAULTS = {
  page: 1,
  size: 10,
} as const

/**
 * Filter validation limits
 */
export const FILTER_LIMITS = {
  maxRequestIds: 100,
  maxBatchIds: 100,
  maxMetadataChips: 10,
} as const

/**
 * Empty filters state (for reset)
 */
export const EMPTY_FILTERS: DocumentRequestFilters = {
  requestIds: [],
  batchIds: [],
  sourceSystems: [],
  documentTypes: [],
  documentNames: [],
  documentStatuses: [],
  fromDate: null,
  toDate: null,
  metadataChips: [],
}
