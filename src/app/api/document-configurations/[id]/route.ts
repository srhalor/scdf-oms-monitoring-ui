import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, getCurrentUser } from '@/lib/auth/authHelpers'
import { createAuthenticatedClient } from '@/lib/api/apiClient'
import { DocumentConfigurationService } from '@/lib/api/documentConfigurationService'
import { logger } from '@/lib/logger'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * Helper to create authenticated service for route handlers
 */
async function createService() {
  const accessToken = await getAccessToken()

  if (!accessToken) {
    return { error: 'Unauthorized - No valid session' }
  }

  const user = await getCurrentUser()
  const client = createAuthenticatedClient(accessToken, user)

  return { service: new DocumentConfigurationService(client) }
}

/**
 * GET /api/document-configurations/[id]
 *
 * Fetches a single document configuration by ID
 */
export async function GET(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const result = await createService()

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const { id } = await context.params
    const data = await result.service.getById(Number(id))

    return NextResponse.json(data)
  } catch (error) {
    logger.error('API', 'GET /document-configurations/[id] error', error)
    const message =
      error instanceof Error ? error.message : 'Failed to fetch document configuration'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * PUT /api/document-configurations/[id]
 *
 * Updates an existing document configuration
 */
export async function PUT(
  request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const result = await createService()

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    const data = await result.service.update(Number(id), body)

    return NextResponse.json(data)
  } catch (error) {
    logger.error('API', 'PUT /document-configurations/[id] error', error)
    const message =
      error instanceof Error ? error.message : 'Failed to update document configuration'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /api/document-configurations/[id]
 *
 * Deletes a document configuration
 */
export async function DELETE(
  _request: NextRequest,
  context: RouteContext
): Promise<NextResponse> {
  try {
    const result = await createService()

    if ('error' in result) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    const { id } = await context.params
    await result.service.delete(Number(id))

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('API', 'DELETE /document-configurations/[id] error', error)
    const message =
      error instanceof Error ? error.message : 'Failed to delete document configuration'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
