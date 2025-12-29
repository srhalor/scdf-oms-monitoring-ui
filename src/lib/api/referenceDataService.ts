/**
 * Reference Data API Service
 *
 * Provides CRUD operations for Reference Data.
 * Uses the API client with auth interceptors.
 */

import { logger } from '@/lib/logger'
import { logApiError } from '@/lib/api/apiUtils'
import type { AxiosInstance } from 'axios'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'

const API_PATH = '/v1/reference-data'
const SERVICE_NAME = 'ReferenceDataService'

/**
 * Reference Data Service class
 *
 * Initialized with an AxiosInstance from withAuth handler
 */
export class ReferenceDataService {
  private readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Get all reference data by type
   * @param type - Reference data type
   * @returns Array of reference data
   */
  async getByType(type: string): Promise<ReferenceData[]> {
    try {
      logger.debug(SERVICE_NAME, `Fetching reference data for type: ${type}`)
      const response = await this.client.get<ReferenceData[]>(`${API_PATH}/type/${type}`)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch reference data for type: ${type}`, error)
      throw error
    }
  }

  /**
   * Get reference data by ID
   * @param id - Reference data ID
   * @returns Reference data object
   */
  async getById(id: number): Promise<ReferenceData> {
    try {
      logger.debug(SERVICE_NAME, `Fetching reference data by ID: ${id}`)
      const response = await this.client.get<ReferenceData>(`${API_PATH}/${id}`)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch reference data by ID: ${id}`, error)
      throw error
    }
  }

  /**
   * Create new reference data
   * @param data - Reference data request
   * @returns Created reference data
   */
  async create(data: ReferenceDataRequest): Promise<ReferenceData> {
    try {
      logger.info(SERVICE_NAME, `Creating reference data: ${data.refDataType}`)
      const response = await this.client.post<ReferenceData>(API_PATH, data)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, 'Failed to create reference data', error)
      throw error
    }
  }

  /**
   * Update existing reference data
   * @param id - Reference data ID
   * @param data - Reference data request
   * @returns Updated reference data
   */
  async update(id: number, data: Partial<ReferenceDataRequest>): Promise<ReferenceData> {
    try {
      logger.info(SERVICE_NAME, `Updating reference data ID: ${id}`)
      const response = await this.client.put<ReferenceData>(`${API_PATH}/${id}`, data)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to update reference data ID: ${id}`, error)
      throw error
    }
  }

  /**
   * Delete reference data (logical delete)
   * @param id - Reference data ID
   */
  async delete(id: number): Promise<void> {
    try {
      logger.info(SERVICE_NAME, `Deleting reference data ID: ${id}`)
      await this.client.delete(`${API_PATH}/${id}`)
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to delete reference data ID: ${id}`, error)
      throw error
    }
  }
}
