'use client'

import { useState } from 'react'
import { ImageCarousel } from "@/components/storefront/image-carousel"
import { StickyAddToCart } from "@/components/storefront/sticky-add-to-cart"
import { MobileHeader } from "@/components/storefront/mobile-header"
import { MobileNavOverlay } from "@/components/storefront/mobile-nav-overlay"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { formatPrice } from "@/lib/utils"
import { ProductGrid } from "@/components/storefront/product-grid"

interface MobileProductDetailWrapperProps {
    product: any
    relatedProducts: any[]
    grades: any[] // For the nav overlay
}

export function MobileProductDetailWrapper({
    product,
    relatedProducts,
    grades
}: MobileProductDetailWrapperProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    const isOnSale = product.comparePrice && product.comparePrice > product.price
    const isOutOfStock = product.stock <= 0

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Header is hidden on scroll in design, but for now we keep it or make it transparent */}
            {/* Actually, the design often has a transparent header over the image or a back button. 
          The ImageCarousel has its own back button. 
          But we might want the global header available too if they scroll down. 
          For now, let's keep the global header but maybe it should be hidden initially?
          Let's just use the standard MobileHeader for consistency, but maybe overlay it?
          The ImageCarousel has a back button, so maybe we don't need the header immediately.
          Let's include it but maybe make it conditional or just standard.
          Standard is safer for navigation.
      */}
            <MobileHeader onMenuClick={() => setIsMenuOpen(true)} />

            <main className="pt-14">
                <ImageCarousel images={product.images} productName={product.name} />

                <div className="container px-4 py-6 space-y-6">
                    {/* Title and Price */}
                    <div className="space-y-2">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">{product.category.name}</p>
                                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.name}</h1>
                            </div>
                            {isOnSale && (
                                <Badge variant="destructive" className="shrink-0">
                                    Sale
                                </Badge>
                            )}
                        </div>

                        <div className="flex items-baseline gap-3">
                            <span className="text-3xl font-bold text-primary">
                                {formatPrice(product.price)}
                            </span>
                            {isOnSale && (
                                <span className="text-lg text-gray-400 line-through">
                                    {formatPrice(product.comparePrice)}
                                </span>
                            )}
                        </div>

                        {/* Stock Status */}
                        <div>
                            {isOutOfStock ? (
                                <Badge variant="secondary">Out of Stock</Badge>
                            ) : product.stock <= 5 ? (
                                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200">
                                    Only {product.stock} left
                                </Badge>
                            ) : (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">
                                    In Stock
                                </Badge>
                            )}
                        </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* Accordions */}
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="description">
                            <AccordionTrigger>Description</AccordionTrigger>
                            <AccordionContent className="text-gray-600 leading-relaxed">
                                {product.description || "No description available."}
                                {product.tags.length > 0 && (
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {product.tags.map((tag: string) => (
                                            <Badge key={tag} variant="secondary" className="font-normal">
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                )}
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="delivery">
                            <AccordionTrigger>Delivery Information</AccordionTrigger>
                            <AccordionContent className="text-gray-600 space-y-2">
                                <p><strong>Same-Day Delivery:</strong> Order before 2pm for same-day delivery in Pretoria.</p>
                                <p><strong>Delivery Areas:</strong> We deliver to Pretoria Central, East, North, and Centurion.</p>
                                <p><strong>Free Delivery:</strong> On orders over R500.</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="returns">
                            <AccordionTrigger>Returns Policy</AccordionTrigger>
                            <AccordionContent className="text-gray-600">
                                If you're not satisfied with your purchase, you can return it within 7 days for a full refund or exchange, provided it is in its original condition and packaging.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    {/* Related Products */}
                    {relatedProducts.length > 0 && (
                        <div className="pt-8">
                            <h2 className="text-xl font-bold mb-4">You Might Also Like</h2>
                            <ProductGrid initialProducts={relatedProducts} />
                        </div>
                    )}
                </div>
            </main>

            <StickyAddToCart product={product} />

            <MobileNavOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                grades={grades}
            />
        </div>
    )
}
