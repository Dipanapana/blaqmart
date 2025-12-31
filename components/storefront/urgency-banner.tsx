"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Clock, AlertTriangle, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface UrgencyBannerProps {
  // School start date - defaults to January 15, 2025
  schoolStartDate?: Date
  className?: string
}

export function UrgencyBanner({
  schoolStartDate = new Date("2025-01-15"),
  className,
}: UrgencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [daysLeft, setDaysLeft] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check if banner was dismissed today
    const dismissed = localStorage.getItem("urgency-banner-dismissed")
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const today = new Date()
      // Reset if dismissed on a different day
      if (dismissedDate.toDateString() !== today.toDateString()) {
        localStorage.removeItem("urgency-banner-dismissed")
      } else {
        setIsVisible(false)
        return
      }
    }

    // Calculate days left
    const now = new Date()
    const diffTime = schoolStartDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    setDaysLeft(diffDays)
  }, [schoolStartDate])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem("urgency-banner-dismissed", new Date().toISOString())
  }

  // Don't render during SSR or if school already started
  if (!mounted || daysLeft === null || daysLeft < 0) {
    return null
  }

  // Different urgency levels based on days left
  const getUrgencyConfig = () => {
    if (daysLeft <= 3) {
      return {
        variant: "critical" as const,
        icon: AlertTriangle,
        message: daysLeft === 0
          ? "School starts TODAY!"
          : daysLeft === 1
            ? "School starts TOMORROW!"
            : `Only ${daysLeft} days left!`,
        subtext: "Order now for same-day preparation",
        bgClass: "bg-red-600",
        textClass: "text-white",
      }
    }
    if (daysLeft <= 7) {
      return {
        variant: "urgent" as const,
        icon: Clock,
        message: `${daysLeft} days until school starts`,
        subtext: "Order now for guaranteed delivery",
        bgClass: "bg-amber-500",
        textClass: "text-amber-950",
      }
    }
    if (daysLeft <= 14) {
      return {
        variant: "warning" as const,
        icon: Clock,
        message: `${daysLeft} days until school starts`,
        subtext: "Beat the rush - order your stationery today",
        bgClass: "bg-primary",
        textClass: "text-white",
      }
    }
    return {
      variant: "info" as const,
      icon: Sparkles,
      message: "Back to School 2025",
      subtext: "Get ready with Blaqmart - best prices guaranteed",
      bgClass: "bg-gradient-to-r from-primary to-primary/80",
      textClass: "text-white",
    }
  }

  const config = getUrgencyConfig()
  const Icon = config.icon

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className={cn("overflow-hidden", className)}
        >
          <div
            className={cn(
              "relative py-2 px-4 md:py-2.5",
              config.bgClass,
              config.textClass
            )}
          >
            <div className="container flex items-center justify-center gap-2 text-center text-sm md:text-base">
              <motion.div
                animate={config.variant === "critical" ? { scale: [1, 1.2, 1] } : {}}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <Icon className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
              </motion.div>

              <div className="flex flex-col items-center sm:flex-row sm:gap-2">
                <span className="font-bold">{config.message}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-xs sm:text-sm opacity-90">{config.subtext}</span>
              </div>

              <button
                onClick={handleDismiss}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Animated progress bar for critical urgency */}
            {config.variant === "critical" && (
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-white/50"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 30, ease: "linear", repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
