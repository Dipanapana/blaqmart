'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Package, Check, Sparkles, Star, Loader2 } from 'lucide-react'
import { cn, formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
import { triggerCartConfetti } from '@/components/shared/confetti'

interface StationeryPackItem {
  id: string
  productName: string
  quantity: number
}

interface StationeryPack {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  price: number
  comparePrice?: number
  gradeName?: string
  schoolName?: string
  itemCount?: number
  items?: StationeryPackItem[]
  isFeatured?: boolean
}

interface StationeryPackCardProps {
  pack: StationeryPack
  onAddToCart?: (pack: StationeryPack) => void
  isAddingToCart?: boolean
  className?: string
  index?: number
}

export function StationeryPackCard({
  pack,
  onAddToCart,
  isAddingToCart,
  className,
  index = 0,
}: StationeryPackCardProps) {
  const savings = pack.comparePrice ? pack.comparePrice - pack.price : 0
  const savingsPercent = pack.comparePrice
    ? Math.round((savings / pack.comparePrice) * 100)
    : 0
  const [showSuccess, setShowSuccess] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: y * -6, y: x * 6 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
    setIsHovered(false)
  }

  const handleAddToCart = () => {
    if (isAddingToCart) return
    onAddToCart?.(pack)
    triggerCartConfetti()
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 2000)
  }

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ y: -10 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transformStyle: 'preserve-3d',
      }}
      className={cn(
        'group relative flex flex-col bg-white rounded-2xl',
        'overflow-hidden transition-all duration-300',
        'shadow-lg hover:shadow-2xl hover:shadow-primary/20',
        'border border-gray-100 hover:border-primary/30',
        className
      )}
    >
      {/* Featured badge with animation */}
      <AnimatePresence>
        {pack.isFeatured && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.2 }}
            className="absolute top-4 left-4 z-10"
          >
            <span className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 rounded-full shadow-lg">
              <Star className="w-3 h-3 fill-current" />
              Popular
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Savings badge with pulse animation */}
      <AnimatePresence>
        {savingsPercent > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.3 }}
            className="absolute top-4 right-4 z-10"
          >
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="inline-flex items-center px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full shadow-lg"
            >
              Save {savingsPercent}%
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image with zoom effect */}
      <Link href={`/stationery-packs/${pack.slug}`} className="relative aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
        {pack.image ? (
          <motion.div
            className="h-full w-full"
            animate={{ scale: isHovered ? 1.08 : 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Image
              src={pack.image}
              alt={pack.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </motion.div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Package className="w-20 h-20 text-primary/20" />
            </motion.div>
          </div>
        )}

        {/* Gradient overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none"
        />
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        {/* Grade/School badges with animation */}
        {(pack.gradeName || pack.schoolName) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2 mb-3"
          >
            {pack.gradeName && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-primary/10 text-primary rounded-lg">
                {pack.gradeName}
              </span>
            )}
            {pack.schoolName && (
              <span className="px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-lg">
                {pack.schoolName}
              </span>
            )}
          </motion.div>
        )}

        {/* Title */}
        <Link href={`/stationery-packs/${pack.slug}`}>
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2">
            {pack.name}
          </h3>
        </Link>

        {/* Description */}
        {pack.description && (
          <p className="mt-2 text-sm text-gray-500 line-clamp-2">
            {pack.description}
          </p>
        )}

        {/* Item count with icon */}
        {pack.itemCount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-sm text-gray-600"
          >
            <Package className="w-4 h-4 text-primary" />
            <span className="font-medium">{pack.itemCount} items included</span>
          </motion.div>
        )}

        {/* Preview of items with stagger animation */}
        {pack.items && pack.items.length > 0 && (
          <motion.div
            initial="hidden"
            animate={isHovered ? 'visible' : 'hidden'}
            variants={{
              hidden: { opacity: 0.7 },
              visible: { opacity: 1 }
            }}
            className="mt-4 space-y-1.5"
          >
            {pack.items.slice(0, 3).map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="line-clamp-1">
                  {item.quantity}x {item.productName}
                </span>
              </motion.div>
            ))}
            {pack.items.length > 3 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-primary font-medium pl-6"
              >
                +{pack.items.length - 3} more items
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-4" />

        {/* Price and CTA */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-end justify-between gap-4">
            <div>
              {/* Compare price */}
              {pack.comparePrice && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-sm text-gray-400 line-through"
                >
                  {formatPrice(pack.comparePrice)}
                </motion.div>
              )}
              {/* Current price */}
              <div className="text-2xl font-bold text-primary">
                {formatPrice(pack.price)}
              </div>
              {/* Savings */}
              {savings > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-green-600 font-semibold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  You save {formatPrice(savings)}
                </motion.div>
              )}
            </div>

            {/* Add to cart button with animation */}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                size="lg"
                className={cn(
                  'min-h-[52px] min-w-[52px] shrink-0 rounded-xl font-semibold transition-all duration-300',
                  showSuccess
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25'
                )}
              >
                <AnimatePresence mode="wait">
                  {isAddingToCart ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                    >
                      <Loader2 className="w-5 h-5 animate-spin" />
                    </motion.span>
                  ) : showSuccess ? (
                    <motion.span
                      key="success"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-5 h-5" />
                      <span className="hidden sm:inline">Added!</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="add"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <ShoppingCart className="w-5 h-5" />
                      <span className="hidden sm:inline">Add Pack</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Skeleton loader for pack card
 */
export function StationeryPackCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-lg">
      <div className="aspect-[4/3] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%]" />
      <div className="p-5 space-y-4">
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-lg" />
        </div>
        <div className="h-6 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
        <div className="h-4 w-3/4 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
        <div className="space-y-2 pt-2">
          <div className="h-3 w-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
          <div className="h-3 w-2/3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
        </div>
        <div className="pt-4 border-t flex justify-between items-end">
          <div className="space-y-2">
            <div className="h-4 w-16 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
            <div className="h-8 w-24 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded" />
          </div>
          <div className="h-12 w-12 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer bg-[length:200%_100%] rounded-xl" />
        </div>
      </div>
    </div>
  )
}

