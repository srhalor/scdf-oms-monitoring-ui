import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { BatchService } from '@/lib/api/batchService'

/**
 * GET /api/batches/[id]/errors
 *
 * Get errors for a batch.
 * Proxies to backend: GET /v1/batches/{id}/errors
 *
 * Note: Uses batch `id` field (from batches response), not `batchId`
 */
export const GET = withAuth(async (request: NextRequest, client) => {
  // Extract ID from URL (second to last segment since URL ends with /errors)
  const segments = new URL(request.url).pathname.split('/')
  const id = Number(segments.at(-2))

  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'Invalid batch ID' }, { status: 400 })
  }

  const service = new BatchService(client)
  const data = await service.getErrors(id)

  return NextResponse.json(data)
})
