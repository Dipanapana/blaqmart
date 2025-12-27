"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronRight,
  MapPin,
  Truck,
  CreditCard,
  ShoppingBag,
  Check,
  Loader2,
  School,
  Home,
  User,
  Phone,
  GraduationCap,
  Sparkles,
  Gift,
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
import { fadeInUp, staggerContainer, springConfig } from "@/lib/animations"
import { StickyCheckoutSummary } from "@/components/checkout/sticky-checkout-summary"

// School type for API response
interface SchoolData {
  id: string
  name: string
  slug: string
  town: string
  address?: string
  logo?: string
  isPartner: boolean
}

// Form schema with conditional validation
const checkoutSchema = z.object({
  // Delivery method
  deliveryMethod: z.enum(["home", "school"]),

  // Contact info (always required)
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid phone number"),

  // School collection fields
  schoolId: z.string().optional(),
  collectorName: z.string().optional(),
  collectorPhone: z.string().optional(),
  childName: z.string().optional(),
  childGrade: z.string().optional(),

  // Home delivery fields
  recipientName: z.string().optional(),
  streetAddress: z.string().optional(),
  town: z.string().optional(),
  suburb: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  province: z.string().optional(),

  // Delivery options
  deliveryDate: z.string().optional(),
  deliverySlot: z.string().optional(),
  deliveryNotes: z.string().optional(),
  saveAddress: z.boolean().optional(),

  // Payment
  paymentMethod: z.enum(["payfast", "yoco", "cod"]),

  // Terms acceptance (required on final step)
  termsAccepted: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.deliveryMethod === "school") {
    if (!data.schoolId) {
      ctx.addIssue({ code: "custom", message: "Please select a school", path: ["schoolId"] })
    }
    if (!data.collectorName || data.collectorName.length < 2) {
      ctx.addIssue({ code: "custom", message: "Please enter collector name", path: ["collectorName"] })
    }
    if (!data.collectorPhone || data.collectorPhone.length < 10) {
      ctx.addIssue({ code: "custom", message: "Please enter collector phone", path: ["collectorPhone"] })
    }
  } else {
    if (!data.recipientName || data.recipientName.length < 2) {
      ctx.addIssue({ code: "custom", message: "Please enter recipient name", path: ["recipientName"] })
    }
    if (!data.streetAddress || data.streetAddress.length < 5) {
      ctx.addIssue({ code: "custom", message: "Please enter street address", path: ["streetAddress"] })
    }
    if (!data.town || data.town.length < 2) {
      ctx.addIssue({ code: "custom", message: "Please select a town", path: ["town"] })
    }
    if (!data.deliveryDate) {
      ctx.addIssue({ code: "custom", message: "Please select a delivery date", path: ["deliveryDate"] })
    }
    if (!data.deliverySlot) {
      ctx.addIssue({ code: "custom", message: "Please select a delivery time", path: ["deliverySlot"] })
    }
  }
})

type CheckoutForm = z.infer<typeof checkoutSchema>

