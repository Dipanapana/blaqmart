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
    const existing = await db.hamperPreset.findUnique({
      where: { slug },
    })

    if (existing) {
      slug = `${slug}-${Date.now()}`
    }

    // Get default supplier (first one)
    const defaultSupplier = await db.supplier.findFirst()
    if (!defaultSupplier) {
      return NextResponse.json(
        { success: false, error: "No supplier found" },
        { status: 400 }
      )
    }

    const hamper = await db.hamperPreset.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        price: data.price,
        image: data.image || null,
        sortOrder: data.sortOrder || 0,
        isActive: data.isActive ?? true,
        isFeatured: data.isFeatured ?? false,
        supplierId: data.supplierId || defaultSupplier.id,
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
    console.error("Error creating hamper:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create hamper" },
      { status: 500 }
    )
  }
}
