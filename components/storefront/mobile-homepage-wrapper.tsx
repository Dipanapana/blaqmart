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
            <MobileHeader onMenuClick={() => setIsMenuOpen(true)} cartItemCount={0} />

            <main className="pt-14">
                <GradeStories grades={grades} />
                <HeroCarousel />
                <QuickActions />
                <FeaturedPacks packs={transformedPacks} />
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
