"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
  Gift,
  Plus,
  Minus,
  Check,
  ChevronRight,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useHamper } from "@/hooks/use-hamper"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"

const steps = [
  { id: 0, name: "Start", description: "Choose a starting point" },
  { id: 1, name: "Add Items", description: "Select products for your hamper" },
  { id: 2, name: "Message", description: "Add a personal message" },
  { id: 3, name: "Review", description: "Review and add to cart" },
]

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: { name: string; slug: string }
}

interface HamperPreset {
  id: string
  name: string
  description: string
  price: number
  image: string | null
  items: { product: Product; quantity: number }[]
}

function HamperBuilderContent() {
  const searchParams = useSearchParams()
  const presetSlug = searchParams.get("preset")

  const {
    items,
    giftMessage,
    recipientName,
    currentStep,
    setCurrentStep,
    addItem,
    removeItem,
    updateQuantity,
    setGiftMessage,
    setRecipientName,
    clearHamper,
    total,
    itemCount,
    getItem,
  } = useHamper()

  const { addItem: addToCart } = useCart()

  const [products, setProducts] = useState<Product[]>([])
  const [presets, setPresets] = useState<HamperPreset[]>([])
  const [categories, setCategories] = useState<{ name: string; slug: string }[]>(
    []
  )
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [productsRes, presetsRes] = await Promise.all([
          fetch("/api/products?limit=100"),
          fetch("/api/hampers"),
        ])

        const productsData = await productsRes.json()
        const presetsData = await presetsRes.json()

        setProducts(productsData.data || [])
        setPresets(presetsData.data || [])

        // Extract unique categories
        const categoryMap = new Map(
          (productsData.data || []).map((p: Product) => [
            p.category.slug,
            p.category,
          ])
        )
        const uniqueCategories = Array.from(categoryMap.values())
        setCategories(uniqueCategories as { name: string; slug: string }[])

        // Check if preset is requested
        if (presetSlug && presetsData.data) {
          const preset = presetsData.data.find(
            (p: HamperPreset) => p.id === presetSlug
          )
          if (preset) {
            clearHamper()
            preset.items.forEach(
              (item: { product: Product; quantity: number }) => {
                for (let i = 0; i < item.quantity; i++) {
                  addItem({
                    productId: item.product.id,
                    name: item.product.name,
                    price: item.product.price,
                    image: item.product.images[0] || "",
                  })
                }
              }
            )
            setCurrentStep(1)
          }
        }
      } catch (error) {
        console.error("Failed to fetch data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [presetSlug])

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category.slug === selectedCategory)

  const handleAddToCart = () => {
    items.forEach((item) => {
      for (let i = 0; i < item.quantity; i++) {
        addToCart({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image,
          stock: 100, // Assume sufficient stock for hamper items
        })
      }
    })
    clearHamper()
    // Redirect to cart
    window.location.href = "/cart"
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return true
      case 1:
        return items.length > 0
      case 2:
        return true
      case 3:
        return items.length > 0
      default:
        return false
    }
  }

  return (
    <>
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => index <= currentStep && setCurrentStep(step.id)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id + 1
                )}
              </button>
              <span
                className={`ml-2 hidden text-sm md:block ${
                  currentStep >= step.id
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {step.name}
              </span>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-2 h-5 w-5 text-muted-foreground md:mx-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 0: Start */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>How would you like to start?</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <button
                    onClick={() => {
                      clearHamper()
                      setCurrentStep(1)
                    }}
                    className="flex flex-col items-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-muted"
                  >
                    <Gift className="mb-4 h-12 w-12 text-primary" />
                    <h3 className="font-semibold">Start Fresh</h3>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      Build your hamper from scratch
                    </p>
                  </button>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex flex-col items-center rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary hover:bg-muted"
                  >
                    <ShoppingBag className="mb-4 h-12 w-12 text-accent" />
                    <h3 className="font-semibold">Use a Preset</h3>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                      Start with a curated hamper
                    </p>
                  </button>
                </CardContent>
              </Card>

              {/* Preset Options */}
              {presets.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-semibold">
                    Or choose a preset hamper
                  </h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {presets.map((preset) => (
                      <Card key={preset.id} className="overflow-hidden">
                        <div className="relative aspect-video bg-muted">
                          {preset.image ? (
                            <Image
                              src={preset.image}
                              alt={preset.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Gift className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold">{preset.name}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {preset.items.length} items
                          </p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="font-bold">
                              {formatPrice(preset.price)}
                            </span>
                            <Button
                              size="sm"
                              onClick={() => {
                                clearHamper()
                                preset.items.forEach((item) => {
                                  for (let i = 0; i < item.quantity; i++) {
                                    addItem({
                                      productId: item.product.id,
                                      name: item.product.name,
                                      price: Number(item.product.price),
                                      image: item.product.images[0] || "",
                                    })
                                  }
                                })
                                setCurrentStep(1)
                              }}
                            >
                              Use This
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Add Items */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Select Products</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Category Tabs */}
                <Tabs
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <TabsList className="mb-4 flex-wrap">
                    <TabsTrigger value="all">All</TabsTrigger>
                    {categories.map((cat) => (
                      <TabsTrigger key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                {/* Products Grid */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {filteredProducts.map((product) => {
                    const hamperItem = getItem(product.id)
                    return (
                      <div
                        key={product.id}
                        className={`relative rounded-lg border p-3 transition-colors ${
                          hamperItem ? "border-primary bg-primary/5" : ""
                        }`}
                      >
                        <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <h4 className="mt-2 line-clamp-1 text-sm font-medium">
                          {product.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>

                        {/* Quantity Controls */}
                        <div className="mt-2 flex items-center justify-between">
                          {hamperItem ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    hamperItem.quantity - 1
                                  )
                                }
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-6 text-center text-sm">
                                {hamperItem.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7"
                                onClick={() =>
                                  updateQuantity(
                                    product.id,
                                    hamperItem.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                addItem({
                                  productId: product.id,
                                  name: product.name,
                                  price: product.price,
                                  image: product.images[0] || "",
                                })
                              }
                            >
                              <Plus className="mr-1 h-3 w-3" />
                              Add
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Gift Message */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Add a Personal Message</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="recipientName">Recipient Name</Label>
                  <Input
                    id="recipientName"
                    placeholder="Who is this hamper for?"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                  <Textarea
                    id="giftMessage"
                    placeholder="Write a personal message..."
                    value={giftMessage}
                    onChange={(e) => setGiftMessage(e.target.value)}
                    className="mt-2"
                    rows={4}
                    maxLength={200}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    {giftMessage.length}/200 characters
                  </p>
                </div>

                {/* Message Preview */}
                {(recipientName || giftMessage) && (
                  <div className="rounded-lg border bg-muted/50 p-4">
                    <h4 className="mb-2 text-sm font-medium">Preview</h4>
                    <div className="rounded-md bg-white p-4 shadow-sm">
                      {recipientName && (
                        <p className="font-medium">To: {recipientName}</p>
                      )}
                      {giftMessage && (
                        <p className="mt-2 text-muted-foreground">
                          {giftMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Hamper</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.productId} className="flex gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                      <span className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}

                {(recipientName || giftMessage) && (
                  <>
                    <Separator />
                    <div className="rounded-lg bg-muted p-4">
                      <h4 className="mb-2 text-sm font-medium">Gift Message</h4>
                      {recipientName && <p>To: {recipientName}</p>}
                      {giftMessage && (
                        <p className="mt-1 text-muted-foreground">
                          {giftMessage}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* Navigation Buttons */}
          <div className="mt-6 flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {currentStep < 3 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed()}
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleAddToCart} disabled={items.length === 0}>
                Add Hamper to Cart
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Summary Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Your Hamper
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground">
                  No items added yet
                </p>
              ) : (
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold">
                    <span>Total ({itemCount()} items)</span>
                    <span>{formatPrice(total())}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}

function HamperBuilderFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )
}

export default function HamperBuilderPage() {
  return (
    <div className="container py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">Build Your Own Hamper</h1>
        <p className="mt-2 text-muted-foreground">
          Create a personalized gift hamper for someone special
        </p>
      </div>

      <Suspense fallback={<HamperBuilderFallback />}>
        <HamperBuilderContent />
      </Suspense>
    </div>
  )
}
