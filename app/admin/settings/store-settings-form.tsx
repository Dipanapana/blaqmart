"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface StoreSettings {
  id: string
  storeName: string
  storeEmail: string | null
  storePhone: string | null
  storeAddress: string | null
  minimumOrderValue: number | null
  freeDeliveryThreshold: number | null
  orderPrefix: string
  isMaintenanceMode: boolean
}

interface StoreSettingsFormProps {
  settings: StoreSettings | null
}

export function StoreSettingsForm({ settings }: StoreSettingsFormProps) {
  const [formData, setFormData] = useState({
    storeName: settings?.storeName || "Blaqmart",
    storeEmail: settings?.storeEmail || "",
    storePhone: settings?.storePhone || "",
    storeAddress: settings?.storeAddress || "",
    minimumOrderValue: settings?.minimumOrderValue?.toString() || "",
    freeDeliveryThreshold: settings?.freeDeliveryThreshold?.toString() || "",
    orderPrefix: settings?.orderPrefix || "BLQ",
    isMaintenanceMode: settings?.isMaintenanceMode || false,
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            minimumOrderValue: formData.minimumOrderValue
              ? parseFloat(formData.minimumOrderValue)
              : null,
            freeDeliveryThreshold: formData.freeDeliveryThreshold
              ? parseFloat(formData.freeDeliveryThreshold)
              : null,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save settings")
        }

        toast({
          title: "Settings saved",
          description: "Store settings have been updated successfully.",
        })

        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save settings. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="storeName">Store Name</Label>
          <Input
            id="storeName"
            value={formData.storeName}
            onChange={(e) =>
              setFormData({ ...formData, storeName: e.target.value })
            }
            placeholder="Your store name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="orderPrefix">Order Number Prefix</Label>
          <Input
            id="orderPrefix"
            value={formData.orderPrefix}
            onChange={(e) =>
              setFormData({ ...formData, orderPrefix: e.target.value })
            }
            placeholder="BLQ"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="storeEmail">Store Email</Label>
          <Input
            id="storeEmail"
            type="email"
            value={formData.storeEmail}
            onChange={(e) =>
              setFormData({ ...formData, storeEmail: e.target.value })
            }
            placeholder="store@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="storePhone">Store Phone</Label>
          <Input
            id="storePhone"
            type="tel"
            value={formData.storePhone}
            onChange={(e) =>
              setFormData({ ...formData, storePhone: e.target.value })
            }
            placeholder="+27 12 345 6789"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="storeAddress">Store Address</Label>
        <textarea
          id="storeAddress"
          value={formData.storeAddress}
          onChange={(e) =>
            setFormData({ ...formData, storeAddress: e.target.value })
          }
          rows={2}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="123 Main Street, Pretoria, South Africa"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="minimumOrderValue">Minimum Order Value (ZAR)</Label>
          <Input
            id="minimumOrderValue"
            type="number"
            step="0.01"
            value={formData.minimumOrderValue}
            onChange={(e) =>
              setFormData({ ...formData, minimumOrderValue: e.target.value })
            }
            placeholder="0.00"
          />
          <p className="text-xs text-muted-foreground">
            Leave empty for no minimum
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="freeDeliveryThreshold">
            Free Delivery Threshold (ZAR)
          </Label>
          <Input
            id="freeDeliveryThreshold"
            type="number"
            step="0.01"
            value={formData.freeDeliveryThreshold}
            onChange={(e) =>
              setFormData({
                ...formData,
                freeDeliveryThreshold: e.target.value,
              })
            }
            placeholder="0.00"
          />
          <p className="text-xs text-muted-foreground">
            Orders above this amount get free delivery
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isMaintenanceMode"
          checked={formData.isMaintenanceMode}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isMaintenanceMode: checked as boolean })
          }
        />
        <Label htmlFor="isMaintenanceMode" className="cursor-pointer">
          Enable maintenance mode (store will be inaccessible to customers)
        </Label>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Settings
      </Button>
    </form>
  )
}
