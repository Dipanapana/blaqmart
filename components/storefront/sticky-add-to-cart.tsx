'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import { triggerCartConfetti } from '@/components/shared/confetti'
import { cn } from '@/lib/utils'

interface StickyAddToCartProps {
    product: {
        id: string
        name: string
        price: number
        images?: string[]
        stock?: number // Made optional - treats undefined as infinite
    }
}

export function StickyAddToCart({ product }: StickyAddToCartProps) {
    const [quantity, setQuantity] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const { addItem } = useCart()

    // Treat undefined or null stock as infinite (999)
    const effectiveStock = product.stock ?? 999

    const handleAddToCart = async () => {
        setIsAdding(true)

        // Add to cart with quantity
        for (let i = 0; i < quantity; i++) {
            addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                stock: effectiveStock,
            })
        }

        triggerCartConfetti()
        toast.success(`Added ${quantity} x ${product.name} to cart`)

        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            setQuantity(1) // Reset quantity
        }, 2000)

        setIsAdding(false)
    }

    const increment = () => {
        if (quantity < effectiveStock) setQuantity(q => q + 1)
    }

    const decrement = () => {
        if (quantity > 1) setQuantity(q => q - 1)
    }

    // Only hide if stock is explicitly 0 (not undefined)
    if (product.stock === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-14 md:bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]"
            >
                <div className="flex items-center gap-4">
                    {/* Quantity Controls */}
                    <div className="flex items-center rounded-xl bg-gray-100 p-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                            onClick={decrement}
                            disabled={quantity <= 1}
                        >
                            <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-8 text-center font-semibold">{quantity}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-10 w-10 rounded-lg hover:bg-white hover:shadow-sm"
                            onClick={increment}
                            disabled={quantity >= effectiveStock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Add Button */}
                    <Button
                        className={cn(
                            "flex-1 font-bold h-12 rounded-xl text-base transition-all",
                            showSuccess
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-primary hover:bg-primary/90"
                        )}
                        onClick={handleAddToCart}
                        disabled={isAdding}
                    >
                        <AnimatePresence mode="wait">
                            {isAdding ? (
                                <motion.span
                                    key="adding"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="animate-pulse"
                                >
                                    Adding...
                                </motion.span>
                            ) : showSuccess ? (
                                <motion.span
                                    key="success"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="flex items-center gap-2"
                                >
                                    <Check className="h-5 w-5" />
                                    Added to Cart!
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="add"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <ShoppingCart className="h-5 w-5" />
                                    Add to Cart - R{product.price * quantity}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
