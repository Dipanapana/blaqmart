'use client'

import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { formatPrice } from '@/lib/utils'

interface StickyCheckoutSummaryProps {
    total: number
    onContinue: () => void
    isProcessing?: boolean
    step: number
    isValid?: boolean
}

export function StickyCheckoutSummary({
    total,
    onContinue,
    isProcessing = false,
    step,
    isValid = true
}: StickyCheckoutSummaryProps) {

    const getButtonText = () => {
        switch (step) {
            case 0: return "Continue to Details"
            case 1: return "Continue to Payment"
            case 2: return "Place Order"
            default: return "Continue"
        }
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                className="fixed bottom-14 md:bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] lg:hidden"
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Total to Pay</span>
                        <span className="font-bold text-lg text-primary">{formatPrice(total)}</span>
                    </div>

                    <Button
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl"
                        onClick={onContinue}
                        disabled={isProcessing || !isValid}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                {getButtonText()} <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    )
}
