import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

// GET - Get stationery items for a school, optionally filtered by grade
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: schoolId } = await params
    const { searchParams } = new URL(request.url)
    const gradeId = searchParams.get("gradeId")

    const items = await db.schoolStationeryItem.findMany({
      where: {
        schoolId,
        ...(gradeId && { gradeId }),
      },
      include: {
        grade: true,
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [
        { grade: { sortOrder: "asc" } },
        { sortOrder: "asc" },
      ],
    })

    // Group items by grade
    const groupedByGrade = items.reduce((acc, item) => {
      const gradeKey = item.grade.id
      if (!acc[gradeKey]) {
        acc[gradeKey] = {
          grade: item.grade,
          items: [],
        }
      }
      acc[gradeKey].items.push(item)
      return acc
    }, {} as Record<string, { grade: typeof items[0]["grade"]; items: typeof items }>)

    return NextResponse.json({
      success: true,
      data: {
        items,
        groupedByGrade: Object.values(groupedByGrade),
      },
    })
  } catch (error) {
    console.error("Error fetching stationery items:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch stationery items" },
      { status: 500 }
    )
  }
}

// POST - Add stationery items to a school grade
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: schoolId } = await params
    const data = await request.json()

    // Validate required fields
    if (!data.gradeId || !data.productId) {
      return NextResponse.json(
        { success: false, error: "Grade and product are required" },
        { status: 400 }
      )
    }

    // Check if item already exists
    const existing = await db.schoolStationeryItem.findUnique({
      where: {
        schoolId_gradeId_productId: {
          schoolId,
          gradeId: data.gradeId,
          productId: data.productId,
        },
      },
    })

    if (existing) {
      // Update existing item
      const item = await db.schoolStationeryItem.update({
        where: { id: existing.id },
        data: {
          quantity: data.quantity ?? existing.quantity,
          isRequired: data.isRequired ?? existing.isRequired,
          notes: data.notes,
          sortOrder: data.sortOrder ?? existing.sortOrder,
        },
        include: {
          grade: true,
          product: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: item,
        updated: true,
      })
    }

    // Create new item
    const item = await db.schoolStationeryItem.create({
      data: {
        schoolId,
        gradeId: data.gradeId,
        productId: data.productId,
        quantity: data.quantity ?? 1,
        isRequired: data.isRequired ?? true,
        notes: data.notes || null,
        sortOrder: data.sortOrder ?? 0,
      },
      include: {
        grade: true,
        product: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: item,
    })
  } catch (error) {
    console.error("Error adding stationery item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to add stationery item" },
      { status: 500 }
    )
  }
}

// PUT - Bulk update stationery items for a grade
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id: schoolId } = await params
    const data = await request.json()

    if (!data.gradeId || !Array.isArray(data.items)) {
      return NextResponse.json(
        { success: false, error: "Grade ID and items array are required" },
        { status: 400 }
      )
    }

    // Replace all items for this school/grade combination
    const result = await db.$transaction(async (tx) => {
      // Delete existing items for this grade
      await tx.schoolStationeryItem.deleteMany({
        where: {
          schoolId,
          gradeId: data.gradeId,
        },
      })

      // Create new items
      if (data.items.length > 0) {
        await tx.schoolStationeryItem.createMany({
          data: data.items.map((item: {
            productId: string
            quantity?: number
            isRequired?: boolean
            notes?: string
            sortOrder?: number
          }, index: number) => ({
            schoolId,
            gradeId: data.gradeId,
            productId: item.productId,
            quantity: item.quantity ?? 1,
            isRequired: item.isRequired ?? true,
            notes: item.notes || null,
            sortOrder: item.sortOrder ?? index,
          })),
        })
      }

      // Return updated items
      return tx.schoolStationeryItem.findMany({
        where: {
          schoolId,
          gradeId: data.gradeId,
        },
        include: {
          grade: true,
          product: true,
        },
        orderBy: { sortOrder: "asc" },
      })
    })

    return NextResponse.json({
      success: true,
      data: result,
    })
  } catch (error) {
    console.error("Error updating stationery items:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update stationery items" },
      { status: 500 }
    )
  }
}

// DELETE - Remove a stationery item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "Item ID is required" },
        { status: 400 }
      )
    }

    await db.schoolStationeryItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({
      success: true,
      message: "Item deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting stationery item:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete stationery item" },
      { status: 500 }
    )
  }
}
