'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop',
        title: 'Back to School 2025',
        subtitle: 'Complete packs from R199',
        cta: 'Shop Now',
        link: '/packs'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1452860606245-08befc0ff44b?q=80&w=2070&auto=format&fit=crop',
        title: 'Premium Stationery',
        subtitle: 'Quality brands you trust',
        cta: 'View Products',
        link: '/products'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=2062&auto=format&fit=crop',
        title: 'Free Local Delivery',
        subtitle: 'Warrenton & Jan Kempdorp',
        cta: 'Learn More',
        link: '/delivery'
    }
]

export function HeroCarousel() {
    const [current, setCurrent] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent((prev) => (prev + 1) % slides.length)
        }, 4000)
        return () => clearInterval(timer)
    }, [])

    return (
        <div className="relative h-[60vh] w-full overflow-hidden bg-gray-100">
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7 }}
                    className="absolute inset-0"
                >
                    <Image
                        src={slides[current].image}
                        alt={slides[current].title}
                        fill
                        className="object-cover"
                        priority
                    />
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="absolute inset-0 flex items-end pb-12">
                <div className="container px-4">
                    <div className="max-w-md overflow-hidden rounded-2xl bg-white/10 p-6 backdrop-blur-md border border-white/20 shadow-xl">
                        <motion.h2
                            key={`title-${current}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-2xl font-bold text-white mb-2"
                        >
                            {slides[current].title}
                        </motion.h2>
                        <motion.p
                            key={`sub-${current}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-white/90 mb-4"
                        >
                            {slides[current].subtitle}
                        </motion.p>
                        <motion.div
                            key={`btn-${current}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                        >
                            <Button asChild className="w-full bg-accent hover:bg-accent/90 text-primary font-bold">
                                <Link href={slides[current].link}>
                                    {slides[current].cta}
                                    <ChevronRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Indicators */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrent(index)}
                        className={cn(
                            "h-2 rounded-full transition-all duration-300",
                            index === current ? "w-6 bg-accent" : "w-2 bg-white/50"
                        )}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    )
}
