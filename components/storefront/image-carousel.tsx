'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Heart, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ImageCarouselProps {
    images: string[]
    productName: string
}

export function ImageCarousel({ images, productName }: ImageCarouselProps) {
    const [current, setCurrent] = useState(0)
    const router = useRouter()

    const handleSwipe = (direction: number) => {
        if (direction > 0) {
            setCurrent((prev) => (prev + 1) % images.length)
        } else {
            setCurrent((prev) => (prev - 1 + images.length) % images.length)
        }
    }

    return (
        <div className="relative aspect-square w-full bg-white">
            {/* Header Actions */}
            <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
                    onClick={() => router.back()}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
                        <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white">
                        <Share2 className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Images */}
            <div className="relative h-full w-full overflow-hidden">
                <AnimatePresence initial={false} custom={current}>
                    <motion.div
                        key={current}
                        custom={current}
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="absolute inset-0"
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={(e, { offset, velocity }) => {
                            const swipe = swipePower(offset.x, velocity.x)
                            if (swipe < -swipeConfidenceThreshold) {
                                handleSwipe(1)
                            } else if (swipe > swipeConfidenceThreshold) {
                                handleSwipe(-1)
                            }
                        }}
                    >
                        {images[current] ? (
                            <Image
                                src={images[current]}
                                alt={`${productName} - Image ${current + 1}`}
                                fill
                                className="object-contain p-8"
                                priority
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gray-50">
                                <span className="text-4xl">📸</span>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Indicators */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrent(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === current ? 'w-6 bg-primary' : 'w-2 bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

const swipeConfidenceThreshold = 10000
const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity
}