/**
 * Grid of stationery packs with stagger animation
 */
export function StationeryPackGrid({
  packs,
  onAddToCart,
  className,
}: {
  packs: StationeryPack[]
  onAddToCart?: (pack: StationeryPack) => void
  className?: string
}) {
  if (packs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Package className="w-20 h-20 mx-auto text-gray-200 mb-6" />
        </motion.div>
        <h3 className="text-xl font-semibold text-gray-900">No packs available</h3>
        <p className="text-gray-500 mt-2 max-w-sm mx-auto">
          Check back soon for new stationery packs!
        </p>
      </motion.div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8',
        className
      )}
      data-testid="stationery-pack-grid"
    >
      {packs.map((pack, index) => (
        <StationeryPackCard
          key={pack.id}
          pack={pack}
          onAddToCart={onAddToCart}
          index={index}
        />
      ))}
    </div>
  )
}

/**
 * Featured packs section for homepage with animations
 */
export function FeaturedPacks({
  packs,
  onAddToCart,
}: {
  packs: StationeryPack[]
  onAddToCart?: (pack: StationeryPack) => void
}) {
  const featuredPacks = packs.filter((p) => p.isFeatured).slice(0, 4)

  if (featuredPacks.length === 0) return null

  return (
    <section className="py-16" data-testid="featured-packs">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h2 className="text-3xl font-bold text-gray-900">
              Popular Stationery Packs
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Complete packs with everything your child needs
            </p>
          </div>
          <motion.div whileHover={{ x: 5 }}>
            <Link
              href="/stationery-packs"
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              View all
              <span className="text-xl">→</span>
            </Link>
          </motion.div>
        </motion.div>

        <StationeryPackGrid
          packs={featuredPacks}
          onAddToCart={onAddToCart}
        />
      </div>
    </section>
  )
}
