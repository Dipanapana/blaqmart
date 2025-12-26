'use client'

import { useState } from "react"
import { MobileHeader } from "@/components/storefront/mobile-header"
import { GradeStories } from "@/components/storefront/grade-stories"
import { HeroCarousel } from "@/components/storefront/hero-carousel"
import { QuickActions } from "@/components/storefront/quick-actions"
import { FeaturedPacks } from "@/components/storefront/featured-packs"
import { TrustBar } from "@/components/storefront/trust-bar"
import { ProductGrid } from "@/components/storefront/product-grid"
import { MobileNavOverlay } from "@/components/storefront/mobile-nav-overlay"

interface MobileHomepageWrapperProps {
    grades: any[]
    transformedPacks: any[]
    transformedProducts: any[]
}

export function MobileHomepageWrapper({
    grades,
    transformedPacks,
    transformedProducts
}: MobileHomepageWrapperProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <div className="min-h-screen bg-white pb-20">
            <MobileHeader onMenuClick={() => setIsMenuOpen(true)} />

            <main className="pt-14">
                <HeroCarousel />
                <QuickActions />
                <FeaturedPacks packs={transformedPacks} />

                {/* Shop by Grade section - for school supplies */}
                <section className="py-6">
                    <div className="container px-4 mb-2">
                        <h2 className="text-lg font-bold text-primary">Shop by Grade</h2>
                        <p className="text-sm text-gray-500">Find school stationery for every grade</p>
                    </div>
                    <GradeStories grades={grades} />
                </section>

                <TrustBar />
                <ProductGrid initialProducts={transformedProducts} />
            </main>

            <MobileNavOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                grades={grades}
            />
        </div>
    )
}