const steps = [
  { id: 0, name: "Method", icon: Truck },
  { id: 1, name: "Details", icon: MapPin },
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

const grades = [
  "Grade R", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
  "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"
]

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, subtotal, giftMessage, clearCart } = useCart()
  const [currentStep, setCurrentStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [schools, setSchools] = useState<SchoolData[]>([])
  const [loadingSchools, setLoadingSchools] = useState(true)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      deliveryMethod: "home",
      province: "Northern Cape",
      city: "Warrenton",
      paymentMethod: "yoco",
    },
  })

  const deliveryMethod = watch("deliveryMethod")
  const selectedTown = watch("town")
  const selectedSchoolId = watch("schoolId")
  const selectedTownData = deliveryTowns.find(t => t.name === selectedTown)
  const selectedSchool = schools.find(s => s.id === selectedSchoolId)

  // COD only available for home delivery to local areas
  const isCodAvailable = deliveryMethod === "home" && (selectedTownData?.codAvailable ?? false)
  const baseDeliveryFee = deliveryMethod === "school" ? 0 : (selectedTownData?.deliveryFee ?? 0)
  const deliveryFee = subtotal() >= 500 ? 0 : baseDeliveryFee
  const total = subtotal() + deliveryFee
  const estimatedDelivery = deliveryMethod === "school"
    ? "1-2 school days"
    : (selectedTownData?.estimatedDays ?? "")

  // Fetch partner schools
  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await fetch('/api/schools?partners=true')
        const data = await res.json()
        if (data.success) {
          setSchools(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch schools:', error)
      } finally {
        setLoadingSchools(false)
      }
    }
    fetchSchools()
  }, [])

  // Reset payment method to yoco if COD is not available
  useEffect(() => {
    if (!isCodAvailable && watch("paymentMethod") === "cod") {
      setValue("paymentMethod", "yoco")
    }
  }, [deliveryMethod, selectedTown, isCodAvailable, setValue, watch])

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

  // Pre-fill user data if logged in + smart defaults
  useEffect(() => {
    if (session?.user) {
      setValue("email", session.user.email || "")
      setValue("recipientName", session.user.name || "")
      setValue("collectorName", session.user.name || "")
    }

    // Smart defaults for faster checkout
    // Default town to Warrenton (most common)
    if (!watch("town")) {
      setValue("town", "Warrenton")
      setValue("city", "Warrenton")
    }

    // Default to today + morning slot for quick checkout
    if (!watch("deliveryDate") && availableDates.length > 0) {
      setValue("deliveryDate", availableDates[0].value)
    }
    if (!watch("deliverySlot")) {
      setValue("deliverySlot", "morning")
    }
  }, [session, setValue, watch, availableDates])

  const handleStepChange = async (nextStep: number) => {
    // Validate current step before proceeding
    if (nextStep > currentStep) {
      const isValid = await trigger()
      if (!isValid) return
    }
    setCurrentStep(nextStep)
  }

  // Get fields to validate for each step
  const getStepFields = (step: number): (keyof CheckoutForm)[] => {
    if (step === 0) {
      return ["deliveryMethod", "email", "phone"]
    }
    if (step === 1) {
      if (deliveryMethod === "school") {
        return ["schoolId", "collectorName", "collectorPhone"]
      }
      return ["recipientName", "streetAddress", "town", "deliveryDate", "deliverySlot"]
    }
    return ["paymentMethod", "termsAccepted"]
  }

  // Handle continue button with step-specific validation
  const handleContinue = async () => {
    const fieldsToValidate = getStepFields(currentStep)
    const isValid = await trigger(fieldsToValidate)

    if (!isValid) {
      // Scroll to first error on mobile
      setTimeout(() => {
        const firstError = document.querySelector('[class*="text-destructive"]')
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
      return
    }

    if (currentStep < 2) {
      setCurrentStep(currentStep + 1)
      // Scroll to top on step change
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      // Final step - check terms acceptance and submit
      const termsAccepted = watch("termsAccepted")
      if (!termsAccepted) {
        // Show error for terms - scroll to checkbox
        const termsElement = document.getElementById('terms')
        if (termsElement) {
          termsElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
          termsElement.focus()
        }
        // Show alert for mobile users
        alert("Please accept the Terms & Conditions to place your order")
        return
      }
      // Submit the form
      handleSubmit(onSubmit)()
    }
  }

  const onSubmit = async (data: CheckoutForm) => {

    setIsProcessing(true)

    try {
      const isSchoolCollection = data.deliveryMethod === "school"

      // Create order
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
          deliveryMethod: data.deliveryMethod,
          // School collection fields
          schoolId: isSchoolCollection ? data.schoolId : undefined,
          collectorName: isSchoolCollection ? data.collectorName : undefined,
          collectorPhone: isSchoolCollection ? data.collectorPhone : undefined,
          childName: isSchoolCollection ? data.childName : undefined,
          childGrade: isSchoolCollection ? data.childGrade : undefined,
          // Home delivery fields
          shippingAddress: isSchoolCollection ? undefined : {
            recipientName: data.recipientName,
            phone: data.phone,
            streetAddress: data.streetAddress,
            suburb: data.town,
            city: data.city || data.town,
            postalCode: data.postalCode || "0000",
            province: data.province || "Northern Cape",
          },
          deliveryDate: isSchoolCollection ? undefined : data.deliveryDate,
          deliverySlot: isSchoolCollection ? undefined : data.deliverySlot,
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

      // Clear cart
      clearCart()

      // Redirect to Yoco payment page if available, otherwise go to success
      if (result.data.paymentRedirectUrl) {
        // Redirect to Yoco hosted checkout
        window.location.href = result.data.paymentRedirectUrl
      } else if (result.data.paymentMethod === "cod") {
        // COD orders go directly to success
        router.push(`/orders/${result.data.id}/success`)
      } else {
        // Fallback to success page
        router.push(`/orders/${result.data.id}/success`)
      }
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
    <div className="container px-4 sm:px-6 py-6 sm:py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 text-3xl font-bold"
      >
        Checkout
      </motion.h1>

      {/* Progress Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => index < currentStep && setCurrentStep(step.id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ${currentStep >= step.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground"
                  }`}
              >
                {currentStep > step.id ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={springConfig.bouncy}
                  >
                    <Check className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{step.name}</span>
              </motion.button>
              {index < steps.length - 1 && (
                <ChevronRight className="mx-2 h-5 w-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </motion.div>

      <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 0: Delivery Method */}
              {currentStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springConfig.gentle}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                      <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-primary" />
                        How would you like to receive your order?
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                      {/* Delivery Method Selection */}
                      <div className="grid gap-4 sm:grid-cols-2">
                        {/* Home Delivery */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setValue("deliveryMethod", "home")}
                          className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${deliveryMethod === "home"
                              ? "border-primary bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg shadow-primary/10"
                              : "border-gray-200 hover:border-primary/40 hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`rounded-xl p-3 ${deliveryMethod === "home"
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-500"
                              }`}>
                              <Home className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg">Home Delivery</h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                We deliver to your door in Warrenton, Jan Kempdorp & surrounding areas
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                  <Check className="h-3 w-3" /> COD Available
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                                  Same Day Delivery
                                </span>
                              </div>
                            </div>
                          </div>
                          {deliveryMethod === "home" && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 rounded-full bg-primary p-1.5 text-white shadow-lg"
                            >
                              <Check className="h-4 w-4" />
                            </motion.div>
                          )}
                        </motion.button>

                        {/* School Collection */}
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.02, y: -4 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setValue("deliveryMethod", "school")}
                          className={`relative rounded-2xl border-2 p-6 text-left transition-all duration-300 ${deliveryMethod === "school"
                              ? "border-accent bg-gradient-to-br from-accent/5 to-accent/10 shadow-lg shadow-accent/10"
                              : "border-gray-200 hover:border-accent/40 hover:bg-gray-50"
                            }`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`rounded-xl p-3 ${deliveryMethod === "school"
                                ? "bg-accent text-white"
                                : "bg-gray-100 text-gray-500"
                              }`}>
                              <School className="h-6 w-6" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg flex items-center gap-2">
                                Collect at School
                                <span className="inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 px-2 py-0.5 text-[10px] font-bold text-amber-900">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  NEW
                                </span>
                              </h3>
                              <p className="text-sm text-muted-foreground mt-1">
                                We deliver to your child&apos;s school for easy collection
                              </p>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                                  <Check className="h-3 w-3" /> Free Delivery
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                                  Partner Schools
                                </span>
                              </div>
                            </div>
                          </div>
                          {deliveryMethod === "school" && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="absolute -top-2 -right-2 rounded-full bg-accent p-1.5 text-white shadow-lg"
                            >
                              <Check className="h-4 w-4" />
                            </motion.div>
                          )}
                        </motion.button>
                      </div>

                      <Separator />

                      {/* Contact Info (always required) */}
                      <div className="space-y-4">
                        <h3 className="font-medium flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          Contact Information
                        </h3>
                        {!session && (
                          <div className="rounded-lg bg-muted p-4">
                            <p className="text-sm text-muted-foreground">
                              <Link
                                href="/login?callbackUrl=/checkout"
                                className="text-primary hover:underline font-medium"
                              >
                                Sign in
                              </Link>{" "}
                              for a faster checkout experience
                            </p>
                          </div>
                        )}
                        <div className="grid gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              inputMode="email"
                              autoComplete="email"
                              autoCapitalize="none"
                              placeholder="you@example.com"
                              className="h-12 text-base"
                              {...register("email")}
                            />
                            {errors.email && (
                              <p className="text-sm text-destructive">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                            <Input
                              id="phone"
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="079 123 4567"
                              className="h-12 text-base"
                              {...register("phone")}
                            />
                            {errors.phone && (
                              <p className="text-sm text-destructive">
                                {errors.phone.message}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 1: Details */}
              {currentStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springConfig.gentle}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                      <CardTitle className="flex items-center gap-2">
                        {deliveryMethod === "school" ? (
                          <>
                            <School className="h-5 w-5 text-accent" />
                            School Collection Details
                          </>
                        ) : (
                          <>
                            <MapPin className="h-5 w-5 text-primary" />
                            Delivery Details
                          </>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                      {deliveryMethod === "school" ? (
                        // School Collection Form
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-6"
                        >
                          {/* School Selector */}
                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="schoolId" className="flex items-center gap-2">
                              <School className="h-4 w-4 text-accent" />
                              Select School
                            </Label>
                            {loadingSchools ? (
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading schools...
                              </div>
                            ) : schools.length === 0 ? (
                              <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
                                <p className="text-sm text-amber-800">
                                  No partner schools available yet. Please choose home delivery.
                                </p>
                              </div>
                            ) : (
                              <Select
                                onValueChange={(value) => setValue("schoolId", value)}
                                value={selectedSchoolId}
                              >
                                <SelectTrigger className="h-12">
                                  <SelectValue placeholder="Choose your child's school" />
                                </SelectTrigger>
                                <SelectContent>
                                  {schools.map((school) => (
                                    <SelectItem key={school.id} value={school.id}>
                                      <div className="flex items-center gap-2">
                                        <School className="h-4 w-4 text-accent" />
                                        <span>{school.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                          ({school.town})
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {errors.schoolId && (
                              <p className="text-sm text-destructive">
                                {errors.schoolId.message}
                              </p>
                            )}
                          </motion.div>

                          {/* School Info */}
                          {selectedSchool && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="rounded-xl bg-gradient-to-r from-accent/10 to-accent/5 p-4 border border-accent/20"
                            >
                              <div className="flex items-start gap-3">
                                <div className="rounded-lg bg-accent/20 p-2">
                                  <School className="h-5 w-5 text-accent" />
                                </div>
                                <div>
                                  <p className="font-medium">{selectedSchool.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {selectedSchool.address || selectedSchool.town}
                                  </p>
                                  <p className="text-sm text-accent font-medium mt-1">
                                    Estimated delivery: 1-2 school days
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <Separator />

                          {/* Collector Details */}
                          <motion.div variants={fadeInUp} className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2">
                              <User className="h-4 w-4 text-accent" />
                              Who will collect?
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="collectorName" className="text-sm font-medium">Collector Name</Label>
                                <Input
                                  id="collectorName"
                                  placeholder="Parent or child's name"
                                  autoComplete="name"
                                  {...register("collectorName")}
                                  className="h-12 text-base"
                                />
                                {errors.collectorName && (
                                  <p className="text-sm text-destructive">
                                    {errors.collectorName.message}
                                  </p>
                                )}
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="collectorPhone" className="text-sm font-medium">Collector Phone</Label>
                                <Input
                                  id="collectorPhone"
                                  type="tel"
                                  inputMode="tel"
                                  autoComplete="tel"
                                  placeholder="079 123 4567"
                                  {...register("collectorPhone")}
                                  className="h-12 text-base"
                                />
                                {errors.collectorPhone && (
                                  <p className="text-sm text-destructive">
                                    {errors.collectorPhone.message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </motion.div>

                          {/* Optional Child Info */}
                          <motion.div variants={fadeInUp} className="space-y-4">
                            <h3 className="font-medium flex items-center gap-2 text-muted-foreground">
                              <GraduationCap className="h-4 w-4" />
                              Child&apos;s Details (Optional)
                            </h3>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="childName" className="text-sm font-medium">Child&apos;s Name</Label>
                                <Input
                                  id="childName"
                                  placeholder="Child's full name"
                                  {...register("childName")}
                                  className="h-12 text-base"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="childGrade" className="text-sm font-medium">Child&apos;s Grade</Label>
                                <Select onValueChange={(value) => setValue("childGrade", value)}>
                                  <SelectTrigger className="h-12 text-base">
                                    <SelectValue placeholder="Select grade" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {grades.map((grade) => (
                                      <SelectItem key={grade} value={grade}>
                                        {grade}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </motion.div>

                          {/* Delivery Notes */}
                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="deliveryNotes">
                              Additional Notes (Optional)
                            </Label>
                            <Textarea
                              id="deliveryNotes"
                              placeholder="Any special instructions for collection..."
                              {...register("deliveryNotes")}
                              rows={3}
                            />
                          </motion.div>
                        </motion.div>
                      ) : (
                        // Home Delivery Form
                        <motion.div
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="space-y-6"
                        >
                          <motion.div variants={fadeInUp}>
                            <LocationDetector
                              onLocationDetected={(address) => {
                                setValue("streetAddress", address.streetAddress)
                                setValue("suburb", address.suburb)
                                setValue("city", address.city)
                                setValue("province", address.province)
                                setValue("postalCode", address.postalCode)
                              }}
                            />
                          </motion.div>

                          <Separator />

                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="recipientName" className="text-sm font-medium">Recipient Name</Label>
                            <Input
                              id="recipientName"
                              placeholder="Who will receive this order?"
                              autoComplete="name"
                              {...register("recipientName")}
                              className="h-12 text-base"
                            />
                            {errors.recipientName && (
                              <p className="text-sm text-destructive">
                                {errors.recipientName.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="streetAddress" className="text-sm font-medium">Street Address</Label>
                            <Input
                              id="streetAddress"
                              placeholder="123 Main Street, Apartment 4B"
                              autoComplete="street-address"
                              {...register("streetAddress")}
                              className="h-12 text-base"
                            />
                            {errors.streetAddress && (
                              <p className="text-sm text-destructive">
                                {errors.streetAddress.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div variants={fadeInUp} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="town" className="text-sm font-medium">Delivery Town</Label>
                              <Select
                                onValueChange={(value) => {
                                  setValue("town", value)
                                  setValue("city", value)
                                }}
                              >
                                <SelectTrigger data-testid="town-select" className="h-12 text-base">
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
                                        <span className="text-xs text-green-600">Free</span>
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
                                          R{town.deliveryFee}
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
                              <Label htmlFor="postalCode" className="text-sm font-medium">Postal Code (Optional)</Label>
                              <Input
                                id="postalCode"
                                placeholder="8530"
                                inputMode="numeric"
                                autoComplete="postal-code"
                                {...register("postalCode")}
                                className="h-12 text-base"
                              />
                            </div>
                          </motion.div>

                          {/* Delivery info based on town */}
                          {selectedTownData && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`rounded-xl p-4 ${selectedTownData.type === 'local'
                                  ? 'bg-green-50 border border-green-200'
                                  : 'bg-blue-50 border border-blue-200'
                                }`}
                            >
                              <div className="flex items-center gap-3">
                                <Truck className={`h-5 w-5 ${selectedTownData.type === 'local' ? 'text-green-600' : 'text-blue-600'
                                  }`} />
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
                                      <span className="ml-2 text-green-600">• COD available</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                            </motion.div>
                          )}

                          <motion.div variants={fadeInUp} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="city" className="text-sm font-medium">City/Town (Optional)</Label>
                              <Input
                                id="city"
                                autoComplete="address-level2"
                                {...register("city")}
                                className="h-12 text-base"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="province" className="text-sm font-medium">Province</Label>
                              <Select
                                defaultValue="Northern Cape"
                                onValueChange={(value) => setValue("province", value)}
                              >
                                <SelectTrigger className="h-12 text-base">
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
                          </motion.div>

                          <Separator />

                          {/* Delivery Date & Time */}
                          <motion.div variants={fadeInUp} className="space-y-4">
                            <Label>Delivery Date</Label>
                            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x no-scrollbar md:mx-0 md:px-0 md:grid md:grid-cols-7 md:gap-2 md:overflow-visible">
                              {availableDates.map((date) => (
                                <motion.button
                                  key={date.value}
                                  type="button"
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setValue("deliveryDate", date.value)}
                                  className={`snap-start flex-shrink-0 w-20 md:w-auto rounded-xl border-2 p-3 text-center transition-all active:scale-95 ${watch("deliveryDate") === date.value
                                      ? "border-primary bg-primary/10 shadow-md"
                                      : "border-gray-200 active:border-primary/40"
                                    }`}
                                >
                                  <p className="text-xs text-muted-foreground">
                                    {date.isToday ? "Today" : date.label.split(" ")[0]}
                                  </p>
                                  <p className="text-xl md:text-base font-bold">
                                    {date.label.split(" ")[1]}
                                  </p>
                                  <p className="text-xs">
                                    {date.label.split(" ")[2]}
                                  </p>
                                </motion.button>
                              ))}
                            </div>
                            {errors.deliveryDate && (
                              <p className="text-sm text-destructive">
                                {errors.deliveryDate.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div variants={fadeInUp} className="space-y-4">
                            <Label>Delivery Time</Label>
                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar sm:mx-0 sm:px-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:overflow-visible">
                              {deliverySlots.map((slot) => (
                                <motion.button
                                  key={slot.id}
                                  type="button"
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => setValue("deliverySlot", slot.id)}
                                  className={`flex-shrink-0 whitespace-nowrap rounded-full sm:rounded-xl border-2 px-5 py-3 sm:p-4 text-sm sm:text-base font-medium transition-all active:scale-95 ${watch("deliverySlot") === slot.id
                                      ? "border-primary bg-primary text-primary-foreground shadow-md"
                                      : "border-gray-200 active:border-primary/40"
                                    }`}
                                >
                                  <span className="sm:hidden">{slot.label.split(" ")[0]}</span>
                                  <span className="hidden sm:inline">{slot.label}</span>
                                </motion.button>
                              ))}
                            </div>
                            {watch("deliverySlot") && (
                              <p className="text-sm text-muted-foreground sm:hidden">
                                {deliverySlots.find(s => s.id === watch("deliverySlot"))?.label}
                              </p>
                            )}
                            {errors.deliverySlot && (
                              <p className="text-sm text-destructive">
                                {errors.deliverySlot.message}
                              </p>
                            )}
                          </motion.div>

                          <motion.div variants={fadeInUp} className="space-y-2">
                            <Label htmlFor="deliveryNotes">
                              Delivery Notes (Optional)
                            </Label>
                            <Textarea
                              id="deliveryNotes"
                              placeholder="Gate code, building instructions, etc."
                              {...register("deliveryNotes")}
                              rows={3}
                            />
                          </motion.div>

                          {session && (
                            <motion.div variants={fadeInUp} className="flex items-center space-x-2">
                              <Checkbox
                                id="saveAddress"
                                {...register("saveAddress")}
                              />
                              <Label htmlFor="saveAddress" className="text-sm">
                                Save this address for future orders
                              </Label>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Step 2: Payment */}
              {currentStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={springConfig.gentle}
                >
                  <Card className="overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Review & Pay
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-5 sm:space-y-6">
                      {/* Payment Method Selection */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Payment Method</h3>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {/* Yoco (Recommended) */}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            data-testid="payment-yoco"
                            onClick={() => setValue("paymentMethod", "yoco")}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${watch("paymentMethod") === "yoco"
                                ? "border-primary bg-primary/5 shadow-lg"
                                : "border-gray-200 hover:border-primary/40"
                              }`}
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium flex items-center gap-2">
                                  Card / EFT
                                  <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                    Recommended
                                  </span>
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Pay securely with Yoco
                                </p>
                              </div>
                              <CreditCard className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </motion.button>

                          {/* PayFast */}
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            data-testid="payment-payfast"
                            onClick={() => setValue("paymentMethod", "payfast")}
                            className={`rounded-xl border-2 p-4 text-left transition-all ${watch("paymentMethod") === "payfast"
                                ? "border-primary bg-primary/5 shadow-lg"
                                : "border-gray-200 hover:border-primary/40"
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
                          </motion.button>

                          {/* COD - Only for home delivery to local areas */}
                          {isCodAvailable ? (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              data-testid="payment-cod"
                              onClick={() => setValue("paymentMethod", "cod")}
                              className={`rounded-xl border-2 p-4 text-left transition-all ${watch("paymentMethod") === "cod"
                                  ? "border-primary bg-primary/5 shadow-lg"
                                  : "border-gray-200 hover:border-primary/40"
                                }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium">Cash on Delivery</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    Pay when you receive
                                  </p>
                                </div>
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-muted-foreground"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                >
                                  <rect x="2" y="5" width="20" height="14" rx="2" />
                                  <line x1="2" y1="10" x2="22" y2="10" />
                                </svg>
                              </div>
                            </motion.button>
                          ) : (
                            <div className="rounded-xl border-2 border-dashed p-4 bg-muted/30">
                              <div className="flex items-start justify-between opacity-50">
                                <div>
                                  <p className="font-medium">Cash on Delivery</p>
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {deliveryMethod === "school"
                                      ? "Not available for school collection"
                                      : "Only for Warrenton & Jan Kempdorp"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <Separator />

                      {/* Delivery Summary */}
                      <div className="space-y-3">
                        <h3 className="font-medium">
                          {deliveryMethod === "school" ? "Collection Details" : "Delivery To"}
                        </h3>
                        <div className={`rounded-xl p-4 ${deliveryMethod === "school"
                            ? "bg-accent/10 border border-accent/20"
                            : "bg-muted"
                          }`}>
                          {deliveryMethod === "school" ? (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <School className="h-4 w-4 text-accent" />
                                <span className="font-medium">{selectedSchool?.name}</span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Collector: {watch("collectorName")} ({watch("collectorPhone")})
                              </p>
                              {watch("childName") && (
                                <p className="text-sm text-muted-foreground">
                                  Child: {watch("childName")} - {watch("childGrade")}
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <p className="font-medium">{watch("recipientName")}</p>
                              <p className="text-sm text-muted-foreground">
                                {watch("streetAddress")}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {watch("town")}, {watch("province")}
                              </p>
                            </div>
                          )}
                        </div>
                        {estimatedDelivery && (
                          <p className="text-sm text-primary font-medium">
                            Estimated delivery: {estimatedDelivery}
                          </p>
                        )}
                      </div>

                      <Separator />

                      {/* Order Items */}
                      <div className="space-y-4">
                        <h3 className="font-medium">Order Items</h3>
                        <div className="space-y-3">
                          {items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                              <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-muted">
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
                      </div>

                      <Separator />

                      {/* Terms */}
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={watch("termsAccepted") || false}
                          onCheckedChange={(checked) => setValue("termsAccepted", checked === true)}
                          className="mt-0.5"
                        />
                        <div className="space-y-1">
                          <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                            I agree to the{" "}
                            <Link href="/terms" className="text-primary hover:underline">
                              Terms & Conditions
                            </Link>{" "}
                            and{" "}
                            <Link href="/privacy" className="text-primary hover:underline">
                              Privacy Policy
                            </Link>
                          </Label>
                          {errors.termsAccepted && (
                            <p className="text-sm text-destructive">
                              Please accept the terms to continue
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 flex justify-between"
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={currentStep === 0}
                className="gap-2"
              >
                Back
              </Button>
              <Button
                type="button"
                onClick={handleContinue}
                disabled={isProcessing}
                className="gap-2 min-w-[140px] hidden lg:flex"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : currentStep === 2 ? (
                  <>
                    <Check className="h-4 w-4" />
                    Place Order
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Order Summary Sidebar - Hidden on mobile, shown on lg+ */}
          <div className="hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="sticky top-24 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="max-h-64 space-y-3 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.quantity}× {item.name}
                        </span>
                        <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
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
                          <span className="text-green-600 font-medium">Free</span>
                        ) : (
                          formatPrice(deliveryFee)
                        )}
                      </span>
                    </div>
                    {deliveryMethod === "school" && (
                      <div className="flex items-center gap-1 text-xs text-accent">
                        <Sparkles className="h-3 w-3" />
                        School collection - free delivery!
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(total)}</span>
                  </div>

                  {giftMessage && (
                    <div className="rounded-xl bg-pink-50 border border-pink-200 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium text-pink-700">
                        <Gift className="h-3 w-3" />
                        Gift Message
                      </div>
                      <p className="mt-1 text-sm text-pink-600">
                        {giftMessage}
                      </p>
                    </div>
                  )}

                  {/* Delivery method indicator */}
                  <div className={`rounded-xl p-3 ${deliveryMethod === "school"
                      ? "bg-accent/10 border border-accent/20"
                      : "bg-muted"
                    }`}>
                    <div className="flex items-center gap-2 text-sm">
                      {deliveryMethod === "school" ? (
                        <>
                          <School className="h-4 w-4 text-accent" />
                          <span className="font-medium">School Collection</span>
                        </>
                      ) : (
                        <>
                          <Truck className="h-4 w-4 text-primary" />
                          <span className="font-medium">Home Delivery</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Spacer for mobile sticky bar */}
        <div className="h-24 lg:hidden" />
      </form>

      {/* Sticky Mobile Order Summary - Only visible on mobile/tablet */}
      <StickyCheckoutSummary
        total={total}
        onContinue={handleContinue}
        isProcessing={isProcessing}
        step={currentStep}
      />
    </div>
  )
}
