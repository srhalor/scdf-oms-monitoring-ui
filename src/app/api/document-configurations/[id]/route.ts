import { NextRequest, NextResponse } from 'next/server'
import { extractIdFromUrl } from '@/lib/api/apiUtils'
import { DocumentConfigurationService } from '@/lib/api/documentConfigurationService'
import { withAuth } from '@/lib/api/withAuth'

/**
 * GET /api/document-configurations/[id]
 *
 * Fetches a single document configuration by ID
 */
export const GET = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)
  const service = new DocumentConfigurationService(client)
  const data = await service.getById(id)
  return NextResponse.json(data)
})

/**
 * PUT /api/document-configurations/[id]
 *
 * Updates an existing document configuration
 */
export const PUT = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)
  const body = await request.json()
  const service = new DocumentConfigurationService(client)
  const data = await service.update(id, body)
  return NextResponse.json(data)
})

/**
 * DELETE /api/document-configurations/[id]
 *
 * Deletes a document configuration
 */
export const DELETE = withAuth(async (request: NextRequest, client) => {
  const id = extractIdFromUrl(request.url)
  const service = new DocumentConfigurationService(client)
  await service.delete(id)
  return NextResponse.json({ success: true })
})
