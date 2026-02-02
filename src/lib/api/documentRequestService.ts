/**
 * Document Request API Service
 *
 * Provides search, reprocess, and content retrieval operations for Document Requests.
 * Uses the API client with auth interceptors.
 */

import { logger } from '@/lib/logger'
import { logApiError } from '@/lib/api/apiUtils'
import type { AxiosInstance } from 'axios'
import type {
  DocumentRequest,
  DocumentRequestSearchRequest,
  DocumentRequestSearchResponse,
  DocumentContentResponse,
  DocumentRequestMetadata,
  Batch,
  ReprocessResponse,
} from '@/types/documentRequest'

const API_PATH = '/v1/document-requests'
const SERVICE_NAME = 'DocumentRequestService'

/**
 * Document Request Service class
 *
 * Initialized with an AxiosInstance from withAuth handler
 */
export class DocumentRequestService {
  private readonly client: AxiosInstance

  constructor(client: AxiosInstance) {
    this.client = client
  }

  /**
   * Search document requests with filters
   *
   * @param request - Search request body with filters and sorts
   * @param page - 1-based page number (default: 1)
   * @param size - Page size (default: 10)
   * @returns Paginated document request search response
   *
   * Note: If no sorts provided, backend defaults to id DESC
   */
  async search(
    request: DocumentRequestSearchRequest,
    page: number = 1,
    size: number = 10
  ): Promise<DocumentRequestSearchResponse> {
    try {
      logger.debug(SERVICE_NAME, `Searching document requests - page: ${page}, size: ${size}`)
      const response = await this.client.post<DocumentRequestSearchResponse>(
        `${API_PATH}/search?page=${page}&size=${size}`,
        request
      )
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, 'Failed to search document requests', error)
      throw error
    }
  }

  /**
   * Get document request by ID
   *
   * @param id - Document request ID
   * @returns Document request object
   */
  async getById(id: number): Promise<DocumentRequest> {
    try {
      logger.debug(SERVICE_NAME, `Fetching document request by ID: ${id}`)
      const response = await this.client.get<DocumentRequest>(`${API_PATH}/${id}`)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch document request by ID: ${id}`, error)
      throw error
    }
  }

  /**
   * Get JSON content for document request
   *
   * @param id - Document request ID
   * @returns Document content response with JSON content
   */
  async getJsonContent(id: number): Promise<DocumentContentResponse> {
    try {
      logger.debug(SERVICE_NAME, `Fetching JSON content for document request: ${id}`)
      const response = await this.client.get<DocumentContentResponse>(
        `${API_PATH}/${id}/json-content`
      )
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch JSON content for document request: ${id}`, error)
      throw error
    }
  }

  /**
   * Get XML content for document request
   *
   * @param id - Document request ID
   * @returns Document content response with XML content
   */
  async getXmlContent(id: number): Promise<DocumentContentResponse> {
    try {
      logger.debug(SERVICE_NAME, `Fetching XML content for document request: ${id}`)
      const response = await this.client.get<DocumentContentResponse>(
        `${API_PATH}/${id}/xml-content`
      )
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch XML content for document request: ${id}`, error)
      throw error
    }
  }

  /**
   * Get metadata for document request
   *
   * @param id - Document request ID
   * @returns Array of metadata key-value pairs
   */
  async getMetadata(id: number): Promise<DocumentRequestMetadata[]> {
    try {
      logger.debug(SERVICE_NAME, `Fetching metadata for document request: ${id}`)
      const response = await this.client.get<DocumentRequestMetadata[]>(
        `${API_PATH}/${id}/metadata`
      )
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch metadata for document request: ${id}`, error)
      throw error
    }
  }

  /**
   * Get batches for document request
   *
   * @param id - Document request ID
   * @returns Array of batches
   */
  async getBatches(id: number): Promise<Batch[]> {
    try {
      logger.debug(SERVICE_NAME, `Fetching batches for document request: ${id}`)
      const response = await this.client.get<Batch[]>(`${API_PATH}/${id}/batches`)
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, `Failed to fetch batches for document request: ${id}`, error)
      throw error
    }
  }

  /**
   * Reprocess document requests
   *
   * @param requestIds - Array of request IDs to reprocess
   * @returns Reprocess response with success/failure details
   */
  async reprocess(requestIds: number[]): Promise<ReprocessResponse> {
    try {
      logger.info(
        SERVICE_NAME,
        `Reprocessing ${requestIds.length} document request(s): ${requestIds.join(', ')}`
      )
      const response = await this.client.post<ReprocessResponse>(`${API_PATH}/reprocess`, {
        requestIds,
      })
      return response.data
    } catch (error) {
      logApiError(SERVICE_NAME, 'Failed to reprocess document requests', error)
      throw error
    }
  }
}
