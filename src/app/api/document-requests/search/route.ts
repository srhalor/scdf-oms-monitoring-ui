import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { DocumentRequestService } from '@/lib/api/documentRequestService'
import { logger } from '@/lib/logger'

/**
 * POST /api/document-requests/search
 *
 * Search document requests with filters, sorting, and pagination.
 * Proxies to backend: POST /v1/document-requests/search
 *
 * Query params:
 * - page: 1-based page number (default: 1)
 * - size: Page size (default: 10)
 */
export const POST = withAuth(async (request: NextRequest, client) => {
  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page')) || 1
  const size = Number(searchParams.get('size')) || 10

  const body = await request.json()
  logger.info('Searching document requests', body)
  const service = new DocumentRequestService(client)
  const data = await service.search(body, page, size)

  return NextResponse.json(data)
})
