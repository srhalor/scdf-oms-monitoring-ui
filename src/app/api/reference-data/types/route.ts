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
  const { searchParams } = new URL(request.url)
  const refDataType = searchParams.get('refDataType')
  const service = new ReferenceDataService(client)
  const type = refDataType || 'REF_DATA_TYPE'
  const data = await service.getByType(type)
  return NextResponse.json(data)
})

/**
 * POST /reference-data/types
 *
 * Creates a new reference data item
 */
export const POST = withAuth(async (request: NextRequest, client) => {
  const body = await request.json()
  const service = new ReferenceDataService(client)
  const data = await service.create(body)
  return NextResponse.json(data, { status: 201 })
})
