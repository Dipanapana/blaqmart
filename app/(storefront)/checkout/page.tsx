"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import {
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Check,
  Loader2,
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"
import { LocationDetector } from "@/components/checkout/location-detector"
import { DeliveryZoneChecker } from "@/components/checkout/delivery-zone-checker"

const addressSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  recipientName: z.string().min(2, "Please enter recipient name"),
  streetAddress: z.string().min(5, "Please enter street address"),
  town: z.string().min(2, "Please select a town"),
  suburb: z.string().optional(), // Optional for rural areas
  city: z.string().min(2, "Please enter city"),
  postalCode: z.string().min(4, "Please enter postal code"),
  province: z.string().min(1, "Please select a province"),
  deliveryDate: z.string().min(1, "Please select a delivery date"),
  deliverySlot: z.string().min(1, "Please select a delivery time"),
  deliveryNotes: z.string().optional(),
  saveAddress: z.boolean().optional(),
  paymentMethod: z.enum(["payfast", "yoco", "cod"]),
})

type AddressForm = z.infer<typeof addressSchema>

const steps = [
  { id: 0, name: "Address", icon: MapPin },
  { id: 1, name: "Delivery", icon: Truck },
  { id: 2, name: "Payment", icon: CreditCard },
]

const deliverySlots = [
  { id: "morning", label: "Morning (09:00 - 12:00)" },
  { id: "afternoon", label: "Afternoon (12:00 - 15:00)" },
  { id: "evening", label: "Evening (15:00 - 18:00)" },
]

// Delivery areas - Northern Cape & Free State
const deliveryTowns = [
  // Local delivery (own vehicle, COD available)
  { name: "Warrenton", type: "local", codAvailable: true, deliveryFee: 0, estimatedDays: "Same day" },
  { name: "Jan Kempdorp", type: "local", codAvailable: true, deliveryFee: 0, estimatedDays: "Same day" },
  // Courier delivery (no COD)
  { name: "Hartswater", type: "courier", codAvailable: false, deliveryFee: 50, estimatedDays: "1-2 days" },
  { name: "Christiana", type: "courier", codAvailable: false, deliveryFee: 50, estimatedDays: "1-2 days" },
  { name: "Kimberley", type: "courier", codAvailable: false, deliveryFee: 75, estimatedDays: "2-3 days" },
  { name: "Douglas", type: "courier", codAvailable: false, deliveryFee: 60, estimatedDays: "2-3 days" },
  { name: "Barkly West", type: "courier", codAvailable: false, deliveryFee: 60, estimatedDays: "2-3 days" },
  { name: "Bloemhof", type: "courier", codAvailable: false, deliveryFee: 50, estimatedDays: "1-2 days" },
  { name: "Hoopstad", type: "courier", codAvailable: false, deliveryFee: 60, estimatedDays: "2-3 days" },
  { name: "Boshof", type: "courier", codAvailable: false, deliveryFee: 65, estimatedDays: "2-3 days" },
]

