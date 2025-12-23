import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      )
    }

    const data = await request.json()

    // Store settings using key-value pairs
    const settingsToSave = [
      { key: 'storeName', value: data.storeName },
      { key: 'storeEmail', value: data.storeEmail },
      { key: 'storePhone', value: data.storePhone },
      { key: 'storeAddress', value: data.storeAddress },
      { key: 'minimumOrderValue', value: data.minimumOrderValue },
      { key: 'freeDeliveryThreshold', value: data.freeDeliveryThreshold },
      { key: 'orderPrefix', value: data.orderPrefix },
      { key: 'isMaintenanceMode', value: data.isMaintenanceMode },
    ]

    for (const setting of settingsToSave) {
      await db.storeSetting.upsert({
        where: { key: setting.key },
        update: { value: setting.value },
        create: { key: setting.key, value: setting.value },
      })
    }

    return NextResponse.json({
      success: true,
      data: data,
    })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json(
      { success: false, error: "Failed to save settings" },
      { status: 500 }
    )
  }
}
