import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { suburb, city } = body

    if (!suburb && !city) {
      return NextResponse.json(
        { error: "Suburb or city is required" },
        { status: 400 }
      )
    }

    // Get all active delivery zones
    const deliveryZones = await db.deliveryZone.findMany({
      where: { isActive: true },
    })

    // Check if the suburb is in any delivery zone
    const matchingZone = deliveryZones.find((zone) => {
      const suburbs = typeof zone.suburbs === 'string'
        ? JSON.parse(zone.suburbs) as string[]
        : zone.suburbs
      return suburbs.some(
        (s: string) => s.toLowerCase() === suburb?.toLowerCase()
      )
    })

    if (matchingZone) {
      return NextResponse.json({
        success: true,
        data: {
          isDeliverable: true,
          zone: {
            id: matchingZone.id,
            name: matchingZone.name,
            baseFee: Number(matchingZone.baseFee),
            freeAbove: matchingZone.freeAbove
              ? Number(matchingZone.freeAbove)
              : null,
          },
          message: `We deliver to ${suburb}! Delivery fee: R${Number(matchingZone.baseFee).toFixed(2)}`,
        },
      })
    }

    // If not found, return not deliverable
    return NextResponse.json({
      success: true,
      data: {
        isDeliverable: false,
        message: `Sorry, we don't currently deliver to ${suburb || city}. Please contact us for special delivery arrangements.`,
      },
    })
  } catch (error) {
    console.error("Delivery zone verification error:", error)
    return NextResponse.json(
      { error: "Failed to verify delivery zone" },
      { status: 500 }
    )
  }
}
