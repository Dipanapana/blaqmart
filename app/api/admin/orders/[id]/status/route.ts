import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(
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

    const { status } = await request.json()

    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status" },
        { status: 400 }
      )
    }

    const order = await db.order.update({
      where: { id: params.id },
      data: { status },
    })

    // TODO: Send notification to customer about status change
    // This would integrate with SMS (Twilio) or Email (Resend)

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    )
  }
}
