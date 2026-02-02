import { DocumentRequest, Batch } from '@/types/documentRequest'

const REQUEST_CACHE_KEY = 'document-request-detail-cache'
const BATCH_CACHE_KEY = 'batch-detail-cache'
const CACHE_MAX_AGE = 5 * 60 * 1000 // 5 minutes

interface CachedDocumentRequest {
  data: DocumentRequest
  timestamp: number
}

interface CachedBatch {
  data: Batch
  timestamp: number
}

/**
 * Cache a document request for viewing details
 * Used to avoid duplicate API calls when navigating from list to details
 *
 * @param request - The document request to cache
 */
export function cacheDocumentRequest(request: DocumentRequest): void {
  try {
    const cached: CachedDocumentRequest = {
      data: request,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(REQUEST_CACHE_KEY, JSON.stringify(cached))
  } catch {
    // Silently fail - storage might be full or disabled
  }
}

/**
 * Get a cached document request by ID
 * Returns null if not found, ID doesn't match, or cache is stale
 *
 * @param requestId - The request ID to retrieve
 * @returns The cached document request or null
 */
export function getCachedDocumentRequest(requestId: number): DocumentRequest | null {
  try {
    const stored = sessionStorage.getItem(REQUEST_CACHE_KEY)
    if (!stored) return null

    const cached: CachedDocumentRequest = JSON.parse(stored)

    // Check if cache is stale
    const age = Date.now() - cached.timestamp
    if (age > CACHE_MAX_AGE) {
      clearDocumentRequestCache()
      return null
    }

    // Check if ID matches
    if (cached.data.id !== requestId) {
      return null
    }

    return cached.data
  } catch {
    clearDocumentRequestCache()
    return null
  }
}

/**
 * Clear the document request cache
 */
export function clearDocumentRequestCache(): void {
  try {
    sessionStorage.removeItem(REQUEST_CACHE_KEY)
  } catch {
    // Ignore errors
  }
}

/**
 * Cache a batch for viewing details
 * Used to avoid duplicate API calls when navigating from batches list to batch details
 *
 * @param batch - The batch to cache
 */
export function cacheBatch(batch: Batch): void {
  try {
    const cached: CachedBatch = {
      data: batch,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(BATCH_CACHE_KEY, JSON.stringify(cached))
  } catch {
    // Silently fail - storage might be full or disabled
  }
}

/**
 * Get a cached batch by ID
 * Returns null if not found, ID doesn't match, or cache is stale
 *
 * @param batchId - The batch ID (the `id` field) to retrieve
 * @returns The cached batch or null
 */
export function getCachedBatch(batchId: number): Batch | null {
  try {
    const stored = sessionStorage.getItem(BATCH_CACHE_KEY)
    if (!stored) return null

    const cached: CachedBatch = JSON.parse(stored)

    // Check if cache is stale
    const age = Date.now() - cached.timestamp
    if (age > CACHE_MAX_AGE) {
      clearBatchCache()
      return null
    }

    // Check if ID matches
    if (cached.data.id !== batchId) {
      return null
    }

    return cached.data
  } catch {
    clearBatchCache()
    return null
  }
}

/**
 * Clear the batch cache
 */
export function clearBatchCache(): void {
  try {
    sessionStorage.removeItem(BATCH_CACHE_KEY)
  } catch {
    // Ignore errors
  }
}
