"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Pencil, Trash2, Loader2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"

interface DeliveryZone {
  id: string
  name: string
  suburbs: string[]
  fee: number
  estimatedDays: string | null
  isActive: boolean
}

interface DeliveryZonesManagerProps {
  zones: DeliveryZone[]
}

export function DeliveryZonesManager({ zones }: DeliveryZonesManagerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    suburbs: "",
    fee: "",
    estimatedDays: "",
    isActive: true,
  })
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()

  const resetForm = () => {
    setFormData({
      name: "",
      suburbs: "",
      fee: "",
      estimatedDays: "",
      isActive: true,
    })
    setEditingZone(null)
  }

  const openEdit = (zone: DeliveryZone) => {
    setEditingZone(zone)
    setFormData({
      name: zone.name,
      suburbs: zone.suburbs.join(", "),
      fee: zone.fee.toString(),
      estimatedDays: zone.estimatedDays || "",
      isActive: zone.isActive,
    })
    setIsOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    startTransition(async () => {
      try {
        const url = editingZone
          ? `/api/admin/delivery-zones/${editingZone.id}`
          : "/api/admin/delivery-zones"
        const method = editingZone ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            suburbs: formData.suburbs
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            fee: parseFloat(formData.fee) || 0,
            estimatedDays: formData.estimatedDays || null,
            isActive: formData.isActive,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to save delivery zone")
        }

        toast({
          title: editingZone ? "Zone updated" : "Zone created",
          description: `${formData.name} has been ${editingZone ? "updated" : "created"} successfully.`,
        })

        setIsOpen(false)
        resetForm()
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save delivery zone. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const handleDelete = (zone: DeliveryZone) => {
    if (!confirm(`Are you sure you want to delete ${zone.name}?`)) return

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to delete delivery zone")
        }

        toast({
          title: "Zone deleted",
          description: `${zone.name} has been deleted.`,
        })

        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete delivery zone.",
          variant: "destructive",
        })
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            setIsOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingZone ? "Edit Delivery Zone" : "Add Delivery Zone"}
              </DialogTitle>
              <DialogDescription>
                Configure a delivery zone with suburbs and fees
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="zone-name">Zone Name</Label>
                <Input
                  id="zone-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Pretoria Central"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="suburbs">Suburbs (comma-separated)</Label>
                <textarea
                  id="suburbs"
                  value={formData.suburbs}
                  onChange={(e) =>
                    setFormData({ ...formData, suburbs: e.target.value })
                  }
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Hatfield, Brooklyn, Waterkloof, Menlo Park"
                  required
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fee">Delivery Fee (ZAR)</Label>
                  <Input
                    id="fee"
                    type="number"
                    step="0.01"
                    value={formData.fee}
                    onChange={(e) =>
                      setFormData({ ...formData, fee: e.target.value })
                    }
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimatedDays">Estimated Delivery</Label>
                  <Input
                    id="estimatedDays"
                    value={formData.estimatedDays}
                    onChange={(e) =>
                      setFormData({ ...formData, estimatedDays: e.target.value })
                    }
                    placeholder="1-2 days"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="zone-active"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                />
                <Label htmlFor="zone-active" className="cursor-pointer">
                  Zone is active
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {editingZone ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {zones.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No delivery zones yet</p>
          <p className="text-muted-foreground">
            Add delivery zones to enable delivery for your customers
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-center justify-between rounded-lg border p-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{zone.name}</p>
                  {!zone.isActive && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {zone.suburbs.slice(0, 5).join(", ")}
                  {zone.suburbs.length > 5 && ` +${zone.suburbs.length - 5} more`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(zone.fee)}</p>
                  {zone.estimatedDays && (
                    <p className="text-xs text-muted-foreground">
                      {zone.estimatedDays}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(zone)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(zone)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
