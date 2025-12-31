"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ShoppingCart, Check, Package, Loader2, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"
import { SchoolListWhatsAppButton } from "@/components/shared/whatsapp-button"

interface StationeryItem {
  id: string
  productId: string
  productName: string
  productSlug: string
  productImage: string | null
  category: {
    id: string
    name: string
    slug: string
  }
  price: number
  quantity: number
  isRequired: boolean
  notes: string | null
  totalPrice: number
  inStock: boolean
  stock: number
}

interface StationeryData {
  school: {
    id: string
    name: string
    slug: string
    town: string
  }
  grade: {
    id: string
    name: string
    slug: string
  }
  items: StationeryItem[]
  requiredItems: StationeryItem[]
  optionalItems: StationeryItem[]
  summary: {
    totalItems: number
    requiredCount: number
    optionalCount: number
    requiredTotal: number
    optionalTotal: number
    grandTotal: number
  }
}

export default function GradeStationeryPage({
  params,
}: {
  params: Promise<{ slug: string; gradeSlug: string }>
}) {
  const [data, setData] = useState<StationeryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [addingToCart, setAddingToCart] = useState(false)
  const { addItem } = useCart()

  useEffect(() => {
    async function fetchData() {
      try {
        const { slug, gradeSlug } = await params
        const response = await fetch(`/api/schools/${slug}/grades/${gradeSlug}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to load stationery list")
        }

        setData(result.data)
        // Pre-select all required items
        const requiredIds = new Set<string>(
          result.data.requiredItems.map((item: StationeryItem) => item.id)
        )
        setSelectedItems(requiredIds)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params])

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedItems(new Set<string>(data?.items.map((item) => item.id) || []))
  }

  const selectRequired = () => {
    setSelectedItems(new Set<string>(data?.requiredItems.map((item) => item.id) || []))
  }

  const addSelectedToCart = async () => {
    if (!data || selectedItems.size === 0) return

    setAddingToCart(true)

    try {
      const itemsToAdd = data.items.filter((item) => selectedItems.has(item.id))

      for (const item of itemsToAdd) {
        // Add item to cart - addItem handles quantity internally
        for (let i = 0; i < item.quantity; i++) {
          addItem({
            productId: item.productId,
            name: item.productName,
            price: item.price,
            image: item.productImage || "/images/placeholder.png",
            stock: item.stock,
          })
        }
      }

      toast.success(`Added ${itemsToAdd.length} items to cart`)
    } catch {
      toast.error("Failed to add items to cart")
    } finally {
      setAddingToCart(false)
    }
  }

  const selectedTotal = data?.items
    .filter((item) => selectedItems.has(item.id))
    .reduce((sum, item) => sum + item.totalPrice, 0) || 0

  if (loading) {
    return (
      <div className="container py-16 text-center">
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading stationery list...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container py-16 text-center">
        <Package className="mx-auto h-16 w-16 text-muted-foreground" />
        <h1 className="mt-4 text-2xl font-bold">List Not Found</h1>
        <p className="mt-2 text-muted-foreground">{error || "This stationery list is not available."}</p>
        <Button asChild className="mt-6">
          <Link href="/schools">Browse Schools</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8">
      {/* Back Link */}
      <Link
        href={`/schools/${data.school.slug}`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to {data.school.name}
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{data.grade.name} Stationery List</h1>
        <p className="text-muted-foreground">{data.school.name}</p>
      </div>

      {data.items.length === 0 ? (
        <div className="text-center py-12 bg-muted/50 rounded-lg">
          <Package className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">Coming Soon</h2>
          <p className="mt-2 text-muted-foreground">
            The stationery list for {data.grade.name} at {data.school.name} is not available yet.
          </p>
          <SchoolListWhatsAppButton
            schoolName={data.school.name}
            gradeName={data.grade.name}
            totalPrice={0}
            className="mt-4"
          />
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={selectAll}>
                Select All ({data.summary.totalItems})
              </Button>
              <Button variant="outline" size="sm" onClick={selectRequired}>
                Required Only ({data.summary.requiredCount})
              </Button>
            </div>

            {/* Required Items */}
            {data.requiredItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="default">Required</Badge>
                    {data.requiredItems.length} items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.requiredItems.map((item) => (
                    <StationeryItemRow
                      key={item.id}
                      item={item}
                      selected={selectedItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Optional Items */}
            {data.optionalItems.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge variant="secondary">Optional</Badge>
                    {data.optionalItems.length} items
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {data.optionalItems.map((item) => (
                    <StationeryItemRow
                      key={item.id}
                      item={item}
                      selected={selectedItems.has(item.id)}
                      onToggle={() => toggleItem(item.id)}
                    />
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Required items ({data.summary.requiredCount})</span>
                    <span>R{data.summary.requiredTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Optional items ({data.summary.optionalCount})</span>
                    <span>R{data.summary.optionalTotal.toFixed(2)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-medium">
                    <span>Full list total</span>
                    <span>R{data.summary.grandTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-bold mb-4">
                    <span>Selected ({selectedItems.size})</span>
                    <span>R{selectedTotal.toFixed(2)}</span>
                  </div>

                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={addSelectedToCart}
                      disabled={selectedItems.size === 0 || addingToCart}
                    >
                      {addingToCart ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <ShoppingCart className="mr-2 h-4 w-4" />
                      )}
                      Add to Cart
                    </Button>

                    <SchoolListWhatsAppButton
                      schoolName={data.school.name}
                      gradeName={data.grade.name}
                      totalPrice={selectedTotal}
                      className="w-full"
                    />
                  </div>

                  {/* PDF Download & Share Section */}
                  <div className="border-t pt-4 mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground text-center mb-3">
                      Print or share this list
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      asChild
                    >
                      <a
                        href={`/api/schools/${data.school.slug}/grades/${data.grade.slug}/pdf`}
                        download
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download PDF
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        const text = `Check out the ${data.grade.name} stationery list for ${data.school.name}!\n\nTotal: R${data.summary.grandTotal.toFixed(2)}\n\nOrder here: ${window.location.href}`
                        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`)
                      }}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share with Parents
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

function StationeryItemRow({
  item,
  selected,
  onToggle,
}: {
  item: StationeryItem
  selected: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
        selected ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
      }`}
      onClick={onToggle}
    >
      <Checkbox checked={selected} onCheckedChange={onToggle} />

      <div className="relative h-12 w-12 rounded overflow-hidden bg-muted flex-shrink-0">
        {item.productImage ? (
          <Image
            src={item.productImage}
            alt={item.productName}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.productName}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Qty: {item.quantity}</span>
          <span>×</span>
          <span>R{item.price.toFixed(2)}</span>
          {item.notes && (
            <span className="text-xs italic">({item.notes})</span>
          )}
        </div>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-medium">R{item.totalPrice.toFixed(2)}</p>
        {item.inStock ? (
          <span className="text-xs text-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" /> In Stock
          </span>
        ) : (
          <span className="text-xs text-red-500">Out of Stock</span>
        )}
      </div>
    </div>
  )
}
