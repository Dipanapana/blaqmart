'use client'

import Link from 'next/link'
import { ShoppingCart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface StickyCartSummaryProps {
    itemCount: number
    total: number
}

export function StickyCartSummary({ itemCount, total }: StickyCartSummaryProps) {
    if (itemCount === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <ShoppingCart className="h-6 w-6 text-primary" />
                            <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-primary">
                                {itemCount}
                            </span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="font-bold text-lg text-primary">R{total}</span>
                        </div>
                    </div>

                    <Button asChild className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl">
                        <Link href="/cart">
                            Checkout <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
