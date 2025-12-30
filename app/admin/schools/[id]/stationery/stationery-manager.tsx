"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash2, Loader2, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Grade {
  id: string
  name: string
  slug: string
  sortOrder: number
}

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: {
    id: string
    name: string
  }
}

interface StationeryItem {
  id: string
  productId: string
  quantity: number
  isRequired: boolean
  notes: string | null
  product: {
    id: string
    name: string
    price: number
  }
}

interface StationeryManagerProps {
  schoolId: string
  schoolName: string
  grades: Grade[]
  stationeryByGrade: Record<string, StationeryItem[]>
  products: Product[]
}

export function StationeryManager({
  schoolId,
  schoolName,
  grades,
  stationeryByGrade,
  products,
}: StationeryManagerProps) {
  const [selectedGrade, setSelectedGrade] = useState<string>(
    grades[0]?.id || ""
  )
  const [items, setItems] = useState<Record<string, StationeryItem[]>>(
    stationeryByGrade
  )
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // New item form state
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [quantity, setQuantity] = useState<number>(1)
  const [isRequired, setIsRequired] = useState<boolean>(true)

  const currentItems = items[selectedGrade] || []
  const currentGrade = grades.find((g) => g.id === selectedGrade)

  // Calculate totals
  const totalItems = currentItems.length
  const requiredTotal = currentItems
    .filter((i) => i.isRequired)
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0)
  const optionalTotal = currentItems
    .filter((i) => !i.isRequired)
    .reduce((sum, i) => sum + i.product.price * i.quantity, 0)

  const addItem = async () => {
    if (!selectedProduct || !selectedGrade) {
      toast.error("Please select a product")
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/schools/${schoolId}/stationery`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              gradeId: selectedGrade,
              productId: selectedProduct,
              quantity,
              isRequired,
            }),
          }
        )

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to add item")
        }

        // Update local state
        setItems((prev) => ({
          ...prev,
          [selectedGrade]: [...(prev[selectedGrade] || []), result.data],
        }))

        // Reset form
        setSelectedProduct("")
        setQuantity(1)
        setIsRequired(true)

        toast.success(result.updated ? "Item updated" : "Item added")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to add item"
        )
      }
    })
  }

  const removeItem = async (itemId: string) => {
    startTransition(async () => {
      try {
        const response = await fetch(
          `/api/admin/schools/${schoolId}/stationery?itemId=${itemId}`,
          { method: "DELETE" }
        )

        if (!response.ok) {
          const result = await response.json()
          throw new Error(result.error || "Failed to remove item")
        }

        // Update local state
        setItems((prev) => ({
          ...prev,
          [selectedGrade]: prev[selectedGrade]?.filter((i) => i.id !== itemId),
        }))

        toast.success("Item removed")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to remove item"
        )
      }
    })
  }

  // Products not already in the list
  const availableProducts = products.filter(
    (p) => !currentItems.some((i) => i.productId === p.id)
  )

  // Group available products by category
  const productsByCategory = availableProducts.reduce((acc, product) => {
    const category = product.category.name
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(product)
    return acc
  }, {} as Record<string, Product[]>)

  if (grades.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No grades assigned</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Please assign grades to this school first.
          </p>
          <Button asChild className="mt-4">
            <a href={`/admin/schools/${schoolId}/edit`}>Edit School</a>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs value={selectedGrade} onValueChange={setSelectedGrade}>
        <TabsList className="flex-wrap h-auto gap-1">
          {grades.map((grade) => (
            <TabsTrigger key={grade.id} value={grade.id} className="text-xs">
              {grade.name}
              {items[grade.id]?.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {items[grade.id].length}
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>

        {grades.map((grade) => (
          <TabsContent key={grade.id} value={grade.id}>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Add Item Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Add Item</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select
                      value={selectedProduct}
                      onValueChange={setSelectedProduct}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(productsByCategory).map(
                          ([category, prods]) => (
                            <div key={category}>
                              <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                                {category}
                              </div>
                              {prods.map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - R{product.price.toFixed(2)}
                                </SelectItem>
                              ))}
                            </div>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isRequired"
                      checked={isRequired}
                      onCheckedChange={(checked) =>
                        setIsRequired(checked as boolean)
                      }
                    />
                    <Label htmlFor="isRequired" className="cursor-pointer">
                      Required item
                    </Label>
                  </div>

                  <Button
                    onClick={addItem}
                    disabled={isPending || !selectedProduct}
                    className="w-full"
                  >
                    {isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="mr-2 h-4 w-4" />
                    )}
                    Add Item
                  </Button>
                </CardContent>
              </Card>

              {/* Items List */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {currentGrade?.name} Stationery List
                    </CardTitle>
                    <Badge variant="outline">{totalItems} items</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {currentItems.length === 0 ? (
                    <div className="py-8 text-center text-muted-foreground">
                      No items added yet
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentItems.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>Qty: {item.quantity}</span>
                                <span>×</span>
                                <span>R{item.product.price.toFixed(2)}</span>
                                <span>=</span>
                                <span className="font-medium text-foreground">
                                  R{(item.product.price * item.quantity).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={item.isRequired ? "default" : "secondary"}
                            >
                              {item.isRequired ? "Required" : "Optional"}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeItem(item.id)}
                              disabled={isPending}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}

                      {/* Summary */}
                      <div className="mt-4 rounded-lg bg-muted p-4">
                        <div className="flex justify-between text-sm">
                          <span>Required items total:</span>
                          <span className="font-medium">
                            R{requiredTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Optional items total:</span>
                          <span className="font-medium">
                            R{optionalTotal.toFixed(2)}
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between border-t pt-2 font-medium">
                          <span>Grand Total:</span>
                          <span>R{(requiredTotal + optionalTotal).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
