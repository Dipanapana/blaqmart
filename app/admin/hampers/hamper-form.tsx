"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Plus, Minus, Trash2, Loader2, ImagePlus, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { formatPrice } from "@/lib/utils"

const hamperSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be positive"),
  image: z.string().optional(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
})

type HamperFormData = z.infer<typeof hamperSchema>

interface HamperItem {
  productId: string
  quantity: number
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: { name: string } | null
}

interface HamperFormProps {
  hamper?: {
    id: string
    name: string
    description: string | null
    price: number
    image: string | null
    sortOrder: number
    isActive: boolean
    isFeatured: boolean
    items: HamperItem[]
  }
  products: Product[]
}

export function HamperForm({ hamper, products }: HamperFormProps) {
  const [items, setItems] = useState<HamperItem[]>(hamper?.items || [])
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!hamper

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HamperFormData>({
    resolver: zodResolver(hamperSchema),
    defaultValues: {
      name: hamper?.name || "",
      description: hamper?.description || "",
      price: hamper?.price || 0,
      image: hamper?.image || "",
      sortOrder: hamper?.sortOrder || 0,
      isActive: hamper?.isActive ?? true,
      isFeatured: hamper?.isFeatured ?? false,
    },
  })

  const calculateItemsTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0)
  }

  const addItem = () => {
    if (!selectedProduct) return

    const existing = items.find((i) => i.productId === selectedProduct)
    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === selectedProduct
            ? { ...i, quantity: i.quantity + 1 }
            : i
        )
      )
    } else {
      setItems([...items, { productId: selectedProduct, quantity: 1 }])
    }
    setSelectedProduct("")
  }

  const updateQuantity = (productId: string, delta: number) => {
    setItems(
      items
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  const removeItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId))
  }

  const onSubmit = (data: HamperFormData) => {
    if (items.length === 0) {
      toast({
        title: "No items",
        description: "Please add at least one item to the hamper.",
        variant: "destructive",
      })
      return
    }

    startTransition(async () => {
      try {
        const url = isEditing
          ? `/api/admin/hampers/${hamper.id}`
          : "/api/admin/hampers"
        const method = isEditing ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...data, items }),
        })

        if (!response.ok) {
          throw new Error("Failed to save hamper")
        }

        toast({
          title: isEditing ? "Hamper updated" : "Hamper created",
          description: `${data.name} has been ${isEditing ? "updated" : "created"} successfully.`,
        })

        router.push("/admin/hampers")
        router.refresh()
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save hamper. Please try again.",
          variant: "destructive",
        })
      }
    })
  }

  const groupedProducts = products.reduce(
    (acc, product) => {
      const category = product.category?.name || "Uncategorized"
      if (!acc[category]) acc[category] = []
      acc[category].push(product)
      return acc
    },
    {} as Record<string, Product[]>
  )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hamper Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="e.g., Family Celebration Hamper"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...register("description")}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe this hamper..."
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (ZAR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    {...register("price", { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                  {errors.price && (
                    <p className="text-sm text-destructive">
                      {errors.price.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    {...register("sortOrder", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    {...register("image")}
                    placeholder="https://example.com/image.jpg"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const url = prompt("Enter image URL:")
                      if (url) setValue("image", url)
                    }}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {watch("image") && (
                <div className="aspect-video max-w-sm overflow-hidden rounded-lg border bg-muted">
                  <img
                    src={watch("image")}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Hamper Items */}
          <Card>
            <CardHeader>
              <CardTitle>Hamper Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add Product */}
              <div className="flex gap-2">
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select a product to add" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(groupedProducts).map(([category, prods]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {prods.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {formatPrice(product.price)}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="button" onClick={addItem} disabled={!selectedProduct}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Items List */}
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    No items added yet. Select products above.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {items.map((item) => {
                    const product = products.find((p) => p.id === item.productId)
                    if (!product) return null
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4 rounded-lg border p-3"
                      >
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(product.price)} each
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.productId, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="w-24 text-right font-medium">
                          {formatPrice(product.price * item.quantity)}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.productId)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })}
                  <div className="flex justify-between border-t pt-4 text-lg font-semibold">
                    <span>Items Total</span>
                    <span>{formatPrice(calculateItemsTotal())}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={watch("isActive")}
                  onCheckedChange={(checked) =>
                    setValue("isActive", checked as boolean)
                  }
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Hamper is active
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isFeatured"
                  checked={watch("isFeatured")}
                  onCheckedChange={(checked) =>
                    setValue("isFeatured", checked as boolean)
                  }
                />
                <Label htmlFor="isFeatured" className="cursor-pointer">
                  Featured hamper
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items</span>
                <span>{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Quantity</span>
                <span>{items.reduce((sum, i) => sum + i.quantity, 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items Value</span>
                <span>{formatPrice(calculateItemsTotal())}</span>
              </div>
              <div className="flex justify-between font-semibold border-t pt-3">
                <span>Selling Price</span>
                <span>{formatPrice(watch("price") || 0)}</span>
              </div>
              {watch("price") > 0 && calculateItemsTotal() > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Savings</span>
                  <span className="text-green-600">
                    {formatPrice(calculateItemsTotal() - (watch("price") || 0))}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={isPending} className="w-full">
                  {isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isEditing ? "Update Hamper" : "Create Hamper"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  )
}
