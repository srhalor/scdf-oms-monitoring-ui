/**
 * Document Configuration API Service
 *
 * Provides CRUD operations for Document Configurations.
 * Uses the API client with auth interceptors.
 */

import axios from 'axios'
import { createAuthenticatedClient } from '@/lib/api/apiClient'
import { logger } from '@/lib/logger'
import type { AxiosInstance } from 'axios'
import type { User } from '@/types/auth'
import type {
  DocumentConfiguration,
  DocumentConfigurationRequest,
} from '@/types/documentConfiguration'

const API_PATH = '/v1/document-configurations'

/**
 * Document Configuration Service class
 *
 * Can be initialized with either:
 * 1. An AxiosInstance (from withAuth handler)
 * 2. Access token and user (for creating fresh client)
 */
export class DocumentConfigurationService {
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
   * Get all document configurations
   * @returns Array of document configurations
   */
  async getAll(): Promise<DocumentConfiguration[]> {
    try {
      logger.debug('DocumentConfigurationService', 'Fetching all document configurations')
      const response = await this.client.get<DocumentConfiguration[]>(API_PATH)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        logger.error(
          'DocumentConfigurationService',
          'Backend error fetching document configurations',
          {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          }
        )
      } else {
        logger.error(
          'DocumentConfigurationService',
          'Failed to fetch document configurations',
          error
        )
      }
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
      logger.debug('DocumentConfigurationService', `Fetching document configuration ID: ${id}`)
      const response = await this.client.get<DocumentConfiguration>(`${API_PATH}/${id}`)
      return response.data
    } catch (error) {
      logger.error(
        'DocumentConfigurationService',
        `Failed to fetch document configuration ID: ${id}`,
        error
      )
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
      logger.info('DocumentConfigurationService', 'Creating document configuration', {
        value: data.value,
      })
      const response = await this.client.post<DocumentConfiguration>(API_PATH, data)
      return response.data
    } catch (error) {
      logger.error('DocumentConfigurationService', 'Failed to create document configuration', error)
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
      logger.info('DocumentConfigurationService', `Updating document configuration ID: ${id}`)
      const response = await this.client.put<DocumentConfiguration>(`${API_PATH}/${id}`, data)
      return response.data
    } catch (error) {
      logger.error(
        'DocumentConfigurationService',
        `Failed to update document configuration ID: ${id}`,
        error
      )
      throw error
    }
  }

  /**
   * Delete document configuration
   * @param id - Document configuration ID
   */
  async delete(id: number): Promise<void> {
    try {
      logger.info('DocumentConfigurationService', `Deleting document configuration ID: ${id}`)
      await this.client.delete(`${API_PATH}/${id}`)
    } catch (error) {
      logger.error(
        'DocumentConfigurationService',
        `Failed to delete document configuration ID: ${id}`,
        error
      )
      throw error
    }
  }
}

/**
 * Create a Document Configuration Service instance
 * @param accessToken - JWT token from session
 * @param user - User object from session
 * @returns DocumentConfigurationService instance
 */
export const createDocumentConfigurationService = (
  accessToken: string,
  user: User | null
): DocumentConfigurationService => {
  return new DocumentConfigurationService(accessToken, user)
}
