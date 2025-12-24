import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/schools
 * Returns list of schools, optionally filtered by partner status
 * Query params:
 *   - partners: 'true' to filter only partner schools
 *   - town: filter by town name
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnersOnly = searchParams.get('partners') === 'true'
    const town = searchParams.get('town')

    const schools = await db.school.findMany({
      where: {
        isActive: true,
        ...(partnersOnly && { isPartner: true }),
        ...(town && { town: { contains: town, mode: 'insensitive' } }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        town: true,
        address: true,
        logo: true,
        isPartner: true,
      },
      orderBy: [
        { isPartner: 'desc' }, // Partner schools first
        { name: 'asc' },
      ],
    })

    return NextResponse.json({
      success: true,
      data: schools,
    })
  } catch (error) {
    console.error('Failed to fetch schools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}
