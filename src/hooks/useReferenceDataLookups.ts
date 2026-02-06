'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { ReferenceData } from '@/types/referenceData'

/**
 * Reference data lookup state
 */
export interface ReferenceDataLookup {
  isLoading: boolean
  error: string | null
  data: ReferenceData[]
}

/**
 * Hook return type
 */
export interface UseReferenceDataLookupsReturn {
  sourceSystems: ReferenceDataLookup
  documentTypes: ReferenceDataLookup
  documentNames: ReferenceDataLookup
  documentStatuses: ReferenceDataLookup
  metadataKeys: ReferenceDataLookup
  refresh: () => Promise<void>
  isLoading: boolean
}

/**
 * Reference data type ID mapping
 */
const REFERENCE_DATA_TYPES = {
  SOURCE_SYSTEM: 'SOURCE_SYSTEM',
  DOCUMENT_TYPE: 'DOCUMENT_TYPE',
  DOCUMENT_NAME: 'DOCUMENT_NAME',
  DOCUMENT_STATUS: 'DOCUMENT_STATUS',
  METADATA_KEY: 'METADATA_KEY',
} as const

const INITIAL_LOOKUP: ReferenceDataLookup = {
  isLoading: false,
  error: null,
  data: [],
}

/**
 * useReferenceDataLookups hook
 *
 * Fetches and caches reference data for document request filters.
 * Loads all required reference data types on mount.
 *
 * @returns Reference data lookups and loading state
 *
 * @example
 * const { sourceSystems, documentTypes, isLoading } = useReferenceDataLookups()
 *
 * // Use in MultiSelect
 * <MultiSelect
 *   options={sourceSystems.data.map(s => ({ value: s.id, label: s.refDataValue }))}
 *   ...
 * />
 */
export function useReferenceDataLookups(): UseReferenceDataLookupsReturn {
  const [sourceSystems, setSourceSystems] = useState<ReferenceDataLookup>(INITIAL_LOOKUP)
  const [documentTypes, setDocumentTypes] = useState<ReferenceDataLookup>(INITIAL_LOOKUP)
  const [documentNames, setDocumentNames] = useState<ReferenceDataLookup>(INITIAL_LOOKUP)
  const [documentStatuses, setDocumentStatuses] = useState<ReferenceDataLookup>(INITIAL_LOOKUP)
  const [metadataKeys, setMetadataKeys] = useState<ReferenceDataLookup>(INITIAL_LOOKUP)

  const isMounted = useRef(true)

  /**
   * Fetch reference data for a specific type
   */
  const fetchReferenceData = useCallback(async (
    typeCode: string,
    setData: React.Dispatch<React.SetStateAction<ReferenceDataLookup>>
  ): Promise<void> => {
    setData(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const queryFn = async () => {
        const response = await fetch(`/api/reference-data/types?refDataType=${typeCode}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch ${typeCode}: ${response.status}`)
        }

        return response.json()
      }

      const data: ReferenceData[] = await queryFn()

      if (isMounted.current) {
        setData({
          isLoading: false,
          error: null,
          data,
        })
      }
    } catch (error) {
      if (isMounted.current) {
        setData({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load',
          data: [],
        })
      }
    }
  }, [])

  /**
   * Load all reference data
   */
  const loadAll = useCallback(async (): Promise<void> => {
    await Promise.all([
      fetchReferenceData(REFERENCE_DATA_TYPES.SOURCE_SYSTEM, setSourceSystems),
      fetchReferenceData(REFERENCE_DATA_TYPES.DOCUMENT_TYPE, setDocumentTypes),
      fetchReferenceData(REFERENCE_DATA_TYPES.DOCUMENT_NAME, setDocumentNames),
      fetchReferenceData(REFERENCE_DATA_TYPES.DOCUMENT_STATUS, setDocumentStatuses),
      fetchReferenceData(REFERENCE_DATA_TYPES.METADATA_KEY, setMetadataKeys),
    ])
  }, [fetchReferenceData])

  /**
   * Refresh all reference data
   */
  const refresh = useCallback(async (): Promise<void> => {
    await loadAll()
  }, [loadAll])

  // Load on mount
  useEffect(() => {
    isMounted.current = true
    loadAll()

    return () => {
      isMounted.current = false
    }
  }, [loadAll])

  // Overall loading state
  const isLoading =
    sourceSystems.isLoading ||
    documentTypes.isLoading ||
    documentNames.isLoading ||
    documentStatuses.isLoading ||
    metadataKeys.isLoading

  return {
    sourceSystems,
    documentTypes,
    documentNames,
    documentStatuses,
    metadataKeys,
    refresh,
    isLoading,
  }
}
