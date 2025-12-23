import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Check if category exists
    const existingCategory = await db.category.findUnique({
      where: { id: params.id },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    let slug = existingCategory.slug
    if (data.name && data.name !== existingCategory.name) {
      slug = generateSlug(data.name)
      const slugExists = await db.category.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })
      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        image: data.image || null,
        sortOrder: data.sortOrder ?? existingCategory.sortOrder,
        isActive: data.isActive ?? existingCategory.isActive,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Error updating category:", error)
    return NextResponse.json(
      { error: "Failed to update category" },
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
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if category has products
    const productsCount = await db.product.count({
      where: { categoryId: params.id },
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with associated products" },
        { status: 400 }
      )
    }

    // Hard delete since there are no products
    await db.category.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting category:", error)
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    )
  }
}
