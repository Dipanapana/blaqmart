import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { validateWebhook } from "@/lib/payfast"
import logger from "@/lib/logger"
import { handleApiError, ApiError } from "@/lib/api-error"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const data: Record<string, string> = {}

    formData.forEach((value, key) => {
      data[key] = value.toString()
    })

    // Validate signature
    const signature = data.signature
    if (!validateWebhook(data, signature)) {
      logger.error("PayFast Webhook", new Error("Invalid signature"))
      throw ApiError.badRequest("Invalid signature")
    }

    const orderId = data.m_payment_id
    const paymentStatus = data.payment_status

    // Find the order
    const order = await db.order.findUnique({
      where: { id: orderId },
    })

    if (!order) {
      logger.error("PayFast Webhook", new Error("Order not found"), { orderId })
      throw ApiError.notFound("Order not found")
    }

    // Verify amount
    const expectedAmount = Number(order.total).toFixed(2)
    if (data.amount_gross !== expectedAmount) {
      logger.error("PayFast Webhook", new Error("Amount mismatch"), {
        received: data.amount_gross,
        expected: expectedAmount,
        orderId,
      })
      throw ApiError.badRequest("Amount mismatch")
    }

    // Update order based on payment status
    if (paymentStatus === "COMPLETE") {
      await db.$transaction([
        // Update order status
        db.order.update({
          where: { id: orderId },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            confirmedAt: new Date(),
          },
        }),
        // Create payment record
        db.payment.create({
          data: {
            orderId,
            provider: "PAYFAST",
            providerPaymentId: data.pf_payment_id,
            amount: parseFloat(data.amount_gross),
            fee: parseFloat(data.amount_fee || "0"),
            status: "PAID",
            pfPaymentId: data.pf_payment_id,
            pfReference: data.pf_payment_id,
            paidAt: new Date(),
            metadata: data,
          },
        }),
        // Add status history
        db.orderStatusHistory.create({
          data: {
            orderId,
            status: "CONFIRMED",
            note: "Payment received via PayFast",
          },
        }),
      ])

      // TODO: Send confirmation email and SMS

      logger.order("Payment confirmed", orderId, { provider: "PayFast" })
    } else if (paymentStatus === "FAILED" || paymentStatus === "CANCELLED") {
      await db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "FAILED",
        },
      })

      // Restore stock
      const orderItems = await db.orderItem.findMany({
        where: { orderId },
      })

      for (const item of orderItems) {
        await db.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        })
      }

      logger.order("Payment failed, stock restored", orderId, { provider: "PayFast" })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error, "PayFast Webhook")
  }
}
