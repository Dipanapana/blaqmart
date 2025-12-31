"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Check, Loader2, Plus, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatPrice } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"
import { toast } from "sonner"

interface StationeryItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
}

interface OneTapBuyProps {
  items: StationeryItem[]
  totalPrice: number
  schoolName?: string
  gradeName?: string
  className?: string
  variant?: "default" | "large" | "sticky"
}

export function OneTapBuy({
  items,
  totalPrice,
  schoolName,
  gradeName,
  className,
  variant = "default",
}: OneTapBuyProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCart((state) => state.addItem)

  const handleAddAll = async () => {
    if (isAdding || isAdded) return

    setIsAdding(true)

    // Add items with stagger effect
    for (let i = 0; i < items.length; i++) {
      const item = items[i]
      // Add item multiple times for quantity (cart increments by 1 each call)
      for (let q = 0; q < item.quantity; q++) {
        addItem({
          productId: item.productId,
          name: item.name,
          price: item.price,
          image: item.image || "/images/placeholder-product.jpg",
          stock: 999,
        })
      }

      // Small delay for visual feedback
      if (i < items.length - 1) {
        await new Promise((r) => setTimeout(r, 50))
      }
    }

    setIsAdding(false)
    setIsAdded(true)

    // Show success toast
    toast.success(`Added ${items.length} items to cart!`, {
      description: schoolName && gradeName
        ? `${gradeName} list for ${schoolName}`
        : "Your stationery list",
      action: {
        label: "View Cart",
        onClick: () => {
          // Trigger cart sheet open
          document.querySelector<HTMLButtonElement>('[data-cart-trigger]')?.click()
        },
      },
    })

    // Reset after delay
    setTimeout(() => {
      setIsAdded(false)
    }, 3000)
  }

  const variantStyles = {
    default: "h-12",
    large: "h-14 text-lg",
    sticky: "h-14 text-lg shadow-lg",
  }

  return (
    <motion.div
      className={cn(
        variant === "sticky" && "fixed bottom-20 inset-x-4 z-40 md:static md:z-0",
        className
      )}
    >
      <Button
        size="lg"
        className={cn(
          "w-full font-bold relative overflow-hidden",
          variantStyles[variant],
          isAdded && "bg-green-600 hover:bg-green-600"
        )}
        onClick={handleAddAll}
        disabled={isAdding || items.length === 0}
      >
        <AnimatePresence mode="wait">
          {isAdding ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Adding {items.length} items...</span>
            </motion.div>
          ) : isAdded ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.3 }}
              >
                <Check className="h-5 w-5" />
              </motion.div>
              <span>Added to Cart!</span>
            </motion.div>
          ) : (
            <motion.div
              key="default"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                Add All {items.length} Items - {formatPrice(totalPrice)}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />
      </Button>

      {/* Items count badge */}
      {items.length > 0 && (
        <p className="text-center text-sm text-muted-foreground mt-2">
          {items.length} items • Free delivery on orders over R500
        </p>
      )}
    </motion.div>
  )
}

// Compact version for inline use
interface QuickAddButtonProps {
  productId: string
  productName: string
  price: number
  image?: string
  className?: string
  size?: "sm" | "md" | "lg"
}

export function QuickAddButton({
  productId,
  productName,
  price,
  image,
  className,
  size = "md",
}: QuickAddButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCart((state) => state.addItem)

  const handleAdd = () => {
    if (isAdded) return

    addItem({
      id: productId,
      name: productName,
      price,
      quantity: 1,
      image: image || "/images/placeholder-product.jpg",
    })

    setIsAdded(true)
    toast.success("Added to cart!")

    setTimeout(() => setIsAdded(false), 2000)
  }

  const sizeStyles = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  }

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={handleAdd}
      className={cn(
        "rounded-full flex items-center justify-center transition-colors",
        isAdded
          ? "bg-green-500 text-white"
          : "bg-primary text-primary-foreground hover:bg-primary/90",
        sizeStyles[size],
        className
      )}
      aria-label={isAdded ? "Added to cart" : "Add to cart"}
    >
      <AnimatePresence mode="wait">
        {isAdded ? (
          <motion.div
            key="check"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0 }}
          >
            <Check className={iconSizes[size]} />
          </motion.div>
        ) : (
          <motion.div
            key="plus"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Plus className={iconSizes[size]} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

// Floating action button variant for mobile
interface FloatingBuyButtonProps {
  itemCount: number
  totalPrice: number
  onClick: () => void
  visible?: boolean
}

export function FloatingBuyButton({
  itemCount,
  totalPrice,
  onClick,
  visible = true,
}: FloatingBuyButtonProps) {
  return (
    <AnimatePresence>
      {visible && itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-20 inset-x-4 z-40 md:hidden"
        >
          <Button
            size="lg"
            className="w-full h-14 text-lg font-bold shadow-xl"
            onClick={onClick}
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="h-5 w-5 mr-2" />
            </motion.div>
            Add All {itemCount} Items - {formatPrice(totalPrice)}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
