import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/schools/[slug]
 * Returns a single school with grades and stationery items
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const school = await db.school.findUnique({
      where: {
        slug,
        isActive: true,
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
                image: true,
              },
            },
          },
          orderBy: {
            grade: {
              sortOrder: 'asc',
            },
          },
        },
      },
    })

    if (!school) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      )
    }

    // Get stationery item counts per grade
    const stationeryCounts = await db.schoolStationeryItem.groupBy({
      by: ['gradeId'],
      where: {
        schoolId: school.id,
      },
      _count: {
        id: true,
      },
    })

    const countMap = new Map(
      stationeryCounts.map((c) => [c.gradeId, c._count.id])
    )

    // Format grades with stationery count
    const grades = school.grades.map((sg) => ({
      ...sg.grade,
      stationeryItemCount: countMap.get(sg.grade.id) || 0,
      hasStationeryList: (countMap.get(sg.grade.id) || 0) > 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        id: school.id,
        name: school.name,
        slug: school.slug,
        town: school.town,
        address: school.address,
        contactEmail: school.contactEmail,
        contactPhone: school.contactPhone,
        logo: school.logo,
        description: school.description,
        schoolType: school.schoolType,
        isPartner: school.isPartner,
        grades,
        gradeRange: grades.length > 0
          ? `${grades[0].name} - ${grades[grades.length - 1].name}`
          : null,
      },
    })
  } catch (error) {
    console.error('Failed to fetch school:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch school' },
      { status: 500 }
    )
  }
}
