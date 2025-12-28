import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken, getCurrentUser } from '@/lib/auth/authHelpers'
import { createAuthenticatedClient } from '@/lib/api/apiClient'
import { ReferenceDataService } from '@/lib/api/referenceDataService'
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

  return { service: new ReferenceDataService(client) }
}

/**
 * GET /reference-data/types/[id]
 *
 * Fetches a single reference data item by ID
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
    logger.error('API', 'GET /reference-datav1/types/[id] error', error)
    const message = error instanceof Error ? error.message : 'Failed to fetch reference data'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * PUT /reference-data/types/[id]
 *
 * Updates an existing reference data item
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
    logger.error('API', 'PUT /reference-data/types/[id] error', error)
    const message = error instanceof Error ? error.message : 'Failed to update reference data'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

/**
 * DELETE /reference-data/types/[id]
 *
 * Deletes a reference data item
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
    logger.error('API', 'DELETE /reference-data/types/[id] error', error)
    const message = error instanceof Error ? error.message : 'Failed to delete reference data'

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
