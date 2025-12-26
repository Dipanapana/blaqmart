'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useInView } from 'framer-motion'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice: number | null
  images: string[]
  isFeatured: boolean
  stock: number
}

interface ProductGridProps {
  initialProducts: Product[]
}

export function ProductGrid({ initialProducts }: ProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [loading, setLoading] = useState(false)
  const loadMoreRef = useRef(null)
  const isInView = useInView(loadMoreRef)

  // Simulated infinite scroll
  useEffect(() => {
    if (isInView && !loading) {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        // In a real app, we would fetch more products here
        // For now, we just duplicate the existing products to show the effect
        setProducts(prev => [...prev, ...initialProducts])
        setLoading(false)
      }, 1500)
    }
  }, [isInView, loading, initialProducts])

  return (
    <section className="py-8 bg-gray-50">
      <div className="container px-4">
        <h2 className="text-xl font-bold text-primary mb-4">Just For You</h2>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {products.map((product, index) => (
            <Card key={`${product.id}-${index}`} className="group overflow-hidden border-none shadow-sm hover:shadow-md transition-all rounded-xl">
              <Link href={`/products/${product.slug}`}>
                <div className="relative aspect-square bg-white p-4">
                  {product.images[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-contain transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
                      <span className="text-2xl">✏️</span>
                    </div>
                  )}
                  {product.comparePrice && (
                    <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none text-[10px]">
                      -{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}%
                    </Badge>
                  )}
                </div>
              </Link>

              <CardContent className="p-3 bg-white">
                <Link href={`/products/${product.slug}`}>
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 h-10 mb-2 group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex flex-col">
                    <span className="font-bold text-primary">R{product.price}</span>
                    {product.comparePrice && (
                      <span className="text-[10px] text-gray-400 line-through">R{product.comparePrice}</span>
                    )}
                  </div>
                  <Button size="icon" className="h-8 w-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm transition-colors">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Skeleton Loading State */}
          {loading && Array.from({ length: 4 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="overflow-hidden border-none shadow-sm rounded-xl">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <CardContent className="p-3 bg-white">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2 animate-pulse" />
                <div className="flex justify-between items-center mt-2">
                  <div className="h-5 bg-gray-200 rounded w-1/3 animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Infinite scroll trigger */}
        <div ref={loadMoreRef} className="h-10 w-full" />
      </div>
    </section>
  )
}
