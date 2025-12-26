'use client'

import { StickyGradeStories } from "@/components/storefront/sticky-grade-stories"
import { CategoryPills } from "@/components/storefront/category-pills"
import { FilterBottomSheet } from "@/components/storefront/filter-bottom-sheet"
import { StickyCartSummary } from "@/components/storefront/sticky-cart-summary"
import { ProductGrid } from "@/components/storefront/product-grid"
import { MobileHeader } from "@/components/storefront/mobile-header"
import { MobileNavOverlay } from "@/components/storefront/mobile-nav-overlay"
import { useState } from "react"

interface MobileProductsPageWrapperProps {
    products: any[]
    categories: any[]
    grades: any[]
    pagination: any
    searchParams: any
}

export function MobileProductsPageWrapper({
    products,
    categories,
    grades,
    pagination,
    searchParams
}: MobileProductsPageWrapperProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    // Mock cart data for now
    const cartItemCount = 2
    const cartTotal = 498

    return (
        <div className="min-h-screen bg-white pb-24">
            <MobileHeader onMenuClick={() => setIsMenuOpen(true)} cartItemCount={cartItemCount} />

            <main className="pt-14">
                <StickyGradeStories grades={grades} activeGrade={searchParams.grade} />
                <CategoryPills categories={categories} activeCategory={searchParams.category} />

                <div className="container px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-lg font-bold text-primary">
                            {searchParams.featured === "true" ? "Featured Products" : "All Products"}
                            <span className="ml-2 text-sm font-normal text-gray-500">({pagination.total})</span>
                        </h1>
                    </div>

                    <ProductGrid initialProducts={products} />
                </div>
            </main>

            <FilterBottomSheet categories={categories} />
            <StickyCartSummary itemCount={cartItemCount} total={cartTotal} />

            <MobileNavOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                grades={grades}
            />
        </div>
    )
}
