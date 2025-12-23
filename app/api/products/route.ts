import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "12")
    const page = parseInt(searchParams.get("page") || "1")
    const category = searchParams.get("category")
    const featured = searchParams.get("featured") === "true"
    const search = searchParams.get("q")

    const where: any = { isActive: true }

    if (category) {
      where.category = { slug: category }
    }

    if (featured) {
      where.isFeatured = true
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        include: { category: true },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      }),
      db.product.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: products.map((p) => ({
        ...p,
        price: Number(p.price),
        comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch products" },
      { status: 500 }
    )
  }
}
