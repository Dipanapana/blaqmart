"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface OrderStatusUpdateProps {
  orderId: string
  currentStatus: string
}

const orderStatuses = [
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "PREPARING", label: "Preparing" },
  { value: "READY", label: "Ready for Pickup/Delivery" },
  { value: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
]

export function OrderStatusUpdate({
  orderId,
  currentStatus,
}: OrderStatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleUpdate = () => {
    if (status === currentStatus) {
      toast({
        title: "No changes",
        description: "Please select a different status to update.",
      })
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/orders/${orderId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        })

        if (!response.ok) {
          throw new Error("Failed to update status")
        }

        toast({
          title: "Status updated",
          description: `Order status has been updated to ${status.replace(/_/g, " ")}.`,
        })

        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to update order status. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <Select value={status} onValueChange={setStatus}>
        <SelectTrigger className="w-full sm:w-64">
          <SelectValue placeholder="Select status" />
        </SelectTrigger>
        <SelectContent>
          {orderStatuses.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        onClick={handleUpdate}
        disabled={isPending || status === currentStatus}
      >
        {isPending ? "Updating..." : "Update Status"}
      </Button>
    </div>
  )
}
