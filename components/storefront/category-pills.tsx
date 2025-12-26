'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Category {
    id: string
    name: string
    slug: string
}

interface CategoryPillsProps {
    categories: Category[]
    activeCategory?: string
}

export function CategoryPills({ categories, activeCategory }: CategoryPillsProps) {
    return (
        <div className="w-full overflow-x-auto no-scrollbar py-3 bg-white border-b border-gray-100">
            <div className="flex gap-2 px-4 min-w-max">
                <Link
                    href="/products"
                    className={cn(
                        "flex h-8 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors border",
                        !activeCategory
                            ? "bg-primary text-white border-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                    )}
                >
                    All
                </Link>
                {categories.map((category) => {
                    const isActive = activeCategory === category.slug
                    return (
                        <Link
                            key={category.id}
                            href={`/products?category=${category.slug}`}
                            className={cn(
                                "flex h-8 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors border",
                                isActive
                                    ? "bg-primary text-white border-primary"
                                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            )}
                        >
                            {category.name}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
