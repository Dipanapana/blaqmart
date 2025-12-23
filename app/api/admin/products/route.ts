import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

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

    // Generate unique slug
    let slug = generateSlug(data.name)
    const existingProduct = await db.product.findUnique({
      where: { slug },
    })

    if (existingProduct) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await db.product.create({
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
    console.error("Error creating product:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create product" },
      { status: 500 }
    )
  }
}
