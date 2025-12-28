import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { ReferenceDataService } from '@/lib/api/referenceDataService'

/**
 * GET /reference-data/types
 *
 * Fetches reference data items by type.
 * If refDataType query param is provided, fetches values for that type.
 * Otherwise, fetches all items of type REF_DATA_TYPE.
 */
export const GET = withAuth(async (request: NextRequest, client) => {
  try {
    const { searchParams } = new URL(request.url)
    const refDataType = searchParams.get('refDataType')

    const referenceDataService = new ReferenceDataService(client)
    // If refDataType is specified, fetch values for that type
    // Otherwise, fetch the list of reference data types (REF_DATA_TYPE)
    const type = refDataType || 'REF_DATA_TYPE'
    const data = await referenceDataService.getByType(type)

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
