import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateStationeryListPDF } from "@/lib/pdf"

export const dynamic = "force-dynamic"

/**
 * GET /api/schools/[slug]/grades/[gradeSlug]/pdf
 * Generate a printable PDF stationery list for a specific school and grade.
 * Parents can download and print this to check off items when shopping.
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
        { success: false, error: "School not found" },
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
        { success: false, error: "Grade not found" },
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
        { success: false, error: "Grade not available for this school" },
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
        product: true,
      },
      orderBy: [{ isRequired: "desc" }, { sortOrder: "asc" }],
    })

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "No stationery items found for this grade" },
        { status: 404 }
      )
    }

    // Calculate totals
    let requiredTotal = 0
    let optionalTotal = 0

    const formattedItems = items.map((item) => {
      const price = Number(item.product.price)
      const total = price * item.quantity

      if (item.isRequired) {
        requiredTotal += total
      } else {
        optionalTotal += total
      }

      return {
        name: item.product.name,
        quantity: item.quantity,
        price: price,
        isRequired: item.isRequired,
        notes: item.notes || undefined,
      }
    })

    // Prepare data for PDF generator
    const pdfData = {
      school: {
        name: school.name,
        town: school.town,
        logo: school.logo || undefined,
      },
      grade: {
        name: grade.name,
      },
      items: formattedItems,
      totals: {
        required: requiredTotal,
        optional: optionalTotal,
        total: requiredTotal + optionalTotal,
      },
    }

    // Generate PDF
    const pdfBuffer = await generateStationeryListPDF(pdfData)

    // Create filename (URL-safe)
    const filename = `${school.slug}-${grade.slug}-stationery-list-2025.pdf`
      .replace(/[^a-z0-9-_.]/gi, "-")
      .toLowerCase()

    // Return PDF as downloadable file
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
        // Cache for 1 hour (stationery lists don't change often)
        "Cache-Control": "public, max-age=3600",
      },
    })
  } catch (error) {
    console.error("Failed to generate stationery list PDF:", error)

    // Check if it's a Python/reportlab availability error
    if (
      error instanceof Error &&
      error.message.includes("Python and reportlab")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF generation is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate PDF" },
      { status: 500 }
    )
  }
}
