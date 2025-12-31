"use client"

import { motion } from "framer-motion"
import { Users, TrendingUp, Star, ShoppingBag, Flame } from "lucide-react"
import { cn } from "@/lib/utils"

type SocialProofVariant =
  | "buyers"      // "12 parents bought this"
  | "trending"    // "Trending in Warrenton"
  | "popular"     // "Popular choice"
  | "bestseller"  // "Bestseller"
  | "lowstock"    // "Only 3 left!"

interface SocialProofBadgeProps {
  variant: SocialProofVariant
  count?: number
  location?: string
  className?: string
  animate?: boolean
  size?: "sm" | "md"
}

const variantConfig = {
  buyers: {
    icon: Users,
    getText: (count?: number) => `${count || 0} parents bought this`,
    bgClass: "bg-blue-50 text-blue-700 border-blue-200",
    iconClass: "text-blue-500",
  },
  trending: {
    icon: TrendingUp,
    getText: (_?: number, location?: string) => `Trending in ${location || "your area"}`,
    bgClass: "bg-purple-50 text-purple-700 border-purple-200",
    iconClass: "text-purple-500",
  },
  popular: {
    icon: Star,
    getText: () => "Popular choice",
    bgClass: "bg-amber-50 text-amber-700 border-amber-200",
    iconClass: "text-amber-500",
  },
  bestseller: {
    icon: ShoppingBag,
    getText: () => "Bestseller",
    bgClass: "bg-green-50 text-green-700 border-green-200",
    iconClass: "text-green-500",
  },
  lowstock: {
    icon: Flame,
    getText: (count?: number) => count === 1 ? "Only 1 left!" : `Only ${count} left!`,
    bgClass: "bg-red-50 text-red-700 border-red-200",
    iconClass: "text-red-500",
  },
}

export function SocialProofBadge({
  variant,
  count,
  location,
  className,
  animate = true,
  size = "sm",
}: SocialProofBadgeProps) {
  const config = variantConfig[variant]
  const Icon = config.icon
  const text = config.getText(count, location)

  const sizeClasses = {
    sm: "text-xs px-2 py-1 gap-1",
    md: "text-sm px-3 py-1.5 gap-1.5",
  }

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
  }

  return (
    <motion.div
      initial={animate ? { opacity: 0, scale: 0.9 } : false}
      animate={animate ? { opacity: 1, scale: 1 } : false}
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        sizeClasses[size],
        config.bgClass,
        className
      )}
    >
      <motion.div
        animate={variant === "lowstock" && animate ? { scale: [1, 1.2, 1] } : {}}
        transition={{ repeat: Infinity, duration: 1.5 }}
      >
        <Icon className={cn(iconSizes[size], config.iconClass)} />
      </motion.div>
      <span>{text}</span>
    </motion.div>
  )
}

// Compound component for showing multiple proofs
interface SocialProofStackProps {
  proofs: Array<{
    variant: SocialProofVariant
    count?: number
    location?: string
  }>
  className?: string
  maxVisible?: number
}

export function SocialProofStack({
  proofs,
  className,
  maxVisible = 2,
}: SocialProofStackProps) {
  const visibleProofs = proofs.slice(0, maxVisible)

  return (
    <div className={cn("flex flex-wrap gap-1", className)}>
      {visibleProofs.map((proof, index) => (
        <SocialProofBadge
          key={`${proof.variant}-${index}`}
          {...proof}
        />
      ))}
    </div>
  )
}

// Hook to generate social proof data based on product stats
export function useSocialProof(product: {
  salesCount?: number
  stock?: number
  isTrending?: boolean
  isBestseller?: boolean
  town?: string
}) {
  const proofs: Array<{
    variant: SocialProofVariant
    count?: number
    location?: string
  }> = []

  // Low stock is highest priority (urgency)
  if (product.stock && product.stock <= 5 && product.stock > 0) {
    proofs.push({ variant: "lowstock", count: product.stock })
  }

  // Bestseller badge
  if (product.isBestseller) {
    proofs.push({ variant: "bestseller" })
  }

  // Trending badge
  if (product.isTrending) {
    proofs.push({ variant: "trending", location: product.town || "Warrenton" })
  }

  // Buyer count if significant
  if (product.salesCount && product.salesCount >= 5) {
    proofs.push({ variant: "buyers", count: product.salesCount })
  }

  // Popular choice fallback
  if (proofs.length === 0 && product.salesCount && product.salesCount >= 3) {
    proofs.push({ variant: "popular" })
  }

  return proofs
}
