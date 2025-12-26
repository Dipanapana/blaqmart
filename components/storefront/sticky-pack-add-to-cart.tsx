'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'
import { formatPrice } from '@/lib/utils'
import { triggerCartConfetti } from '@/components/shared/confetti'
import { cn } from '@/lib/utils'

interface StickyPackAddToCartProps {
    pack: {
        id: string
        name: string
        price: number
        image?: string
    }
    isInline?: boolean
}

export function StickyPackAddToCart({ pack, isInline = false }: StickyPackAddToCartProps) {
    const [quantity, setQuantity] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const { addItem } = useCart()

    const handleAddToCart = async () => {
        setIsAdding(true)

        // Add to cart with quantity
        for (let i = 0; i < quantity; i++) {
            addItem({
                productId: pack.id,
                name: pack.name,
                price: pack.price,
                image: pack.image || '',
                stock: 999, // Packs don't have stock limits
            })
        }

        triggerCartConfetti()
        toast.success(`Added ${quantity} x ${pack.name} to cart`)

        setShowSuccess(true)
        setTimeout(() => {
            setShowSuccess(false)
            setQuantity(1)
        }, 2000)

        setIsAdding(false)
    }

    const increment = () => {
        if (quantity < 10) setQuantity(q => q + 1)
    }

    const decrement = () => {
        if (quantity > 1) setQuantity(q => q - 1)
    }

    // Inline version for desktop
    if (isInline) {
        return (
            <div className="flex items-center gap-4">
                {/* Quantity Controls */}
                <div className="flex items-center rounded-xl bg-gray-100 p-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-lg hover:bg-white hover:shadow-sm"
                        onClick={decrement}
                        disabled={quantity <= 1}
                    >
                        <Minus className="h-5 w-5" />
                    </Button>
                    <span className="w-12 text-center font-bold text-lg">{quantity}</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-lg hover:bg-white hover:shadow-sm"
                        onClick={increment}
                        disabled={quantity >= 10}
                    >
                        <Plus className="h-5 w-5" />
                    </Button>
                </div>

                {/* Add Button */}
                <Button
                    className={cn(
                        "flex-1 font-bold h-14 rounded-xl text-lg transition-all",
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
                                Add Pack to Cart - {formatPrice(pack.price * quantity)}
                            </motion.span>
                        )}
                    </AnimatePresence>
                </Button>
            </div>
        )
    }

    // Sticky mobile version
    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] lg:hidden"
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
                            disabled={quantity >= 10}
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
                                    Added!
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
                                    Add Pack - {formatPrice(pack.price * quantity)}
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
