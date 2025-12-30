import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// GET - Get a single school with all details
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

    const { id } = await params

    const school = await db.school.findUnique({
      where: { id },
      include: {
        grades: {
          include: {
            grade: true,
          },
          orderBy: {
            grade: {
              sortOrder: "asc",
            },
          },
        },
        schoolStationeryItems: {
          include: {
            grade: true,
            product: true,
          },
          orderBy: [
            { grade: { sortOrder: "asc" } },
            { sortOrder: "asc" },
          ],
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
    })

    if (!school) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: school,
    })
  } catch (error) {
    console.error("Error fetching school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch school" },
      { status: 500 }
    )
  }
}

// PUT - Update a school
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

    const { id } = await params
    const data = await request.json()

    // Check if school exists
    const existingSchool = await db.school.findUnique({
      where: { id },
    })

    if (!existingSchool) {
      return NextResponse.json(
        { success: false, error: "School not found" },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    let slug = existingSchool.slug
    if (data.name && data.name !== existingSchool.name) {
      slug = generateSlug(data.name)
      const slugExists = await db.school.findFirst({
        where: {
          slug,
          id: { not: id },
        },
      })
      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Update school and grades in a transaction
    const school = await db.$transaction(async (tx) => {
      // Update the school
      const updatedSchool = await tx.school.update({
        where: { id },
        data: {
          name: data.name ?? existingSchool.name,
          slug,
          town: data.town ?? existingSchool.town,
          address: data.address,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          logo: data.logo,
          description: data.description,
          schoolType: data.schoolType,
          isActive: data.isActive ?? existingSchool.isActive,
          isPartner: data.isPartner ?? existingSchool.isPartner,
        },
      })

      // Update grades if provided
      if (data.gradeIds !== undefined) {
        // Remove existing grade assignments
        await tx.schoolGrade.deleteMany({
          where: { schoolId: id },
        })

        // Add new grade assignments
        if (data.gradeIds.length > 0) {
          await tx.schoolGrade.createMany({
            data: data.gradeIds.map((gradeId: string) => ({
              schoolId: id,
              gradeId,
            })),
          })
        }
      }

      // Return updated school with grades
      return tx.school.findUnique({
        where: { id },
        include: {
          grades: {
            include: {
              grade: true,
            },
            orderBy: {
              grade: {
                sortOrder: "asc",
              },
            },
          },
        },
      })
    })

    return NextResponse.json({
      success: true,
      data: school,
    })
  } catch (error) {
    console.error("Error updating school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update school" },
      { status: 500 }
    )
  }
}

// DELETE - Soft delete a school
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

    const { id } = await params

    // Soft delete by setting isActive to false
    const school = await db.school.update({
      where: { id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      data: school,
    })
  } catch (error) {
    console.error("Error deleting school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete school" },
      { status: 500 }
    )
  }
}
