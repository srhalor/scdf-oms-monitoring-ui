/**
 * Document Configuration API Service
 *
 * Provides CRUD operations for Document Configurations.
 * Uses the API client with auth interceptors.
 */

import { logApiError } from '@/lib/api/apiUtils'
import { logger } from '@/lib/logger'
import type {
  DocumentConfiguration,
  DocumentConfigurationRequest,
} from '@/types/documentConfiguration'
import type { AxiosInstance } from 'axios'

const API_PATH = '/v1/document-configurations'
const SERVICE_NAME = 'DocumentConfigurationService'

/**
 * Document Configuration Service class
 *
 * Initialized with an AxiosInstance from withAuth handler
 */
export class DocumentConfigurationService {
  private readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Get all document configurations
   * @returns Array of document configurations
   */
  async getAll(): Promise<DocumentConfiguration[]> {
    try {
      logger.debug(SERVICE_NAME, 'Fetching all document configurations')
      const response = await this.client.get<DocumentConfiguration[]>(API_PATH)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, 'Failed to fetch document configurations', error)
      throw error
    }
  }

  /**
   * Get document configuration by ID
   * @param id - Document configuration ID
   * @returns Document configuration object
   */
  async getById(id: number): Promise<DocumentConfiguration> {
    try {
      logger.debug(SERVICE_NAME, `Fetching document configuration ID: ${id}`)
      const response = await this.client.get<DocumentConfiguration>(`${API_PATH}/${id}`)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch document configuration ID: ${id}`, error)
      throw error
    }
  }

  /**
   * Create new document configuration
   * @param data - Document configuration request
   * @returns Created document configuration
   */
  async create(data: DocumentConfigurationRequest): Promise<DocumentConfiguration> {
    try {
      logger.info(SERVICE_NAME, `Creating document configuration: ${data.value}`)
      const response = await this.client.post<DocumentConfiguration>(API_PATH, data)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, 'Failed to create document configuration', error)
      throw error
    }
  }

  /**
   * Update existing document configuration
   * @param id - Document configuration ID
   * @param data - Document configuration request
   * @returns Updated document configuration
   */
  async update(
    id: number,
    data: Partial<DocumentConfigurationRequest>
  ): Promise<DocumentConfiguration> {
    try {
      logger.info(SERVICE_NAME, `Updating document configuration ID: ${id}`)
      const response = await this.client.put<DocumentConfiguration>(`${API_PATH}/${id}`, data)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to update document configuration ID: ${id}`, error)
      throw error
    }
  }

  /**
   * Delete document configuration
   * @param id - Document configuration ID
   */
  async delete(id: number): Promise<void> {
    try {
      logger.info(SERVICE_NAME, `Deleting document configuration ID: ${id}`)
      await this.client.delete(`${API_PATH}/${id}`)
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to delete document configuration ID: ${id}`, error)
      throw error
    }
  }
}
