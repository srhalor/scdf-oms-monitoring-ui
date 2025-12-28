import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { ReferenceDataService } from '@/lib/api/referenceDataService'

/**
 * GET /reference-data/types
 *
 * Fetches all reference data items of type REF_DATA_TYPE
 */
export const GET = withAuth(async (_request, client) => {
  try {
    const referenceDataService = new ReferenceDataService(client)
    const data = await referenceDataService.getByType('REF_DATA_TYPE')

    return NextResponse.json(data)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reference data types'

    return NextResponse.json({ error: message }, { status: 500 })
  }
})

/**
 * POST /reference-data/types
 *
 * Creates a new reference data item
 */
export const POST = withAuth(async (request: NextRequest, client) => {
  try {
    const body = await request.json()
    const referenceDataService = new ReferenceDataService(client)
    const data = await referenceDataService.create(body)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create reference data'

    return NextResponse.json({ error: message }, { status: 500 })
  }
})
