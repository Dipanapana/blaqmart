import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { logActivity } from "@/lib/activity-log"
import { sendStatusNotification } from "@/lib/email"
import { OrderStatus } from "@prisma/client"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { status, note } = await request.json()

    const validStatuses: OrderStatus[] = [
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

    // Get current order to know previous status
    const currentOrder = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    if (!currentOrder) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    const previousStatus = currentOrder.status
    const newStatus = status as OrderStatus

    // Don't update if status is the same
    if (previousStatus === newStatus) {
      return NextResponse.json({
        success: true,
        data: currentOrder,
        message: "Status unchanged",
      })
    }

    // Update order status and create history entry in a transaction
    const [updatedOrder, historyEntry] = await db.$transaction([
      // Update order status
      db.order.update({
        where: { id },
        data: {
          status: newStatus,
          // Set timestamps for specific statuses
          ...(newStatus === "CONFIRMED" && { confirmedAt: new Date() }),
          ...(newStatus === "DELIVERED" && { deliveredAt: new Date() }),
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      // Create status history entry
      db.orderStatusHistory.create({
        data: {
          orderId: id,
          fromStatus: previousStatus,
          toStatus: newStatus,
          status: newStatus, // Keep for backwards compatibility
          note: note || null,
          createdBy: session.user.id,
        },
      }),
    ])

    // Log the activity
    await logActivity({
      action: "STATUS_CHANGE",
      entityType: "ORDER",
      entityId: id,
      entityName: `Order #${updatedOrder.orderNumber}`,
      details: {
        fromStatus: previousStatus,
        toStatus: newStatus,
        note: note || null,
      },
    })

    // Send customer notification for key status changes
    const notifiableStatuses: OrderStatus[] = [
      "CONFIRMED",
      "PREPARING",
      "READY",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
    ]

    const customerEmail = updatedOrder.guestEmail
    if (notifiableStatuses.includes(newStatus) && customerEmail) {
      // Send email notification
      const emailResult = await sendStatusNotification({
        orderNumber: updatedOrder.orderNumber,
        customerEmail: customerEmail,
        customerName: updatedOrder.shippingName || "Customer",
        status: newStatus,
        note: note || undefined,
        items: updatedOrder.items.map((item) => ({
          name: item.productName,
          quantity: item.quantity,
          price: Number(item.unitPrice),
        })),
        total: Number(updatedOrder.total),
      })

      // Log the notification attempt
      await db.notificationLog.create({
        data: {
          orderId: id,
          type: "EMAIL",
          recipient: customerEmail,
          subject: `Order ${newStatus} - #${updatedOrder.orderNumber}`,
          template: newStatus,
          status: emailResult.success ? "SENT" : "FAILED",
          error: emailResult.success ? null : String(emailResult.error),
          sentAt: emailResult.success ? new Date() : null,
        },
      })

      // Update history entry with notification timestamp if successful
      if (emailResult.success) {
        await db.orderStatusHistory.update({
          where: { id: historyEntry.id },
          data: { notifiedAt: new Date() },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: `Order status updated to ${newStatus}`,
    })
  } catch (error) {
    console.error("Error updating order status:", error)
    return NextResponse.json(
      { success: false, error: "Failed to update order status" },
      { status: 500 }
    )
  }
}

// GET - Get order status history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { id } = await params

    const history = await db.orderStatusHistory.findMany({
      where: { orderId: id },
      orderBy: { createdAt: "desc" },
      include: {
        createdByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: history,
    })
  } catch (error) {
    console.error("Error fetching order status history:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch status history" },
      { status: 500 }
    )
  }
}
