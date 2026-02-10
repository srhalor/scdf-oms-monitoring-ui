import { NextRequest, NextResponse } from 'next/server'
import { extractIdFromUrl } from '@/lib/api/apiUtils'
import { ReferenceDataService } from '@/lib/api/referenceDataService'
import { withAuth } from '@/lib/api/withAuth'

/**
 * GET /api/reference-data/types/[id]
 *
 * Fetches a single reference data item by ID
 */
export const GET = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)
  const service = new ReferenceDataService(client)
  const data = await service.getById(id)
  return NextResponse.json(data)
})

/**
 * PUT /api/reference-data/types/[id]
 *
 * Updates an existing reference data item
 */
export const PUT = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)
  const body = await request.json()
  const service = new ReferenceDataService(client)
  const data = await service.update(id, body)
  return NextResponse.json(data)
})

/**
 * DELETE /api/reference-data/types/[id]
 *
 * Deletes a reference data item
 */
export const DELETE = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)
  const service = new ReferenceDataService(client)
  await service.delete(id)
  return NextResponse.json({ success: true })
})
