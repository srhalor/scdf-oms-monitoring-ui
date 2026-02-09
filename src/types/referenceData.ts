/**
 * Reference Data Types
 *
 * TypeScript interfaces for Reference Data API responses and requests.
 * Based on API design v2 specification.
 */

/**
 * Reference Data response from API
 */
export interface ReferenceData {
  id: number
  refDataType: string
  refDataValue: string
  description: string
  editable: boolean
  effectFromDat: string
  effectToDat: string
  createdDat: string
  lastUpdateDat: string
  createUid: string
  lastUpdateUid: string
}

/**
 * Reference Data create/update request
 */
export interface ReferenceDataRequest {
  refDataType: string
  refDataValue: string
  description: string
  editable: boolean
  effectFromDat: string
  effectToDat: string
}

/**
 * Known Reference Data Type constants
 */
export const REFERENCE_DATA_TYPES = {
  REF_DATA_TYPE: 'REF_DATA_TYPE',
  DOCUMENT_TYPE: 'DOCUMENT_TYPE',
  SOURCE_SYSTEM: 'SOURCE_SYSTEM',
  DOCUMENT_STATUS: 'DOCUMENT_STATUS',
  DOCUMENT_NAME: 'DOCUMENT_NAME',
  FOOTER_ID: 'FOOTER_ID',
  APP_DOC_SPEC: 'APP_DOC_SPEC',
  DOC_CONFIG_CODE: 'DOC_CONFIG_CODE',
  METADATA_KEY: 'METADATA_KEY',
} as const

/**
 * Tab configuration for Reference Data page
 */
export interface ReferenceDataTab {
  id: string
  label: string
  refDataType: string
}

/**
 * Re-export generic UI types for backward compatibility
 * These are now colocated with DataTable component
 */
export type { SortDirection, SortState, TableColumn, PaginationState } from '@/components/ui/DataTable/types'
