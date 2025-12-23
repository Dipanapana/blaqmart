import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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

    const zone = await db.deliveryZone.create({
      data: {
        name: data.name,
        suburbs: JSON.stringify(data.suburbs || []),
        baseFee: data.fee,
        estimatedDays: data.estimatedDays || null,
        isActive: data.isActive ?? true,
      },
    })

    return NextResponse.json({
      success: true,
      data: zone,
    })
  } catch (error) {
    console.error("Error creating delivery zone:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create delivery zone" },
      { status: 500 }
    )
  }
}
