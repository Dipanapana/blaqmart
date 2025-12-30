import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// GET - List all schools with grades
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const town = searchParams.get("town")
    const isActive = searchParams.get("isActive")

    const schools = await db.school.findMany({
      where: {
        ...(town && { town }),
        ...(isActive !== null && { isActive: isActive === "true" }),
      },
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
        _count: {
          select: {
            schoolStationeryItems: true,
            orders: true,
          },
        },
      },
      orderBy: [
        { schoolType: "asc" },
        { name: "asc" },
      ],
    })

    // Format the response
    const formattedSchools = schools.map((school) => ({
      ...school,
      gradeRange: school.grades.length > 0
        ? `${school.grades[0].grade.name} - ${school.grades[school.grades.length - 1].grade.name}`
        : "No grades assigned",
      gradeCount: school.grades.length,
      stationeryItemCount: school._count.schoolStationeryItems,
      orderCount: school._count.orders,
    }))

    return NextResponse.json({
      success: true,
      data: formattedSchools,
    })
  } catch (error) {
    console.error("Error fetching schools:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch schools" },
      { status: 500 }
    )
  }
}

// POST - Create a new school with grades
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.town) {
      return NextResponse.json(
        { success: false, error: "Name and town are required" },
        { status: 400 }
      )
    }

    // Generate unique slug
    let slug = generateSlug(data.name)
    const existingSchool = await db.school.findUnique({
      where: { slug },
    })

    if (existingSchool) {
      slug = `${slug}-${Date.now()}`
    }

    // Create school with grades in a transaction
    const school = await db.$transaction(async (tx) => {
      // Create the school
      const newSchool = await tx.school.create({
        data: {
          name: data.name,
          slug,
          town: data.town,
          address: data.address || null,
          contactEmail: data.contactEmail || null,
          contactPhone: data.contactPhone || null,
          logo: data.logo || null,
          description: data.description || null,
          schoolType: data.schoolType || null,
          isActive: data.isActive ?? true,
          isPartner: data.isPartner ?? false,
        },
      })

      // Assign grades if provided
      if (data.gradeIds && data.gradeIds.length > 0) {
        await tx.schoolGrade.createMany({
          data: data.gradeIds.map((gradeId: string) => ({
            schoolId: newSchool.id,
            gradeId,
          })),
        })
      }

      // Return school with grades
      return tx.school.findUnique({
        where: { id: newSchool.id },
        include: {
          grades: {
            include: {
              grade: true,
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
    console.error("Error creating school:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create school" },
      { status: 500 }
    )
  }
}
