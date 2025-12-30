import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * GET /api/schools/[slug]/grades/[gradeSlug]
 * Returns stationery list for a specific school and grade
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; gradeSlug: string }> }
) {
  try {
    const { slug, gradeSlug } = await params

    // Find the school
    const school = await db.school.findUnique({
      where: {
        slug,
        isActive: true,
      },
    })

    if (!school) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      )
    }

    // Find the grade
    const grade = await db.grade.findUnique({
      where: {
        slug: gradeSlug,
        isActive: true,
      },
    })

    if (!grade) {
      return NextResponse.json(
        { success: false, error: 'Grade not found' },
        { status: 404 }
      )
    }

    // Check if this grade is assigned to this school
    const schoolGrade = await db.schoolGrade.findUnique({
      where: {
        schoolId_gradeId: {
          schoolId: school.id,
          gradeId: grade.id,
        },
      },
    })

    if (!schoolGrade) {
      return NextResponse.json(
        { success: false, error: 'Grade not available for this school' },
        { status: 404 }
      )
    }

    // Get stationery items for this school and grade
    const items = await db.schoolStationeryItem.findMany({
      where: {
        schoolId: school.id,
        gradeId: grade.id,
      },
      include: {
        product: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
      orderBy: [
        { isRequired: 'desc' },
        { sortOrder: 'asc' },
      ],
    })

    // Format items and calculate totals
    const formattedItems = items.map((item) => ({
      id: item.id,
      productId: item.product.id,
      productName: item.product.name,
      productSlug: item.product.slug,
      productImage: (() => {
        try {
          const images = JSON.parse(item.product.images || '[]')
          return images[0] || null
        } catch {
          return null
        }
      })(),
      category: item.product.category,
      price: Number(item.product.price),
      quantity: item.quantity,
      isRequired: item.isRequired,
      notes: item.notes,
      totalPrice: Number(item.product.price) * item.quantity,
      inStock: item.product.stock > 0,
      stock: item.product.stock,
    }))

    const requiredItems = formattedItems.filter((i) => i.isRequired)
    const optionalItems = formattedItems.filter((i) => !i.isRequired)

    const requiredTotal = requiredItems.reduce((sum, i) => sum + i.totalPrice, 0)
    const optionalTotal = optionalItems.reduce((sum, i) => sum + i.totalPrice, 0)
    const grandTotal = requiredTotal + optionalTotal

    return NextResponse.json({
      success: true,
      data: {
        school: {
          id: school.id,
          name: school.name,
          slug: school.slug,
          town: school.town,
        },
        grade: {
          id: grade.id,
          name: grade.name,
          slug: grade.slug,
        },
        items: formattedItems,
        requiredItems,
        optionalItems,
        summary: {
          totalItems: formattedItems.length,
          requiredCount: requiredItems.length,
          optionalCount: optionalItems.length,
          requiredTotal,
          optionalTotal,
          grandTotal,
        },
      },
    })
  } catch (error) {
    console.error('Failed to fetch stationery list:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch stationery list' },
      { status: 500 }
    )
  }
}
