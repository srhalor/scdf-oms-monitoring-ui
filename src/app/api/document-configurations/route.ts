import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { DocumentConfigurationService } from '@/lib/api/documentConfigurationService'

/**
 * GET /api/document-configurations
 *
 * Fetches all document configurations
 */
export const GET = withAuth(async (_request: NextRequest, client) => {
  try {
    const service = new DocumentConfigurationService(client)
    const data = await service.getAll()

    return NextResponse.json(data)
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch document configurations'

    return NextResponse.json({ error: message }, { status: 500 })
  }
})

/**
 * POST /api/document-configurations
 *
 * Creates a new document configuration
 */
export const POST = withAuth(async (request: NextRequest, client) => {
  try {
    const body = await request.json()
    const service = new DocumentConfigurationService(client)
    const data = await service.create(body)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to create document configuration'

    return NextResponse.json({ error: message }, { status: 500 })
  }
})
