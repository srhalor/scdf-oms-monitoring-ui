import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { DocumentRequestService } from '@/lib/api/documentRequestService'

/**
 * POST /api/document-requests/reprocess
 *
 * Reprocess selected document requests.
 * Proxies to backend: POST /v1/document-requests/reprocess
 *
 * Request body:
 * - requestIds: number[] - Array of request IDs to reprocess
 */
export const POST = withAuth(async (request: NextRequest, client) => {
  const body = await request.json()
  const { requestIds } = body

  if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
    return NextResponse.json({ error: 'requestIds array is required' }, { status: 400 })
  }

  const service = new DocumentRequestService(client)
  const data = await service.reprocess(requestIds)

  return NextResponse.json(data)
})
