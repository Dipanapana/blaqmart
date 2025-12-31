import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { generateOrderNumber } from "@/lib/utils"
import { z } from "zod"
import logger from "@/lib/logger"
import { handleApiError } from "@/lib/api-error"
import { createYocoCheckout, randToCents, getYocoUrls } from "@/lib/yoco"
import { sendOrderConfirmation } from "@/lib/email"

// Updated schema to support both home delivery and school collection
const orderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().min(1),
    })
  ),
  // Delivery method
  deliveryMethod: z.enum(["home", "school"]).default("home"),

  // School collection fields
  schoolId: z.string().optional(),
  collectorName: z.string().optional(),
  collectorPhone: z.string().optional(),
  childName: z.string().optional(),
  childGrade: z.string().optional(),

  // Home delivery address (optional for school collection)
  shippingAddress: z.object({
    recipientName: z.string(),
    phone: z.string(),
    streetAddress: z.string(),
    suburb: z.string(),
    city: z.string(),
    postalCode: z.string(),
    province: z.string(),
  }).optional(),

  // Delivery options (optional for school collection)
  deliveryDate: z.string().optional(),
  deliverySlot: z.string().optional(),
  deliveryNotes: z.string().nullish(),
  giftMessage: z.string().nullish(),

  // Guest checkout
  guestEmail: z.string().email().optional(),
  guestPhone: z.string().optional(),

  // Payment
  paymentMethod: z.enum(["payfast", "yoco", "cod"]).default("yoco"),

  // Save address for future orders
  saveAddress: z.boolean().default(false),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === "school") {
    if (!data.schoolId) {
      ctx.addIssue({ code: "custom", message: "School is required for school collection", path: ["schoolId"] })
    }
    if (!data.collectorName) {
      ctx.addIssue({ code: "custom", message: "Collector name is required", path: ["collectorName"] })
    }
    if (!data.collectorPhone) {
      ctx.addIssue({ code: "custom", message: "Collector phone is required", path: ["collectorPhone"] })
    }
  } else {
    if (!data.shippingAddress) {
      ctx.addIssue({ code: "custom", message: "Shipping address is required for home delivery", path: ["shippingAddress"] })
    }
  }
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    const body = await request.json()
    const data = orderSchema.parse(body)

    const isSchoolCollection = data.deliveryMethod === "school"

    // Validate school exists for school collection
    let school = null
    if (isSchoolCollection && data.schoolId) {
      school = await db.school.findUnique({
        where: { id: data.schoolId, isActive: true, isPartner: true },
      })
      if (!school) {
        return NextResponse.json(
          { error: "Selected school is not available for collection" },
          { status: 400 }
        )
      }
    }

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

    // Calculate delivery fee (free for school collection or orders >= R500)
    const deliveryFee = isSchoolCollection ? 0 : (subtotal >= 500 ? 0 : 50)
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

    // Determine delivery type
    const deliveryType = isSchoolCollection
      ? "SCHOOL_COLLECTION"
      : "LOCAL_OWN_VEHICLE" // Default, could be enhanced based on town

    // Determine payment provider
    let paymentProvider: "PAYFAST" | "YOCO_CARD" | "YOCO_EFT" | "COD" = "YOCO_CARD"
    if (data.paymentMethod === "payfast") {
      paymentProvider = "PAYFAST"
    } else if (data.paymentMethod === "cod") {
      paymentProvider = "COD"
    }

    // Verify customer exists in database if session present
    let customerId: string | null = null
    if (session?.user?.id) {
      const customer = await db.user.findUnique({
        where: { id: session.user.id },
      })
      if (customer) {
        customerId = customer.id
      }
    }

    // Create order
    const order = await db.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        customerId,
        supplierId: supplier.id,
        guestEmail: data.guestEmail || session?.user?.email,
        guestPhone: data.guestPhone,

        // Delivery type and school collection
        deliveryType,
        schoolId: isSchoolCollection ? data.schoolId : null,
        collectorName: isSchoolCollection ? data.collectorName : null,
        collectorPhone: isSchoolCollection ? data.collectorPhone : null,
        childName: isSchoolCollection ? data.childName : null,
        childGrade: isSchoolCollection ? data.childGrade : null,

        // Shipping address (use school info for school collection)
        shippingName: isSchoolCollection
          ? (data.collectorName || "School Collection")
          : (data.shippingAddress?.recipientName || ""),
        shippingPhone: isSchoolCollection
          ? (data.collectorPhone || "")
          : (data.shippingAddress?.phone || ""),
        shippingAddress: isSchoolCollection
          ? `Collect at ${school?.name || "school"}`
          : (data.shippingAddress?.streetAddress || ""),
        shippingSuburb: isSchoolCollection
          ? (school?.town || "")
          : (data.shippingAddress?.suburb || ""),
        shippingCity: isSchoolCollection
          ? (school?.town || "")
          : (data.shippingAddress?.city || ""),
        shippingPostalCode: isSchoolCollection
          ? "0000"
          : (data.shippingAddress?.postalCode || ""),
        shippingProvince: isSchoolCollection
          ? "Northern Cape"
          : (data.shippingAddress?.province || "Northern Cape"),

        // Pricing
        subtotal,
        deliveryFee,
        total,

        // Delivery options
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        deliverySlot: data.deliverySlot || null,
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
            note: isSchoolCollection
              ? `Order created for school collection at ${school?.name}`
              : "Order created",
          },
        },
        payment: {
          create: {
            provider: paymentProvider,
            amount: total,
            status: "PENDING",
          },
        },
      },
      include: {
        items: true,
        payment: true,
        school: true,
      },
    })

    // Update stock
    for (const item of data.items) {
      await db.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      })
    }

    logger.order("Order created", order.id, {
      orderNumber: order.orderNumber,
      deliveryType,
      schoolId: order.schoolId,
    })

    // Save address for logged-in users if requested
    if (data.saveAddress && customerId && !isSchoolCollection && data.shippingAddress) {
      try {
        // Check if address already exists
        const existingAddress = await db.address.findFirst({
          where: {
            userId: customerId,
            streetAddress: data.shippingAddress.streetAddress,
            postalCode: data.shippingAddress.postalCode,
          },
        })

        if (!existingAddress) {
          // Check how many addresses the user already has
          const addressCount = await db.address.count({
            where: { userId: customerId },
          })

          // First address becomes default
          const isDefault = addressCount === 0

          // Create new address
          const savedAddress = await db.address.create({
            data: {
              userId: customerId,
              recipientName: data.shippingAddress.recipientName,
              phone: data.shippingAddress.phone,
              streetAddress: data.shippingAddress.streetAddress,
              suburb: data.shippingAddress.suburb,
              city: data.shippingAddress.city,
              postalCode: data.shippingAddress.postalCode,
              province: data.shippingAddress.province,
              isDefault,
            },
          })

          // Link address to order
          await db.order.update({
            where: { id: order.id },
            data: { addressId: savedAddress.id },
          })

          logger.info("Address", "Saved for order", {
            orderId: order.id,
            addressId: savedAddress.id,
          })
        } else {
          // Link existing address to order
          await db.order.update({
            where: { id: order.id },
            data: { addressId: existingAddress.id },
          })
        }
      } catch (addressError) {
        // Log but don't fail the order
        logger.error("Address save", addressError as Error, { orderId: order.id })
      }
    }

    // Send order confirmation email for COD orders (Yoco emails sent after payment)
    if (data.paymentMethod === "cod") {
      const customerEmail = data.guestEmail || session?.user?.email
      const customerName = isSchoolCollection
        ? (data.collectorName || "Customer")
        : (data.shippingAddress?.recipientName || "Customer")

      if (customerEmail) {
        sendOrderConfirmation({
          orderNumber: order.orderNumber,
          customerEmail,
          customerName,
          items: orderItems.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.unitPrice,
          })),
          subtotal,
          deliveryFee,
          total,
          deliveryAddress: !isSchoolCollection && data.shippingAddress ? {
            recipientName: data.shippingAddress.recipientName,
            streetAddress: data.shippingAddress.streetAddress,
            city: data.shippingAddress.city,
            province: data.shippingAddress.province,
          } : undefined,
          schoolName: school?.name,
          paymentMethod: "cod",
        }).catch(err => {
          // Log but don't fail the order
          logger.error("Email", err as Error, { orderId: order.id })
        })
      }
    }

    // Handle payment redirect for Yoco
    let paymentRedirectUrl: string | null = null

    if (data.paymentMethod === "yoco") {
      try {
        const yocoUrls = getYocoUrls(order.id)
        const yocoCheckout = await createYocoCheckout({
          amount: randToCents(total),
          currency: "ZAR",
          successUrl: yocoUrls.successUrl,
          cancelUrl: yocoUrls.cancelUrl,
          failureUrl: yocoUrls.failureUrl,
          metadata: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            customerEmail: data.guestEmail || session?.user?.email || "",
            customerPhone: data.guestPhone || data.shippingAddress?.phone || data.collectorPhone || "",
          },
        })

        // Update payment record with Yoco checkout ID
        await db.payment.update({
          where: { id: order.payment?.id },
          data: {
            yocoCheckoutId: yocoCheckout.id,
          },
        })

        paymentRedirectUrl = yocoCheckout.redirectUrl

        logger.payment("Yoco checkout created", "Yoco", {
          orderId: order.id,
          checkoutId: yocoCheckout.id,
        })
      } catch (yocoError) {
        logger.error("Yoco Checkout", yocoError as Error, { orderId: order.id })
        // Don't fail the order, just log the error
        // Customer can retry payment later
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: Number(order.total),
        deliveryType,
        schoolName: school?.name,
        paymentMethod: data.paymentMethod,
        paymentRedirectUrl,
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
        school: true,
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
