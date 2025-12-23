"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, ShoppingBag, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import { triggerCartConfetti } from "@/components/shared/confetti"

interface ProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  image?: string | null
  stock: number
  isFeatured?: boolean
  index?: number
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  comparePrice,
  image,
  stock,
  isFeatured,
  index = 0,
}: ProductCardProps) {
  const { addItem, getItem } = useCart()
  const cartItem = getItem(id)
  const isOutOfStock = stock <= 0
  const isOnSale = comparePrice && comparePrice > price
  const cardRef = useRef<HTMLDivElement>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -8, y: x * 8 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isOutOfStock || isAdding) return

    setIsAdding(true)

    // Add to cart
    addItem({
      productId: id,
      name,
      price,
      image: image || "",
      stock,
    })

    // Trigger mini confetti
    triggerCartConfetti()

    // Show success state
    setShowSuccess(true)

    setTimeout(() => {
      setIsAdding(false)
      setShowSuccess(false)
    }, 1500)
  }

  const discount = isOnSale ? Math.round(((comparePrice - price) / comparePrice) * 100) : 0

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -8 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className="group"
    >
      <Card className="overflow-hidden border-0 bg-white shadow-md transition-shadow duration-300 hover:shadow-xl hover:shadow-primary/10">
        <Link href={`/products/${slug}`}>
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
            {image ? (
              <motion.div
                className="h-full w-full"
                whileHover={{ scale: 1.08 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <Image
                  src={image}
                  alt={name}
                  fill
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                </motion.div>
              </div>
            )}

            {/* Gradient overlay on hover */}
            <motion.div
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"
            />

            {/* Badges with animations */}
            <div className="absolute left-2 top-2 flex flex-col gap-1.5">
              <AnimatePresence>
                {isOnSale && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                  >
                    <Badge className="bg-red-500 text-white font-semibold shadow-lg animate-pulse-glow">
                      -{discount}%
                    </Badge>
                  </motion.div>
                )}
                {isFeatured && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                  >
                    <Badge variant="secondary" className="bg-accent text-accent-foreground font-semibold shadow-lg">
                      <Sparkles className="mr-1 h-3 w-3" />
                      Featured
                    </Badge>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Out of stock overlay */}
            <AnimatePresence>
              {isOutOfStock && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <Badge variant="secondary" className="text-sm px-4 py-1.5 bg-white/90 text-gray-800 font-medium">
                      Out of Stock
                    </Badge>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Quick add button with slide-up animation */}
            {!isOutOfStock && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100"
              >
                <Button
                  size="sm"
                  className={`w-full shadow-lg transition-all duration-300 ${
                    showSuccess
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                  onClick={handleAddToCart}
                  disabled={isAdding}
                >
                  <AnimatePresence mode="wait">
                    {showSuccess ? (
                      <motion.span
                        key="success"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="flex items-center"
                      >
                        <Check className="mr-1.5 h-4 w-4" />
                        Added!
                      </motion.span>
                    ) : cartItem ? (
                      <motion.span
                        key="in-cart"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <ShoppingCart className="mr-1.5 h-4 w-4" />
                        In Cart ({cartItem.quantity})
                      </motion.span>
                    ) : (
                      <motion.span
                        key="add"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center"
                      >
                        <ShoppingCart className="mr-1.5 h-4 w-4" />
                        Quick Add
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            )}
          </div>

          <CardContent className="p-4">
            <motion.h3
              className="line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-primary transition-colors"
              style={{ transform: 'translateZ(20px)' }}
            >
              {name}
            </motion.h3>
            <div className="mt-2 flex items-center gap-2">
              <motion.span
                className="text-lg font-bold text-primary"
                style={{ transform: 'translateZ(30px)' }}
              >
                {formatPrice(price)}
              </motion.span>
              {isOnSale && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-muted-foreground line-through"
                >
                  {formatPrice(comparePrice)}
                </motion.span>
              )}
            </div>

            {/* Stock indicator */}
            {stock > 0 && stock <= 5 && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-1.5 text-xs text-orange-600 font-medium"
              >
                Only {stock} left!
              </motion.p>
            )}
          </CardContent>
        </Link>
      </Card>
    </motion.div>
  )
}

// Skeleton loader for product card
export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <div className="aspect-square bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
        <div className="h-4 w-2/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
        <div className="h-6 w-1/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
      </div>
    </div>
  )
}
