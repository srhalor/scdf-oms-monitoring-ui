/**
 * Reference Data API Service
 *
 * Provides CRUD operations for Reference Data.
 * Uses the API client with auth interceptors.
 */

import axios from 'axios'
import { createAuthenticatedClient } from '@/lib/api/apiClient'
import { logger } from '@/lib/logger'
import type { AxiosInstance } from 'axios'
import type { User } from '@/types/auth'
import type { ReferenceData, ReferenceDataRequest } from '@/types/referenceData'

const API_PATH = '/v1/reference-data'

/**
 * Reference Data Service class
 *
 * Can be initialized with either:
 * 1. An AxiosInstance (from withAuth handler)
 * 2. Access token and user (for creating fresh client)
 */
export class ReferenceDataService {
  private readonly axiosClient: AxiosInstance

  /**
   * Create service with existing Axios client
   */
  constructor(client: AxiosInstance)
  /**
   * Create service with access token and user
   */
  constructor(accessToken: string, user: User | null)
  constructor(clientOrToken: AxiosInstance | string, user?: User | null) {
    if (typeof clientOrToken === 'string') {
      this.axiosClient = createAuthenticatedClient(clientOrToken, user ?? null)
    } else {
      this.axiosClient = clientOrToken
    }
  }

  private get client() {
    return this.axiosClient
  }

  /**
   * Get all reference data by type
   * @param type - Reference data type
   * @returns Array of reference data
   */
  async getByType(type: string): Promise<ReferenceData[]> {
    try {
      logger.debug('ReferenceDataService', `Fetching reference data for type: ${type}`)
      const response = await this.client.get<ReferenceData[]>(`${API_PATH}/type/${type}`)
      return response.data
    } catch (error) {
      // Log detailed error information from backend
      if (axios.isAxiosError(error) && error.response) {
        logger.error(
          'ReferenceDataService',
          `Backend error for type: ${type}`,
          {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          }
        )
      } else {
        logger.error('ReferenceDataService', `Failed to fetch reference data for type: ${type}`, error)
      }
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
      logger.debug('ReferenceDataService', `Fetching reference data by ID: ${id}`)
      const response = await this.client.get<ReferenceData>(`${API_PATH}/${id}`)
      return response.data
    } catch (error) {
      logger.error('ReferenceDataService', `Failed to fetch reference data by ID: ${id}`, error)
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
      logger.info('ReferenceDataService', `Creating reference data: ${data.refDataType}`)
      const response = await this.client.post<ReferenceData>(API_PATH, data)
      return response.data
    } catch (error) {
      logger.error('ReferenceDataService', 'Failed to create reference data', error)
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
      logger.info('ReferenceDataService', `Updating reference data ID: ${id}`)
      const response = await this.client.put<ReferenceData>(`${API_PATH}/${id}`, data)
      return response.data
    } catch (error) {
      logger.error('ReferenceDataService', `Failed to update reference data ID: ${id}`, error)
      throw error
    }
  }

  /**
   * Delete reference data (logical delete)
   * @param id - Reference data ID
   */
  async delete(id: number): Promise<void> {
    try {
      logger.info('ReferenceDataService', `Deleting reference data ID: ${id}`)
      await this.client.delete(`${API_PATH}/${id}`)
    } catch (error) {
      logger.error('ReferenceDataService', `Failed to delete reference data ID: ${id}`, error)
      throw error
    }
  }
}

/**
 * Create a Reference Data Service instance
 * @param accessToken - JWT token from session
 * @param user - User object from session
 * @returns ReferenceDataService instance
 */
export const createReferenceDataService = (
  accessToken: string,
  user: User | null
): ReferenceDataService => {
  return new ReferenceDataService(accessToken, user)
}
