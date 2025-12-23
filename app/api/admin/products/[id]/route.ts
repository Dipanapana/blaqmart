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

    // Check if product exists
    const existingProduct = await db.product.findUnique({
      where: { id: params.id },
    })

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    // Generate new slug if name changed
    let slug = existingProduct.slug
    if (data.name !== existingProduct.name) {
      slug = generateSlug(data.name)
      const slugExists = await db.product.findFirst({
        where: {
          slug,
          id: { not: params.id },
        },
      })
      if (slugExists) {
        slug = `${slug}-${Date.now()}`
      }
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        price: data.price,
        comparePrice: data.compareAtPrice || data.comparePrice || null,
        images: JSON.stringify(data.images || []),
        stock: data.stock || 0,
        lowStockThreshold: data.lowStockThreshold || 5,
        weight: data.weight || null,
        categoryId: data.categoryId,
        supplierId: data.supplierId,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
      },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update product" },
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
    const product = await db.product.update({
      where: { id: params.id },
      data: { isActive: false },
    })

    return NextResponse.json({
      success: true,
      data: product,
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete product" },
      { status: 500 }
    )
  }
}
