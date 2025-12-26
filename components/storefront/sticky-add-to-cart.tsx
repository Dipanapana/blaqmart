'use client'

import { useState } from 'react'
import { ShoppingCart, Minus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { useCart } from '@/hooks/use-cart'

interface StickyAddToCartProps {
    product: {
        id: string
        name: string
        price: number
        images?: string[]
        stock: number
    }
}

export function StickyAddToCart({ product }: StickyAddToCartProps) {
    const [quantity, setQuantity] = useState(1)
    const [isAdding, setIsAdding] = useState(false)
    const { addItem } = useCart()

    const handleAddToCart = async () => {
        setIsAdding(true)

        // Add to cart with quantity
        for (let i = 0; i < quantity; i++) {
            addItem({
                productId: product.id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || '',
                stock: product.stock,
            })
        }

        toast.success(`Added ${quantity} x ${product.name} to cart`)
        setQuantity(1) // Reset quantity
        setIsAdding(false)
    }

    const increment = () => {
        if (quantity < product.stock) setQuantity(q => q + 1)
    }

    const decrement = () => {
        if (quantity > 1) setQuantity(q => q - 1)
    }

    if (product.stock <= 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
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
                            disabled={quantity >= product.stock}
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Add Button */}
                    <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl text-base"
                        onClick={handleAddToCart}
                        disabled={isAdding}
                    >
                        {isAdding ? (
                            <span className="animate-pulse">Adding...</span>
                        ) : (
                            <>
                                <ShoppingCart className="mr-2 h-5 w-5" />
                                Add to Cart - R{product.price * quantity}
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
