import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Check if hamper exists
    const existing = await db.hamperPreset.findUnique({
      where: { id: params.id },
    })

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Hamper not found" },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    let slug = existing.slug
    if (data.name !== existing.name) {
      slug = generateSlug(data.name)
      const slugExists = await db.hamperPreset.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })
      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    // Delete existing items and recreate
    await db.hamperPresetItem.deleteMany({
      where: { presetId: params.id },
    })

    const hamper = await db.hamperPreset.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        price: data.price,
        image: data.image || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        items: {
          create: data.items.map((item: { productId: string; quantity: number }) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: hamper,
    })
  } catch (error) {
    console.error("Error updating hamper:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update hamper" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Soft delete by setting isActive to false
    const hamper = await db.hamperPreset.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      data: hamper,
    })
  } catch (error) {
    console.error("Error deleting hamper:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete hamper" },
      { status: 500 }
    )
  }
}
