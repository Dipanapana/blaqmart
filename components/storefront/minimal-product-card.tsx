"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Check, Heart, Eye } from "lucide-react"
import { cn, formatPrice } from "@/lib/utils"
import { useCart } from "@/lib/stores/cart"
import { SocialProofBadge } from "./social-proof-badge"
import { toast } from "sonner"

interface MinimalProductCardProps {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string
  stock?: number
  salesCount?: number
  isBestseller?: boolean
  className?: string
}

export function MinimalProductCard({
  id,
  name,
  slug,
  price,
  compareAtPrice,
  image,
  stock,
  salesCount,
  isBestseller,
  className,
}: MinimalProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const addItem = useCart((state) => state.addItem)

  const isOnSale = compareAtPrice && compareAtPrice > price
  const savingsPercent = isOnSale
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0
  const isLowStock = stock !== undefined && stock > 0 && stock <= 5

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isAdded) return

    addItem({
      id,
      name,
      price,
      quantity: 1,
      image,
    })

    setIsAdded(true)
    toast.success("Added to cart!")

    setTimeout(() => setIsAdded(false), 2000)
  }

  return (
    <motion.div
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white shadow-sm",
        "transition-shadow hover:shadow-md",
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/products/${slug}`} className="block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Sale Badge */}
          {isOnSale && (
            <div className="absolute top-2 left-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full"
              >
                -{savingsPercent}%
              </motion.div>
            </div>
          )}

          {/* Bestseller Badge */}
          {isBestseller && !isOnSale && (
            <div className="absolute top-2 left-2">
              <SocialProofBadge variant="bestseller" size="sm" />
            </div>
          )}

          {/* Quick Add Button - appears on hover */}
          <AnimatePresence>
            {(isHovered || isAdded) && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleQuickAdd}
                className={cn(
                  "absolute top-2 right-2 h-10 w-10 rounded-full",
                  "flex items-center justify-center shadow-lg",
                  "transition-colors",
                  isAdded
                    ? "bg-green-500 text-white"
                    : "bg-primary text-white hover:bg-primary/90"
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
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="plus"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                    >
                      <Plus className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            )}
          </AnimatePresence>

          {/* Low Stock Badge */}
          {isLowStock && (
            <div className="absolute bottom-2 left-2">
              <SocialProofBadge variant="lowstock" count={stock} size="sm" />
            </div>
          )}

          {/* Social Proof - buyers count */}
          {salesCount && salesCount >= 5 && !isLowStock && (
            <div className="absolute bottom-2 left-2">
              <SocialProofBadge variant="buyers" count={salesCount} size="sm" />
            </div>
          )}

          {/* Gradient Overlay for text */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
        </div>

        {/* Product Info - Overlaid on image */}
        <div className="absolute bottom-0 inset-x-0 p-3 text-white">
          <h3 className="font-medium text-sm line-clamp-2 mb-1">
            {name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {formatPrice(price)}
            </span>
            {isOnSale && (
              <span className="text-sm text-white/70 line-through">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Horizontal scroll variant for featured products
interface ProductScrollProps {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number
    image: string
    stock?: number
    salesCount?: number
    isBestseller?: boolean
  }>
  title?: string
  className?: string
}

export function ProductScroll({ products, title, className }: ProductScrollProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {title && (
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-bold">{title}</h2>
          <Link
            href="/products"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </div>
      )}

      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-2">
          {products.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-40">
              <MinimalProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Grid variant for category pages
interface ProductGridProps {
  products: Array<{
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice?: number
    image: string
    stock?: number
    salesCount?: number
    isBestseller?: boolean
  }>
  className?: string
}

export function ProductGrid({ products, className }: ProductGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4",
        className
      )}
    >
      {products.map((product) => (
        <MinimalProductCard key={product.id} {...product} />
      ))}
    </div>
  )
}

// Skeleton loader for product cards
export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm">
      <div className="aspect-square bg-gray-200 animate-pulse" />
    </div>
  )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  )
}
