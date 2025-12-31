"use client"

import { motion } from "framer-motion"
import { Check, ShoppingCart, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  current: number
  total: number
  size?: "sm" | "md" | "lg"
  showText?: boolean
  className?: string
}

export function ProgressRing({
  current,
  total,
  size = "md",
  showText = true,
  className,
}: ProgressRingProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const isComplete = current >= total

  const sizeConfig = {
    sm: {
      size: 48,
      strokeWidth: 4,
      fontSize: "text-xs",
      iconSize: "h-3 w-3",
    },
    md: {
      size: 64,
      strokeWidth: 5,
      fontSize: "text-sm",
      iconSize: "h-4 w-4",
    },
    lg: {
      size: 96,
      strokeWidth: 6,
      fontSize: "text-lg",
      iconSize: "h-6 w-6",
    },
  }

  const config = sizeConfig[size]
  const radius = (config.size - config.strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={config.size}
        height={config.size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-muted/20"
        />

        {/* Progress circle */}
        <motion.circle
          cx={config.size / 2}
          cy={config.size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          strokeLinecap="round"
          className={cn(
            isComplete ? "text-green-500" : "text-primary"
          )}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            strokeDasharray: circumference,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {isComplete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Check className={cn(config.iconSize, "text-green-500")} />
          </motion.div>
        ) : showText ? (
          <span className={cn(config.fontSize, "font-bold text-foreground")}>
            {current}/{total}
          </span>
        ) : (
          <ShoppingCart className={cn(config.iconSize, "text-muted-foreground")} />
        )}
      </div>
    </div>
  )
}

// Linear progress bar variant
interface ProgressBarProps {
  current: number
  total: number
  showLabel?: boolean
  className?: string
}

export function ProgressBar({
  current,
  total,
  showLabel = true,
  className,
}: ProgressBarProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const isComplete = current >= total

  return (
    <div className={cn("space-y-2", className)}>
      {showLabel && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {isComplete ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <Check className="h-4 w-4" />
                List Complete!
              </span>
            ) : (
              `${current} of ${total} items added`
            )}
          </span>
          <span className="font-medium">{Math.round(percentage)}%</span>
        </div>
      )}

      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "h-full rounded-full",
            isComplete ? "bg-green-500" : "bg-primary"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// Stationery list progress tracker
interface ListProgressTrackerProps {
  listItems: Array<{
    id: string
    name: string
    isInCart: boolean
  }>
  className?: string
}

export function ListProgressTracker({
  listItems,
  className,
}: ListProgressTrackerProps) {
  const addedCount = listItems.filter((item) => item.isInCart).length
  const totalCount = listItems.length
  const isComplete = addedCount >= totalCount

  return (
    <div className={cn("bg-white rounded-lg border p-4", className)}>
      <div className="flex items-center gap-4">
        <ProgressRing current={addedCount} total={totalCount} size="lg" />

        <div className="flex-1">
          <h3 className="font-medium text-foreground">
            {isComplete ? (
              <span className="flex items-center gap-2 text-green-600">
                <Sparkles className="h-4 w-4" />
                Your list is complete!
              </span>
            ) : (
              "Your Progress"
            )}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isComplete
              ? "All items added to cart. Ready to checkout!"
              : `${totalCount - addedCount} items remaining`}
          </p>
        </div>
      </div>

      {/* Item checklist preview */}
      <div className="mt-4 space-y-2">
        {listItems.slice(0, 3).map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className={cn(
                "h-4 w-4 rounded-full border-2 flex items-center justify-center",
                item.isInCart
                  ? "bg-green-500 border-green-500"
                  : "border-muted-foreground"
              )}
            >
              {item.isInCart && <Check className="h-2.5 w-2.5 text-white" />}
            </div>
            <span
              className={cn(
                item.isInCart && "text-muted-foreground line-through"
              )}
            >
              {item.name}
            </span>
          </div>
        ))}
        {listItems.length > 3 && (
          <p className="text-xs text-muted-foreground pl-6">
            +{listItems.length - 3} more items
          </p>
        )}
      </div>
    </div>
  )
}

// Compact progress indicator for header/nav
interface CompactProgressProps {
  current: number
  total: number
  className?: string
}

export function CompactProgress({ current, total, className }: CompactProgressProps) {
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0
  const isComplete = current >= total

  if (total === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium",
        isComplete
          ? "bg-green-100 text-green-700"
          : "bg-primary/10 text-primary",
        className
      )}
    >
      {isComplete ? (
        <>
          <Check className="h-3 w-3" />
          <span>Complete!</span>
        </>
      ) : (
        <>
          <div className="w-12 h-1.5 bg-primary/20 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
            />
          </div>
          <span>{current}/{total}</span>
        </>
      )}
    </motion.div>
  )
}