const provinces = [
  { value: "Northern Cape", label: "Northern Cape" },
  { value: "Free State", label: "Free State" },
  { value: "North West", label: "North West" },
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, subtotal, giftMessage, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AddressForm>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: "Northern Cape",
      city: "Warrenton",
      paymentMethod: "yoco",
    },
  })

  const selectedTown = watch("town")
  const selectedTownData = deliveryTowns.find(t => t.name === selectedTown)
  const isCodAvailable = selectedTownData?.codAvailable ?? false
  const baseDeliveryFee = selectedTownData?.deliveryFee ?? 0
  const deliveryFee = subtotal() >= 500 ? 0 : baseDeliveryFee
  const total = subtotal() + deliveryFee
  const estimatedDelivery = selectedTownData?.estimatedDays ?? ""

  // Reset payment method to yoco if COD is not available
  useEffect(() => {
    if (selectedTown && !isCodAvailable && watch("paymentMethod") === "cod") {
      setValue("paymentMethod", "yoco")
    }
  }, [selectedTown, isCodAvailable, setValue, watch])

  // Generate available dates (today + next 7 days)
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      value: date.toISOString().split("T")[0],
      label: date.toLocaleDateString("en-ZA", {
        weekday: "short",
        day: "numeric",
        month: "short",
      }),
      isToday: i === 0,
    }
  })

  // Pre-fill user data if logged in
  useEffect(() => {
    if (session?.user) {
      setValue("email", session.user.email || "")
      setValue("recipientName", session.user.name || "")
    }
  }, [session, setValue])

  const onSubmit = async (data: AddressForm) => {
    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsProcessing(true)

    try {
      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          shippingAddress: {
            recipientName: data.recipientName,
            phone: data.phone,
            streetAddress: data.streetAddress,
            suburb: data.town, // Use town as suburb for rural areas
            city: data.city,
            postalCode: data.postalCode,
            province: data.province,
          },
          deliveryDate: data.deliveryDate,
          deliverySlot: data.deliverySlot,
          deliveryNotes: data.deliveryNotes,
          giftMessage,
          guestEmail: session ? undefined : data.email,
          guestPhone: session ? undefined : data.phone,
          paymentMethod: data.paymentMethod,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to create order")
      }

      // Clear cart and redirect to payment/success
      clearCart()
      router.push(`/orders/${result.data.id}/success`)
    } catch (error) {
      console.error("Checkout error:", error)
      alert("Something went wrong. Please try again.")
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Add some products before checking out"
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => index < currentStep && setCurrentStep(step.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  currentStep >= step.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.name}</span>
              </button>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-2 h-5 w-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            {/* Step 0: Address */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!session && (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">
                        <Link
                          href="/login?callbackUrl=/checkout"
                          className="text-primary hover:underline"
                        >
                          Sign in
                        </Link>{" "}
                        for a faster checkout experience
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+27 12 345 6789"
                        {...register("phone")}
                      />
                      {errors.phone && (
                        <p className="text-sm text-destructive">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator className="my-6" />

                  <LocationDetector
                    onLocationDetected={(address) => {
                      setValue("streetAddress", address.streetAddress)
                      setValue("suburb", address.suburb)
                      setValue("city", address.city)
                      setValue("province", address.province)
                      setValue("postalCode", address.postalCode)
                    }}
                  />

                  <Separator className="my-6" />

                  <div className="space-y-2">
                    <Label htmlFor="recipientName">Recipient Name</Label>
                    <Input
                      id="recipientName"
                      placeholder="Who will receive this order?"
                      {...register("recipientName")}
                    />
                    {errors.recipientName && (
                      <p className="text-sm text-destructive">
                        {errors.recipientName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="streetAddress">Street Address</Label>
                    <Input
                      id="streetAddress"
                      placeholder="123 Main Street, Apartment 4B"
                      {...register("streetAddress")}
                    />
                    {errors.streetAddress && (
                      <p className="text-sm text-destructive">
                        {errors.streetAddress.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="town">Town</Label>
                      <Select
                        onValueChange={(value) => {
                          setValue("town", value)
                          // Auto-set city based on town
                          setValue("city", value)
                        }}
                      >
                        <SelectTrigger data-testid="town-select">
                          <SelectValue placeholder="Select your town" />
                        </SelectTrigger>
                        <SelectContent>
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                            Local Delivery (Free, COD Available)
                          </div>
                          {deliveryTowns.filter(t => t.type === "local").map((town) => (
                            <SelectItem key={town.name} value={town.name}>
                              <div className="flex items-center gap-2">
                                <span>{town.name}</span>
                                <span className="text-xs text-green-600">Free delivery</span>
                              </div>
                            </SelectItem>
                          ))}
                          <div className="px-2 py-1 text-xs font-semibold text-muted-foreground mt-2">
                            Courier Delivery
                          </div>
                          {deliveryTowns.filter(t => t.type === "courier").map((town) => (
                            <SelectItem key={town.name} value={town.name}>
                              <div className="flex items-center gap-2">
                                <span>{town.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  R{town.deliveryFee} • {town.estimatedDays}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.town && (
                        <p className="text-sm text-destructive">
                          {errors.town.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">Postal Code</Label>
                      <Input
                        id="postalCode"
                        placeholder="8530"
                        {...register("postalCode")}
                      />
                      {errors.postalCode && (
                        <p className="text-sm text-destructive">
                          {errors.postalCode.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Delivery info based on town */}
                  {selectedTownData && (
                    <div className={`rounded-lg p-4 ${selectedTownData.type === 'local' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                      <div className="flex items-center gap-2">
                        <Truck className={`h-5 w-5 ${selectedTownData.type === 'local' ? 'text-green-600' : 'text-blue-600'}`} />
                        <div>
                          <p className="font-medium">
                            {selectedTownData.type === 'local' ? 'Local Delivery' : 'Courier Delivery'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {selectedTownData.estimatedDays} •{' '}
                            {deliveryFee === 0 ? (
                              <span className="text-green-600 font-medium">Free delivery</span>
                            ) : (
                              `R${deliveryFee} delivery fee`
                            )}
                            {selectedTownData.codAvailable && (
                              <span className="ml-2 text-green-600">• Cash on Delivery available</span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">City/Town</Label>
                      <Input
                        id="city"
                        defaultValue="Warrenton"
                        {...register("city")}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="province">Province</Label>
                      <Select
                        defaultValue="Northern Cape"
                        onValueChange={(value) => setValue("province", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select province" />
                        </SelectTrigger>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province.value} value={province.value}>
                              {province.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {session && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saveAddress"
                        {...register("saveAddress")}
                      />
                      <Label htmlFor="saveAddress" className="text-sm">
                        Save this address for future orders
                      </Label>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Step 1: Delivery */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Delivery Options</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label>Delivery Date</Label>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-7">
                      {availableDates.map((date) => (
                        <button
                          key={date.value}
                          type="button"
                          onClick={() => setValue("deliveryDate", date.value)}
                          className={`rounded-lg border p-3 text-center transition-colors ${
                            watch("deliveryDate") === date.value
                              ? "border-primary bg-primary/10"
                              : "hover:border-primary"
                          }`}
                        >
                          <p className="text-xs text-muted-foreground">
                            {date.isToday ? "Today" : date.label.split(" ")[0]}
                          </p>
                          <p className="font-semibold">
                            {date.label.split(" ")[1]}
                          </p>
                          <p className="text-xs">
                            {date.label.split(" ")[2]}
                          </p>
                        </button>
                      ))}
                    </div>
                    {errors.deliveryDate && (
                      <p className="text-sm text-destructive">
                        {errors.deliveryDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Delivery Time</Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {deliverySlots.map((slot) => (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setValue("deliverySlot", slot.id)}
                          className={`rounded-lg border p-4 text-left transition-colors ${
                            watch("deliverySlot") === slot.id
                              ? "border-primary bg-primary/10"
                              : "hover:border-primary"
                          }`}
                        >
                          <p className="font-medium">{slot.label}</p>
                        </button>
                      ))}
                    </div>
                    {errors.deliverySlot && (
                      <p className="text-sm text-destructive">
                        {errors.deliverySlot.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryNotes">
                      Delivery Notes (Optional)
                    </Label>
                    <Textarea
                      id="deliveryNotes"
                      placeholder="Gate code, building instructions, etc."
                      {...register("deliveryNotes")}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Payment */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Review & Pay</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Method Selection */}
                  <div className="space-y-3">
                    <h3 className="font-medium">Payment Method</h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {/* Yoco (Recommended) */}
                      <button
                        type="button"
                        data-testid="payment-yoco"
                        onClick={() => setValue("paymentMethod", "yoco")}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          watch("paymentMethod") === "yoco"
                            ? "border-primary bg-primary/10 ring-2 ring-primary"
                            : "hover:border-primary"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">
                              Card / EFT
                              <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                                Recommended
                              </span>
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Pay securely with Yoco
                            </p>
                          </div>
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </button>

                      {/* PayFast */}
                      <button
                        type="button"
                        data-testid="payment-payfast"
                        onClick={() => setValue("paymentMethod", "payfast")}
                        className={`rounded-lg border p-4 text-left transition-colors ${
                          watch("paymentMethod") === "payfast"
                            ? "border-primary bg-primary/10 ring-2 ring-primary"
                            : "hover:border-primary"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">PayFast</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Card, EFT, or Instant EFT
                            </p>
                          </div>
                          <CreditCard className="h-5 w-5 text-muted-foreground" />
                        </div>
                      </button>

                      {/* COD - Only for local delivery */}
                      {isCodAvailable ? (
                        <button
                          type="button"
                          data-testid="payment-cod"
                          onClick={() => setValue("paymentMethod", "cod")}
                          className={`rounded-lg border p-4 text-left transition-colors ${
                            watch("paymentMethod") === "cod"
                              ? "border-primary bg-primary/10 ring-2 ring-primary"
                              : "hover:border-primary"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-medium">Cash on Delivery</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Pay when you receive your order
                              </p>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                          </div>
                        </button>
                      ) : (
                        <div className="rounded-lg border border-dashed p-4 bg-muted/50">
                          <div className="flex items-start justify-between opacity-50">
                            <div>
                              <p className="font-medium">Cash on Delivery</p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                Only available for Warrenton & Jan Kempdorp
                              </p>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 text-muted-foreground"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <rect x="2" y="5" width="20" height="14" rx="2" />
                              <line x1="2" y1="10" x2="22" y2="10" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Order Summary */}
                  <div className="space-y-4">
                    <h3 className="font-medium">Order Items</h3>
                    {items.map((item) => (
                      <div key={item.id} className="flex gap-4">
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
                        <div className="flex flex-1 justify-between">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Delivery Info */}
                  <div className="space-y-2">
                    <h3 className="font-medium">Delivery To</h3>
                    <p className="text-sm text-muted-foreground">
                      {watch("recipientName")}
                      <br />
                      {watch("streetAddress")}
                      <br />
                      {watch("town")}, {watch("province")} {watch("postalCode")}
                    </p>
                    {estimatedDelivery && (
                      <p className="text-sm text-primary font-medium">
                        Estimated delivery: {estimatedDelivery}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Terms */}
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="mt-6 flex justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button type="submit" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === 2 ? (
                  "Place Order"
                ) : (
                  "Continue"
                )}
              </Button>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-64 space-y-3 overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>
                        {item.quantity}× {item.name}
                      </span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatPrice(subtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span>
                      {deliveryFee === 0 ? (
                        <span className="text-success">Free</span>
                      ) : (
                        formatPrice(deliveryFee)
                      )}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>

                {giftMessage && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-medium">Gift Message:</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {giftMessage}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}
