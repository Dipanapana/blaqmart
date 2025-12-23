import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lon = searchParams.get("lon")

    if (!lat || !lon) {
      return NextResponse.json(
        { error: "Latitude and longitude are required" },
        { status: 400 }
      )
    }

    // Use Nominatim (OpenStreetMap) reverse geocoding service
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "Blaqmart E-commerce App",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to fetch address")
    }

    const data = await response.json()

    // Extract relevant address components
    const address = data.address || {}

    return NextResponse.json({
      success: true,
      data: {
        streetAddress: [
          address.house_number,
          address.road || address.street,
        ]
          .filter(Boolean)
          .join(" ") || "",
        suburb: address.suburb || address.neighbourhood || address.village || "",
        city: address.city || address.town || address.municipality || "Warrenton",
        province: address.state || "Northern Cape",
        postalCode: address.postcode || "",
        displayName: data.display_name,
        coordinates: {
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        },
      },
    })
  } catch (error) {
    console.error("Geocoding error:", error)
    return NextResponse.json(
      { error: "Failed to geocode location" },
      { status: 500 }
    )
  }
}
