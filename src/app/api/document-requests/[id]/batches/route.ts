import { NextRequest, NextResponse } from 'next/server'
import { DocumentRequestService } from '@/lib/api/documentRequestService'
import { withAuth } from '@/lib/api/withAuth'

/**
 * GET /api/document-requests/[id]/batches
 *
 * Get batches for a document request.
 * Proxies to backend: GET /v1/document-requests/{id}/batches
 */
export const GET = withAuth(async (request: NextRequest, client) => {
  // Extract ID from URL (second to last segment since URL ends with /batches)
  const segments = new URL(request.url).pathname.split('/')
  const id = Number(segments.at(-2))

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid document request ID' }, { status: 400 })
  }

  const service = new DocumentRequestService(client)
  const data = await service.getBatches(id)

  return NextResponse.json(data)
})
