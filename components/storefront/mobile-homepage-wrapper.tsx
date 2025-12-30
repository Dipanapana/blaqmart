'use client'

import { useState } from "react"
import Link from "next/link"
import { School, ChevronRight, GraduationCap } from "lucide-react"
import { MobileHeader } from "@/components/storefront/mobile-header"
import { GradeStories } from "@/components/storefront/grade-stories"
import { HeroCarousel } from "@/components/storefront/hero-carousel"
import { QuickActions } from "@/components/storefront/quick-actions"
import { FeaturedPacks } from "@/components/storefront/featured-packs"
import { TrustBar } from "@/components/storefront/trust-bar"
import { ProductGrid } from "@/components/storefront/product-grid"
import { MobileNavOverlay } from "@/components/storefront/mobile-nav-overlay"
import { StickyCartSummary } from "@/components/storefront/sticky-cart-summary"
import { SearchModal } from "@/components/storefront/search-modal"
import { Badge } from "@/components/ui/badge"

interface TransformedSchool {
    id: string
    name: string
    slug: string
    town: string
    schoolType: string | null
    isPartner: boolean
    grades: Array<{ id: string; name: string; slug: string }>
}

interface MobileHomepageWrapperProps {
    grades: any[]
    transformedPacks: any[]
    transformedProducts: any[]
    schools?: TransformedSchool[]
}

export function MobileHomepageWrapper({
    grades,
    transformedPacks,
    transformedProducts,
    schools = []
}: MobileHomepageWrapperProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    // Group schools by type
    const primarySchools = schools.filter(s => s.schoolType === "Primary")
    const intermediateSchools = schools.filter(s => s.schoolType === "Intermediate")
    const secondarySchools = schools.filter(s => s.schoolType === "Secondary")

    return (
        <div className="min-h-screen bg-white pb-20">
            <MobileHeader
                onMenuClick={() => setIsMenuOpen(true)}
                onSearchClick={() => setIsSearchOpen(true)}
            />

            <main className="pt-14">
                <HeroCarousel />
                <QuickActions />

                {/* Shop by School section - primary navigation */}
                {schools.length > 0 && (
                    <section className="py-6 bg-gradient-to-b from-primary/5 to-transparent">
                        <div className="container px-4">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                                        <School className="h-5 w-5" />
                                        Shop by School
                                    </h2>
                                    <p className="text-sm text-gray-500">Find your school&apos;s stationery list</p>
                                </div>
                                <Link
                                    href="/schools"
                                    className="text-sm text-primary font-medium flex items-center gap-1 hover:underline"
                                >
                                    View All
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {/* Primary Schools */}
                                {primarySchools.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Primary Schools
                                        </h3>
                                        <div className="grid gap-2">
                                            {primarySchools.map((school) => (
                                                <SchoolCard key={school.id} school={school} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Intermediate Schools */}
                                {intermediateSchools.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Intermediate Schools
                                        </h3>
                                        <div className="grid gap-2">
                                            {intermediateSchools.map((school) => (
                                                <SchoolCard key={school.id} school={school} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Secondary Schools */}
                                {secondarySchools.length > 0 && (
                                    <div>
                                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                            Secondary Schools
                                        </h3>
                                        <div className="grid gap-2">
                                            {secondarySchools.map((school) => (
                                                <SchoolCard key={school.id} school={school} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                )}

                <FeaturedPacks packs={transformedPacks} />

                {/* Shop by Grade section - secondary option */}
                <section className="py-6">
                    <div className="container px-4 mb-2">
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                            <GraduationCap className="h-5 w-5" />
                            Browse by Grade
                        </h2>
                        <p className="text-sm text-gray-500">Or browse stationery by grade level</p>
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

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />

            <StickyCartSummary />
        </div>
    )
}

function SchoolCard({ school }: { school: TransformedSchool }) {
    const gradeRange = school.grades.length > 0
        ? `${school.grades[0].name} - ${school.grades[school.grades.length - 1].name}`
        : "Grades coming soon"

    return (
        <Link
            href={`/schools/${school.slug}`}
            className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:border-primary/30 hover:shadow-md transition-all"
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <School className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{school.name}</p>
                <p className="text-xs text-gray-500">{gradeRange}</p>
            </div>
            {school.isPartner && (
                <Badge variant="secondary" className="shrink-0 text-xs">
                    Partner
                </Badge>
            )}
            <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
        </Link>
    )
}
