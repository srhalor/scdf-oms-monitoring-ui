/**
 * Document Configuration Types
 *
 * Types for document configuration API requests and responses.
 */

/**
 * Reference data reference (footer, appDocSpec, code)
 */
export interface ReferenceDataRef {
  id: number
  refDataValue: string | null
  description: string | null
}

/**
 * Document Configuration response from API
 */
export interface DocumentConfiguration {
  id: number
  footer: ReferenceDataRef
  appDocSpec: ReferenceDataRef
  code: ReferenceDataRef
  value: string
  desc: string | null
  effectFromDat: string
  effectToDat: string
  createdDat: string | null
  lastUpdateDat: string | null
  createUid: string | null
  lastUpdateUid: string | null
}

/**
 * Document Configuration request for create/update
 */
export interface DocumentConfigurationRequest {
  footerId: number
  appDocSpecId: number
  codeId: number
  value: string
  description: string
  effectFromDat: string
  effectToDat: string
}
