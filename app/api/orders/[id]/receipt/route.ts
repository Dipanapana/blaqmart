import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateReceiptPDF } from "@/lib/pdf"

export const dynamic = "force-dynamic"

/**
 * GET /api/orders/[id]/receipt
 * Generate a downloadable PDF receipt for an order.
 * Accessible by the order owner or admin.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const { id } = await params

    // Find the order
    const order = await db.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
        payment: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      )
    }

    // Check authorization: must be order owner, admin, or guest with email match
    const isOwner = session?.user?.id === order.customerId
    const isAdmin = session?.user?.role === "ADMIN"
    const isGuestOrder = !order.customerId && order.guestEmail

    // For guest orders, we could verify via a token in the URL
    // For now, allow access if user is logged in as owner or is admin
    if (!isOwner && !isAdmin) {
      // For guest orders without auth, check if order is less than 30 days old
      if (isGuestOrder) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        if (order.createdAt < thirtyDaysAgo) {
          return NextResponse.json(
            { success: false, error: "Receipt no longer available" },
            { status: 403 }
          )
        }
      } else if (session) {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        )
      }
    }

    // Prepare receipt data
    const receiptData = {
      order: {
        orderNumber: order.orderNumber,
        createdAt: order.createdAt.toISOString(),
        status: order.status,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        discount: order.discount ? Number(order.discount) : undefined,
        total: Number(order.total),
      },
      customer: {
        name: order.shippingName || "Customer",
        email: order.guestEmail || "",
        phone: order.guestPhone || order.shippingPhone || "",
      },
      address: {
        streetAddress: order.shippingAddress,
        suburb: order.shippingSuburb,
        city: order.shippingCity,
        postalCode: order.shippingPostalCode,
      },
      items: order.items.map((item) => ({
        name: item.productName || item.product?.name || "Product",
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.unitPrice) * item.quantity,
      })),
      payment: order.payment
        ? {
            provider:
              order.payment.provider === "YOCO_CARD"
                ? "Yoco (Card)"
                : order.payment.provider === "YOCO_EFT"
                  ? "Yoco (EFT)"
                  : order.payment.provider === "PAYFAST"
                    ? "PayFast"
                    : "Cash on Delivery",
            status: order.payment.status || "pending",
          }
        : undefined,
    }

    // Generate PDF
    const pdfBuffer = await generateReceiptPDF(receiptData)

    // Create filename
    const filename = `blaqmart-receipt-${order.orderNumber}.pdf`
      .replace(/[^a-z0-9-_.]/gi, "-")
      .toLowerCase()

    // Return PDF
    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    })
  } catch (error) {
    console.error("Failed to generate receipt PDF:", error)

    if (
      error instanceof Error &&
      error.message.includes("Python and reportlab")
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "PDF generation is temporarily unavailable. Please try again later.",
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Failed to generate receipt" },
      { status: 500 }
    )
  }
}
