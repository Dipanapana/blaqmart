'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, Mail, Package, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { triggerSuccessConfetti } from '@/components/shared/confetti'

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

export function OrderSuccessCelebration({
  order,
  formatPrice,
}: OrderSuccessCelebrationProps) {
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Trigger confetti and show content
    const timer = setTimeout(() => {
      triggerSuccessConfetti()
      setShowContent(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: showContent ? 1 : 0, y: showContent ? 0 : 20 }}
        transition={{ duration: 0.5 }}
      >
        {/* Success Icon */}
        <motion.div
          className="mx-auto mb-8"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
        >
          <div className="relative inline-flex">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-500 shadow-lg shadow-green-500/30">
              <Check className="h-12 w-12 text-white" strokeWidth={3} />
            </div>
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-green-500"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Placed!</h1>
        <p className="text-gray-600 mb-6">Thank you for shopping with us</p>

        {/* Order Number */}
        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-500 mb-1">Order Number</p>
          <p className="text-2xl font-bold text-primary font-mono">{order.orderNumber}</p>
        </div>

        {/* Info Cards */}
        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100">
              <Mail className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Confirmation email sent</p>
              <p className="text-sm text-gray-600">Check your inbox for order details</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900">Delivery: 1-5 business days</p>
              <p className="text-sm text-gray-600">We&apos;ll notify you when shipped</p>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-gray-50 rounded-xl p-4 mb-8 text-left">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{order.items.length} items</span>
          </div>
          <div className="text-sm text-gray-600 space-y-1 mb-3">
            {order.items.slice(0, 3).map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="truncate mr-2">{item.quantity}× {item.productName}</span>
                <span className="shrink-0">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            {order.items.length > 3 && (
              <p className="text-gray-400">+{order.items.length - 3} more items</p>
            )}
          </div>
          <div className="flex justify-between pt-3 border-t border-gray-200">
            <span className="font-medium text-gray-900">Total</span>
            <span className="font-bold text-primary">{formatPrice(order.total)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
            asChild
          >
            <Link
              href={`https://wa.me/27794022296?text=Hi%20Blaqmart!%20I%20have%20a%20question%20about%20my%20order%20${encodeURIComponent(order.orderNumber)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg viewBox="0 0 24 24" className="mr-2 h-5 w-5 fill-current" xmlns="http://www.w3.org/2000/svg">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp Support
            </Link>
          </Button>

          <Button size="lg" variant="outline" className="w-full" asChild>
            <Link href="/products">
              Continue Shopping
            </Link>
          </Button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-sm text-gray-400">
          Questions? WhatsApp us at 079 402 2296
        </p>
      </motion.div>
    </div>
  )
}
