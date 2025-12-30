import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/schools
 * Returns list of schools with grades and stationery info
 * Query params:
 *   - partners: 'true' to filter only partner schools
 *   - town: filter by town name
 *   - type: filter by school type (Primary, Intermediate, Secondary)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const partnersOnly = searchParams.get('partners') === 'true'
    const town = searchParams.get('town')
    const schoolType = searchParams.get('type')

    const schools = await db.school.findMany({
      where: {
        isActive: true,
        ...(partnersOnly && { isPartner: true }),
        ...(town && { town: { contains: town, mode: 'insensitive' } }),
        ...(schoolType && { schoolType }),
      },
      include: {
        grades: {
          include: {
            grade: {
              select: {
                id: true,
                name: true,
                slug: true,
                sortOrder: true,
              },
            },
          },
          orderBy: {
            grade: {
              sortOrder: 'asc',
            },
          },
        },
        _count: {
          select: {
            schoolStationeryItems: true,
          },
        },
      },
      orderBy: [
        { schoolType: 'asc' },
        { isPartner: 'desc' },
        { name: 'asc' },
      ],
    })

    // Format the response
    const formattedSchools = schools.map((school) => {
      const grades = school.grades.map((sg) => sg.grade)
      return {
        id: school.id,
        name: school.name,
        slug: school.slug,
        town: school.town,
        address: school.address,
        logo: school.logo,
        description: school.description,
        schoolType: school.schoolType,
        isPartner: school.isPartner,
        grades,
        gradeRange: grades.length > 0
          ? `${grades[0].name} - ${grades[grades.length - 1].name}`
          : null,
        hasStationeryList: school._count.schoolStationeryItems > 0,
      }
    })

    // Group schools by type
    const groupedByType = {
      Primary: formattedSchools.filter((s) => s.schoolType === 'Primary'),
      Intermediate: formattedSchools.filter((s) => s.schoolType === 'Intermediate'),
      Secondary: formattedSchools.filter((s) => s.schoolType === 'Secondary'),
    }

    return NextResponse.json({
      success: true,
      data: {
        schools: formattedSchools,
        groupedByType,
        total: formattedSchools.length,
      },
    })
  } catch (error) {
    console.error('Failed to fetch schools:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch schools' },
      { status: 500 }
    )
  }
}
