import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

const addressSchema = z.object({
  label: z.string().optional(),
  recipientName: z.string().min(1, "Recipient name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  streetAddress: z.string().min(1, "Street address is required"),
  suburb: z.string().min(1, "Suburb is required"),
  city: z.string().min(1, "City is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  province: z.string().default("Northern Cape"),
  isDefault: z.boolean().default(false),
})

/**
 * GET /api/addresses
 * Fetch all saved addresses for the logged-in user
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [
        { isDefault: "desc" }, // Default address first
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json({
      success: true,
      data: addresses,
    })
  } catch (error) {
    console.error("Error fetching addresses:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch addresses" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/addresses
 * Create a new address for the logged-in user
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validation = addressSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validation.error.flatten().fieldErrors,
        },
        { status: 400 }
      )
    }

    const data = validation.data

    // Check for duplicate address (same street + postal code)
    const existingAddress = await db.address.findFirst({
      where: {
        userId: session.user.id,
        streetAddress: data.streetAddress,
        postalCode: data.postalCode,
      },
    })

    if (existingAddress) {
      // Return existing address instead of creating duplicate
      return NextResponse.json({
        success: true,
        data: existingAddress,
        message: "Address already exists",
      })
    }

    // Check how many addresses the user already has
    const addressCount = await db.address.count({
      where: { userId: session.user.id },
    })

    // If this is the first address, make it default
    const isFirstAddress = addressCount === 0
    const isDefault = data.isDefault || isFirstAddress

    // If setting this as default, unset other defaults first
    if (isDefault) {
      await db.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      })
    }

    // Create the new address
    const address = await db.address.create({
      data: {
        userId: session.user.id,
        label: data.label,
        recipientName: data.recipientName,
        phone: data.phone,
        streetAddress: data.streetAddress,
        suburb: data.suburb,
        city: data.city,
        postalCode: data.postalCode,
        province: data.province,
        isDefault,
      },
    })

    return NextResponse.json({
      success: true,
      data: address,
      message: "Address saved successfully",
    })
  } catch (error) {
    console.error("Error creating address:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save address" },
      { status: 500 }
    )
  }
}
