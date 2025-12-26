'use client'

import { useState } from 'react'
import { SlidersHorizontal, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from '@/components/ui/slider'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterBottomSheetProps {
    categories: { id: string; name: string; slug: string }[]
}

export function FilterBottomSheet({ categories }: FilterBottomSheetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()

    const currentSort = searchParams.get('sort') || 'featured'
    const currentPriceRange = [0, 1000] // Mock range

    const handleApply = () => {
        setIsOpen(false)
        // In a real app, we would construct the URL query params here
    }

    return (
        <>
            <Button
                variant="outline"
                size="sm"
                className="fixed bottom-20 right-4 z-40 rounded-full shadow-lg bg-white border-primary text-primary h-12 px-6 gap-2"
                onClick={() => setIsOpen(true)}
            >
                <SlidersHorizontal className="h-4 w-4" />
                Filter
            </Button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl overflow-hidden max-h-[85vh] flex flex-col"
                        >
                            <div className="p-4 border-b flex items-center justify-between">
                                <h3 className="font-bold text-lg">Filters</h3>
                                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Sort By */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Sort By</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { label: 'Featured', value: 'featured' },
                                            { label: 'Price: Low to High', value: 'price-asc' },
                                            { label: 'Price: High to Low', value: 'price-desc' },
                                            { label: 'Newest', value: 'newest' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${currentSort === option.value
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900">Price Range</h4>
                                        <span className="text-sm text-gray-500">R0 - R1000+</span>
                                    </div>
                                    <Slider defaultValue={[0, 100]} max={100} step={1} />
                                </div>

                                {/* Categories */}
                                <div className="space-y-3">
                                    <h4 className="font-medium text-gray-900">Categories</h4>
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <label key={category.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                                                <div className="h-5 w-5 rounded border border-gray-300 flex items-center justify-center">
                                                    {/* Checkbox logic would go here */}
                                                </div>
                                                <span className="text-gray-700">{category.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t bg-gray-50">
                                <Button className="w-full h-12 text-lg font-bold" onClick={handleApply}>
                                    Show Results
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
