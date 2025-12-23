import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

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

    const zone = await db.deliveryZone.update({
      where: { id: params.id },
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
    console.error("Error updating delivery zone:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update delivery zone" },
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

    await db.deliveryZone.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
    })
  } catch (error) {
    console.error("Error deleting delivery zone:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete delivery zone" },
      { status: 500 }
    )
  }
}
