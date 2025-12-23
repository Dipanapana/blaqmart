import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateOrderNumber } from "@/lib/utils"
import { z } from "zod"
import logger from "@/lib/logger"
import { handleApiError, ApiError } from "@/lib/api-error"

const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  shippingAddress: z.object({
    recipientName: z.string(),
    phone: z.string(),
    streetAddress: z.string(),
    suburb: z.string(),
    city: z.string(),
    postalCode: z.string(),
    province: z.string(),
  }),
  deliveryDate: z.string(),
  deliverySlot: z.string(),
  deliveryNotes: z.string().optional(),
  giftMessage: z.string().optional(),
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),
  paymentMethod: z.enum(["payfast", "cod"]).default("payfast"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const data = orderSchema.parse(body)

    // Get products and calculate totals
    const productIds = data.items.map((item) => item.productId)
    const products = await db.product.findMany({
      where: { id: { in: productIds }, isActive: true },
    })

    if (products.length !== data.items.length) {
      return NextResponse.json(
        { error: "Some products are no longer available" },
        { status: 400 }
      )
    }

    // Check stock
    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId)
      if (!product || product.stock < item.quantity) {
        return NextResponse.json(
          {
            error: `Insufficient stock for ${product?.name || "product"}`,
          },
          { status: 400 }
        )
      }
    }

    // Calculate totals
    let subtotal = 0
    const orderItems = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!
      const unitPrice = Number(product.price)
      const totalPrice = unitPrice * item.quantity
      subtotal += totalPrice
      return {
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      }
    })

    // Calculate delivery fee
    const deliveryFee = subtotal >= 500 ? 0 : 50
    const total = subtotal + deliveryFee

    // Get default supplier
    const supplier = await db.supplier.findFirst({
      where: { isActive: true },
    })

    if (!supplier) {
      return NextResponse.json(
        { error: "No active supplier found" },
        { status: 500 }
      )
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId: session?.user?.id,
        supplierId: supplier.id,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        shippingName: data.shippingAddress.recipientName,
        shippingPhone: data.shippingAddress.phone,
        shippingAddress: data.shippingAddress.streetAddress,
        shippingSuburb: data.shippingAddress.suburb,
        shippingCity: data.shippingAddress.city,
        shippingPostalCode: data.shippingAddress.postalCode,
        shippingProvince: data.shippingAddress.province,
        subtotal,
        deliveryFee,
        total,
        deliveryDate: new Date(data.deliveryDate),
        deliverySlot: data.deliverySlot,
        deliveryNotes: data.deliveryNotes,
        giftMessage: data.giftMessage,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: orderItems,
        },
        statusHistory: {
          create: {
            status: "PENDING",
            note: "Order created",
          },
        },
        payment: {
          create: {
            provider: (data.paymentMethod?.toUpperCase() || "PAYFAST") as "PAYFAST" | "YOCO_CARD" | "YOCO_EFT" | "COD",
            amount: total,
            status: "PENDING",
          },
        },
      },
      include: {
        items: true,
        payment: true,
      },
    })

    // Update stock
    for (const item of data.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    logger.order("Order created", order.id, { orderNumber: order.orderNumber })

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid order data", details: error.issues },
        { status: 400 }
      )
    }

    return handleApiError(error, "Order API")
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await db.order.findMany({
      where: { customerId: session.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      data: orders.map((order) => ({
        ...order,
        subtotal: Number(order.subtotal),
        deliveryFee: Number(order.deliveryFee),
        total: Number(order.total),
        items: order.items.map((item) => ({
          ...item,
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
        })),
      })),
    })
  } catch (error) {
    return handleApiError(error, "Order API")
  }
}
