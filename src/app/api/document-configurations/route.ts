import { NextRequest, NextResponse } from 'next/server'
import { DocumentConfigurationService } from '@/lib/api/documentConfigurationService'
import { withAuth } from '@/lib/api/withAuth'

/**
 * GET /api/document-configurations
 *
 * Fetches all document configurations
 */
export const GET = withAuth(async (_request: NextRequest, client) => {
  const service = new DocumentConfigurationService(client)
  const data = await service.getAll()
  return NextResponse.json(data)
})

/**
 * POST /api/document-configurations
 *
 * Creates a new document configuration
 */
export const POST = withAuth(async (request: NextRequest, client) => {
  const body = await request.json()
  const service = new DocumentConfigurationService(client)
  const data = await service.create(body)
  return NextResponse.json(data, { status: 201 })
})
