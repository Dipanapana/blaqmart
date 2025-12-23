"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface DeliveryZoneCheckerProps {
  suburb: string
  city: string
}

export function DeliveryZoneChecker({ suburb, city }: DeliveryZoneCheckerProps) {
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<{
    isDeliverable: boolean
    message: string
    zone?: {
      name: string
      baseFee: number
      freeAbove: number | null
    }
  } | null>(null)

  useEffect(() => {
    const checkDeliveryZone = async () => {
      if (!suburb && !city) {
        setResult(null)
        return
      }

      setChecking(true)
      try {
        const response = await fetch("/api/delivery-zones/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suburb, city }),
        })

        const data = await response.json()

        if (response.ok && data.success) {
          setResult(data.data)
        } else {
          setResult(null)
        }
      } catch (error) {
        console.error("Error checking delivery zone:", error)
        setResult(null)
      } finally {
        setChecking(false)
      }
    }

    // Debounce the check
    const timer = setTimeout(checkDeliveryZone, 500)
    return () => clearTimeout(timer)
  }, [suburb, city])

  if (!suburb && !city) {
    return null
  }

  if (checking) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>Checking delivery availability...</AlertDescription>
      </Alert>
    )
  }

  if (!result) {
    return null
  }

  return (
    <Alert variant={result.isDeliverable ? "default" : "destructive"}>
      {result.isDeliverable ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <XCircle className="h-4 w-4" />
      )}
      <AlertDescription>
        {result.message}
        {result.zone && result.zone.freeAbove && (
          <span className="block mt-1 text-xs">
            Free delivery on orders over R{result.zone.freeAbove.toFixed(2)}
          </span>
        )}
      </AlertDescription>
    </Alert>
  )
}
