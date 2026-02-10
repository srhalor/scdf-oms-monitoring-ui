import { NextRequest, NextResponse } from 'next/server'
import { extractIdFromUrl } from '@/lib/api/apiUtils'
import { DocumentRequestService } from '@/lib/api/documentRequestService'
import { withAuth } from '@/lib/api/withAuth'

/**
 * GET /api/document-requests/[id]
 *
 * Get a single document request by ID.
 * Uses the search API with requestIds filter since there's no dedicated
 * GET /v1/document-requests/{id} endpoint in the backend.
 */
export const GET = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid document request ID' }, { status: 400 })
  }

  const service = new DocumentRequestService(client)

  // Use search API with requestIds filter to get the specific document request
  const searchResult = await service.search(
    {
      requestIds: [id],
      sorts: [{ property: 'id', direction: 'DESC' }],
    },
    1,
    1
  )

  if (!searchResult.content || searchResult.content.length === 0) {
    return NextResponse.json({ error: 'Document request not found' }, { status: 404 })
  }

  // Return the first (and only) result
  return NextResponse.json(searchResult.content[0])
})
