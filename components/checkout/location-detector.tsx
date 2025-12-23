"use client"

import { useState, useEffect, useRef } from "react"
import { MapPin, Loader2, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useGeolocation } from "@/hooks/use-geolocation"
import { toast } from "sonner"

interface LocationDetectorProps {
  onLocationDetected: (address: {
    streetAddress: string
    suburb: string
    city: string
    province: string
    postalCode: string
  }) => void
}

export function LocationDetector({ onLocationDetected }: LocationDetectorProps) {
  const { latitude, longitude, error, loading, getCurrentPosition } =
    useGeolocation()
  const [isGeocoding, setIsGeocoding] = useState(false)
  const hasGeocoded = useRef(false)

  const handleDetectLocation = async () => {
    hasGeocoded.current = false
    getCurrentPosition()
  }

  const geocodeCoordinates = async (lat: number, lon: number) => {
    if (hasGeocoded.current) return

    hasGeocoded.current = true
    setIsGeocoding(true)
    try {
      const response = await fetch(`/api/geocode?lat=${lat}&lon=${lon}`)
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to get address")
      }

      onLocationDetected({
        streetAddress: result.data.streetAddress,
        suburb: result.data.suburb,
        city: result.data.city,
        province: result.data.province,
        postalCode: result.data.postalCode,
      })

      toast.success("Location detected successfully!", {
        description: result.data.displayName,
      })
    } catch (error) {
      hasGeocoded.current = false
      toast.error(
        error instanceof Error ? error.message : "Failed to get address from location"
      )
    } finally {
      setIsGeocoding(false)
    }
  }

  // Auto-geocode when coordinates are available
  useEffect(() => {
    if (latitude && longitude && !hasGeocoded.current) {
      geocodeCoordinates(latitude, longitude)
    }
  }, [latitude, longitude])

  return (
    <div className="space-y-3">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        onClick={handleDetectLocation}
        disabled={loading || isGeocoding}
      >
        {loading || isGeocoding ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loading ? "Getting location..." : "Finding address..."}
          </>
        ) : (
          <>
            <Navigation className="mr-2 h-4 w-4" />
            Use My Current Location
          </>
        )}
      </Button>

      {error && (
        <Alert variant="destructive">
          <MapPin className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {latitude && longitude && !isGeocoding && (
        <Alert>
          <MapPin className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Location: {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
