import { NextResponse } from 'next/server'
import { withAuth } from '@/lib/api/withAuth'
import { logger } from '@/lib/logger'

/**
 * Example: Get documents with query parameters
 * withAuth automatically handles token validation and headers
 */
export const GET = withAuth(async (request, client) => {
  try {
    // Access query parameters if needed
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const page = searchParams.get('page') || '1'

    // Call backend API - all headers automatically included
    const response = await client.get('/api/v2/documents', {
      params: { status, page },
    })

    return NextResponse.json(response.data)
  } catch (error) {
    logger.error('DocumentsAPI', 'Failed to fetch documents', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
})

/**
 * Example: Create document with POST
 */
export const POST = withAuth(async (request, client) => {
  try {
    // Parse request body
    const body = await request.json()

    // Call backend API - all headers automatically included
    const response = await client.post('/api/v2/documents', body)

    return NextResponse.json(response.data, { status: 201 })
  } catch (error) {
    logger.error('DocumentsAPI', 'Failed to create document', error)
    return NextResponse.json({ error: 'Failed to create document' }, { status: 500 })
  }
})
