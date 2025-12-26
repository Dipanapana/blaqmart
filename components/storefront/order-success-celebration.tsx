'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle,
  Package,
  Truck,
  MapPin,
  PartyPopper,
  Gift,
  Heart,
  Star,
  ArrowRight,
  ShoppingBag
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { triggerSuccessConfetti, SchoolConfetti } from '@/components/shared/confetti'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  productName: string
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  subtotal: number
  deliveryFee: number
  total: number
  shippingName: string
  shippingAddress: string
  shippingSuburb: string
  shippingCity: string
  shippingPostalCode: string
  deliveryDate: Date | null
  deliverySlot: string | null
  giftMessage: string | null
  items: OrderItem[]
}

interface OrderSuccessCelebrationProps {
  order: Order
  formatPrice: (price: number) => string
  formatDate: (date: Date) => string
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0 },
  visible: { opacity: 1, scale: 1 }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
}

export function OrderSuccessCelebration({
  order,
  formatPrice,
  formatDate
}: OrderSuccessCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)
  const [animationPhase, setAnimationPhase] = useState(0)

  useEffect(() => {
    // Trigger confetti on mount
    setTimeout(() => {
      setShowConfetti(true)
      triggerSuccessConfetti()
    }, 500)

    // Progress through animation phases
    const phaseTimer = setInterval(() => {
      setAnimationPhase((prev) => Math.min(prev + 1, 3))
    }, 800)

    return () => clearInterval(phaseTimer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-white py-12">
      {/* Confetti celebration */}
      {showConfetti && <SchoolConfetti />}

      <div className="container">
        <motion.div
          className="mx-auto max-w-2xl text-center"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Animated success icon */}
          <motion.div
            variants={scaleIn}
            transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
            className="relative mx-auto mb-6"
          >
            {/* Pulsing rings */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="h-24 w-24 rounded-full bg-green-400/30" />
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            >
              <div className="h-28 w-28 rounded-full bg-green-400/20" />
            </motion.div>

            <motion.div
              className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-600 shadow-xl shadow-green-500/30"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, delay: 1 }}
              >
                <CheckCircle className="h-12 w-12 text-white" strokeWidth={3} />
              </motion.div>
            </motion.div>

            {/* Floating celebration icons */}
            <motion.div
              className="absolute -right-4 -top-2"
              animate={{ y: [0, -8, 0], rotate: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <PartyPopper className="h-8 w-8 text-accent" />
            </motion.div>
            <motion.div
              className="absolute -left-4 top-0"
              animate={{ y: [0, -5, 0], rotate: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
            >
              <Star className="h-6 w-6 fill-accent text-accent" />
            </motion.div>
          </motion.div>

          {/* Success message */}
          <motion.h1
            variants={fadeInUp}
            className="text-4xl font-bold text-gray-900"
          >
            Order Confirmed!
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="mt-3 text-lg text-gray-600"
          >
            Thank you for your order. We&apos;ve received it and will start
            preparing it shortly.
          </motion.p>

          {/* Animated order number */}
          <motion.div
            variants={fadeInUp}
            className="mt-6"
          >
            <motion.div
              className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 px-6 py-3 shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <Package className="h-5 w-5 text-primary" />
              <div className="text-left">
                <span className="text-xs text-muted-foreground">Order Number</span>
                <p className="font-mono text-lg font-bold text-primary">{order.orderNumber}</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Order Details Card */}
        <motion.div
          className="mx-auto mt-10 max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="overflow-hidden border-2 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
              <CardTitle className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* Items with stagger animation */}
              <motion.div
                className="space-y-3"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {order.items.map((item, index) => (
                  <motion.div
                    key={item.id}
                    variants={fadeInUp}
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {item.quantity}
                      </div>
                      <span className="font-medium">{item.productName}</span>
                    </div>
                    <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
                  </motion.div>
                ))}
              </motion.div>

              <Separator />

              {/* Totals */}
              <motion.div
                className="space-y-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {order.deliveryFee === 0 ? (
                      <span className="font-medium text-green-600">Free</span>
                    ) : (
                      formatPrice(order.deliveryFee)
                    )}
                  </span>
                </div>
                <motion.div
                  className="flex justify-between rounded-lg bg-primary/5 p-3"
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: 'spring' }}
                >
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-primary">{formatPrice(order.total)}</span>
                </motion.div>
              </motion.div>

              <Separator />

              {/* Delivery Info */}
              <motion.div
                className="grid gap-4 sm:grid-cols-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 }}
              >
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="rounded-full bg-blue-100 p-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Delivery Address</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.shippingName}<br />
                      {order.shippingAddress}<br />
                      {order.shippingSuburb}, {order.shippingCity} {order.shippingPostalCode}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-lg border p-4">
                  <div className="rounded-full bg-green-100 p-2">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Delivery Time</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.deliveryDate ? formatDate(order.deliveryDate) : 'TBD'}<br />
                      {order.deliverySlot === 'morning'
                        ? '09:00 - 12:00'
                        : order.deliverySlot === 'afternoon'
                          ? '12:00 - 15:00'
                          : '15:00 - 18:00'}
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Gift Message */}
              <AnimatePresence>
                {order.giftMessage && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <Separator />
                    <div className="flex items-start gap-3 pt-4">
                      <div className="rounded-full bg-pink-100 p-2">
                        <Gift className="h-5 w-5 text-pink-600" />
                      </div>
                      <div>
                        <p className="font-medium">Gift Message</p>
                        <p className="mt-1 text-sm italic text-muted-foreground">
                          &quot;{order.giftMessage}&quot;
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <motion.div
            className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" asChild className="shadow-lg w-full sm:w-auto bg-[#25D366] hover:bg-[#128C7E] text-white border-none">
                <Link
                  href={`https://wa.me/27123456789?text=Hi%20Blaqmart,%20I'd%20like%20to%20track%20my%20order%20${order.orderNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                  Track on WhatsApp
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
                <Link href="/products">
                  Continue Shopping
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          {/* What's Next Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7 }}
          >
            <Card className="mt-8 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent">
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  What happens next?
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute left-[22px] top-6 h-[calc(100%-48px)] w-0.5 bg-muted sm:left-1/2 sm:h-0.5 sm:w-[calc(66%-48px)] sm:translate-x-[-33%] sm:top-[22px]" />

                  <div className="grid gap-8 sm:grid-cols-3 sm:gap-4">
                    {[
                      { num: 1, title: 'Order Confirmed', desc: "We've received your order", active: true },
                      { num: 2, title: 'Preparing', desc: 'Your items are being packed', active: false },
                      { num: 3, title: 'On the Way', desc: 'Out for delivery to you', active: false },
                    ].map((step, index) => (
                      <motion.div
                        key={step.num}
                        className="relative flex items-start gap-4 sm:flex-col sm:items-center sm:text-center"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.9 + index * 0.2 }}
                      >
                        <motion.div
                          className={cn(
                            'relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg font-bold',
                            step.active
                              ? 'bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30'
                              : 'bg-muted text-muted-foreground'
                          )}
                          animate={step.active ? { scale: [1, 1.1, 1] } : {}}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {step.active && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-primary/30"
                              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                            />
                          )}
                          {step.num}
                        </motion.div>
                        <div>
                          <p className={cn('font-semibold', step.active && 'text-primary')}>{step.title}</p>
                          <p className="text-sm text-muted-foreground">{step.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Thank you message */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
          >
            <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Heart className="h-4 w-4 text-red-500" />
              Thank you for shopping with Blaqmart!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
