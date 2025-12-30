"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const WHATSAPP_NUMBER = "27794022296"

interface WhatsAppButtonProps {
  message?: string
  variant?: "floating" | "inline" | "icon"
  className?: string
  children?: React.ReactNode
}

function encodeWhatsAppMessage(message: string): string {
  return encodeURIComponent(message)
}

function getWhatsAppUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeWhatsAppMessage(message)}`
}

export function WhatsAppButton({
  message = "Hi! I'd like to place an order from Blaqmart Stationery.",
  variant = "inline",
  className,
  children,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    window.open(getWhatsAppUrl(message), "_blank", "noopener,noreferrer")
  }

  if (variant === "floating") {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2",
          className
        )}
        aria-label="Contact us on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" fill="currentColor" />
      </button>
    )
  }

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={cn("text-[#25D366] hover:bg-[#25D366]/10", className)}
        aria-label="Order via WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      className={cn("bg-[#25D366] hover:bg-[#128C7E] text-white", className)}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      {children || "Order via WhatsApp"}
    </Button>
  )
}

// Pre-built message templates
export function ProductWhatsAppButton({
  productName,
  price,
  quantity = 1,
  className,
}: {
  productName: string
  price: number
  quantity?: number
  className?: string
}) {
  const message = `Hi! I'd like to order:\n\n${productName}\nQuantity: ${quantity}\nPrice: R${(price * quantity).toFixed(2)}\n\nPlease confirm availability.`

  return (
    <WhatsAppButton message={message} variant="inline" className={className}>
      Order via WhatsApp
    </WhatsAppButton>
  )
}

export function SchoolListWhatsAppButton({
  schoolName,
  gradeName,
  totalPrice,
  className,
}: {
  schoolName: string
  gradeName: string
  totalPrice: number
  className?: string
}) {
  const message = `Hi! I'd like to order the complete stationery list for:\n\nSchool: ${schoolName}\nGrade: ${gradeName}\nEstimated Total: R${totalPrice.toFixed(2)}\n\nPlease confirm availability and pricing.`

  return (
    <WhatsAppButton message={message} variant="inline" className={className}>
      Order List via WhatsApp
    </WhatsAppButton>
  )
}

export function FloatingWhatsAppButton() {
  return <WhatsAppButton variant="floating" />
}
