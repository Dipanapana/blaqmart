import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const hampers = await db.hamperPreset.findMany({
      where: { isActive: true },
      include: {
        items: {
          include: {
            product: {
              include: { category: true },
            },
          },
        },
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
    })

    return NextResponse.json({
      success: true,
      data: hampers.map((h) => ({
        ...h,
        price: Number(h.price),
        items: h.items.map((item) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      })),
    })
  } catch (error) {
    console.error("Error fetching hampers:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch hampers" },
      { status: 500 }
    )
  }
}
