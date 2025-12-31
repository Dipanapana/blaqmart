"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, TrendingDown, Gift, BadgePercent, PartyPopper } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"

interface SavingsCelebrationProps {
  savings: number
  originalTotal?: number
  className?: string
  variant?: "inline" | "banner" | "modal" | "toast"
  onClose?: () => void
}

export function SavingsCelebration({
  savings,
  originalTotal,
  className,
  variant = "inline",
  onClose,
}: SavingsCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    if (savings > 0 && variant === "modal") {
      setShowConfetti(true)
      // Trigger confetti
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#1E3A5F", "#FFB81C", "#22C55E"],
        })
      })
    }
  }, [savings, variant])

  if (savings <= 0) return null

  // Calculate percentage saved
  const percentSaved = originalTotal
    ? Math.round((savings / originalTotal) * 100)
    : null

  // Get celebration message based on savings amount
  const getMessage = () => {
    if (savings >= 200) return "AMAZING SAVINGS!"
    if (savings >= 100) return "Great Deal!"
    if (savings >= 50) return "Nice Save!"
    return "You Saved!"
  }

  if (variant === "inline") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "flex items-center gap-2 text-green-600 font-medium",
          className
        )}
      >
        <TrendingDown className="h-4 w-4" />
        <span>You save {formatPrice(savings)}</span>
        {percentSaved && percentSaved >= 10 && (
          <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
            {percentSaved}% OFF
          </span>
        )}
      </motion.div>
    )
  }

  if (variant === "banner") {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        className={cn(
          "bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-lg",
          className
        )}
      >
        <div className="flex items-center justify-center gap-3">
          <motion.div
            animate={{ rotate: [0, -10, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
          <div className="text-center">
            <p className="font-bold text-lg">{getMessage()}</p>
            <p className="text-sm text-green-100">
              You&apos;re saving {formatPrice(savings)} on this order
              {percentSaved && ` (${percentSaved}% off)`}
            </p>
          </div>
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 1 }}
          >
            <Sparkles className="h-5 w-5" />
          </motion.div>
        </div>
      </motion.div>
    )
  }

  if (variant === "modal") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: 2, duration: 0.5 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center"
            >
              <PartyPopper className="h-10 w-10 text-green-600" />
            </motion.div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {getMessage()}
            </h2>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="text-4xl font-bold text-green-600 mb-2"
            >
              {formatPrice(savings)}
            </motion.div>

            {percentSaved && (
              <p className="text-gray-600 mb-4">
                That&apos;s {percentSaved}% off the regular price!
              </p>
            )}

            <p className="text-sm text-gray-500 mb-6">
              Smart choice! You&apos;re getting the best value at Blaqmart.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Continue Shopping
            </button>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    )
  }

  // Toast variant
  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 100, opacity: 0 }}
      className={cn(
        "bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-3",
        className
      )}
    >
      <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
        <Gift className="h-5 w-5" />
      </div>
      <div>
        <p className="font-bold">{getMessage()}</p>
        <p className="text-sm text-green-100">
          You saved {formatPrice(savings)}!
        </p>
      </div>
    </motion.div>
  )
}

// Cart savings summary component
interface CartSavingsSummaryProps {
  items: Array<{
    price: number
    compareAtPrice?: number
    quantity: number
  }>
  className?: string
}

export function CartSavingsSummary({ items, className }: CartSavingsSummaryProps) {
  const totalSavings = items.reduce((acc, item) => {
    if (item.compareAtPrice && item.compareAtPrice > item.price) {
      return acc + (item.compareAtPrice - item.price) * item.quantity
    }
    return acc
  }, 0)

  if (totalSavings <= 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <BadgePercent className="h-5 w-5 text-green-600" />
        <span className="font-medium text-green-800">Your Savings</span>
      </div>
      <span className="font-bold text-green-600">{formatPrice(totalSavings)}</span>
    </motion.div>
  )
}

// Order complete celebration
interface OrderCompleteCelebrationProps {
  orderNumber: string
  savings?: number
  onContinue: () => void
}

export function OrderCompleteCelebration({
  orderNumber,
  savings = 0,
  onContinue,
}: OrderCompleteCelebrationProps) {
  useEffect(() => {
    // Fire confetti on mount
    import("canvas-confetti").then((confetti) => {
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti.default({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ["#1E3A5F", "#FFB81C", "#22C55E"],
        })
        confetti.default({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ["#1E3A5F", "#FFB81C", "#22C55E"],
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }

      frame()
    })
  }, [])

  return (
    <div className="text-center py-8">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <PartyPopper className="h-12 w-12 text-green-600" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-3xl font-bold text-gray-900 mb-2"
      >
        Order Placed!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-gray-600 mb-4"
      >
        Order #{orderNumber}
      </motion.p>

      {savings > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-6"
        >
          <Sparkles className="h-4 w-4" />
          <span className="font-medium">You saved {formatPrice(savings)}!</span>
        </motion.div>
      )}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        onClick={onContinue}
        className="w-full max-w-xs mx-auto py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-colors"
      >
        Continue Shopping
      </motion.button>
    </div>
  )
}
