/**
 * Batch API Service
 *
 * Provides operations for Batch-related endpoints.
 * Uses the API client with auth interceptors.
 */

import { logApiError } from '@/lib/api/apiUtils'
import { logger } from '@/lib/logger'
import type { BatchError } from '@/types/documentRequest'
import type { AxiosInstance } from 'axios'

const API_PATH = '/v1/batches'
const SERVICE_NAME = 'BatchService'

/**
 * Batch Service class
 *
 * Initialized with an AxiosInstance from withAuth handler
 *
 * Note: Batch details are obtained from DocumentRequestService.getBatches() response.
 * This service only provides batch-specific operations like fetching errors.
 */
export class BatchService {
  private readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Get errors for a batch
   *
   * @param batchId - Batch ID (uses the `id` field from batch, not `batchId`)
   * @returns Array of batch errors
   *
   * Note: Only returns errors for batches with FAILED_OMS or FAILED_THUNDERHEAD status
   */
  async getErrors(batchId: number): Promise<BatchError[]> {
    try {
      logger.debug(SERVICE_NAME, `Fetching errors for batch: ${batchId}`)
      const response = await this.client.get<BatchError[]>(`${API_PATH}/${batchId}/errors`)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch errors for batch: ${batchId}`, error)
      throw error
    }
  }
}
