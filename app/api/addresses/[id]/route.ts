import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

/**
 * DELETE /api/addresses/[id]
 * Delete a saved address
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    // Find the address and verify ownership
    const address = await db.address.findUnique({
      where: { id },
    })

    if (!address) {
      return NextResponse.json(
        { success: false, error: "Address not found" },
        { status: 404 }
      )
    }

    if (address.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      )
    }

    // Check if address is used in any orders
    const ordersWithAddress = await db.order.count({
      where: { addressId: id },
    })

    if (ordersWithAddress > 0) {
      // Don't delete, just unlink from user (soft delete concept)
      // This preserves order history
      return NextResponse.json(
        {
          success: false,
          error:
            "This address is linked to existing orders and cannot be deleted",
        },
        { status: 400 }
      )
    }

    // Delete the address
    await db.address.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Address deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting address:", error)
    return NextResponse.json(
      { success: false, error: "Failed to delete address" },
      { status: 500 }
    )
  }
}
