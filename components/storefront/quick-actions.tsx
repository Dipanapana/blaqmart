'use client'

import Link from 'next/link'
import { Package, BookOpen, Sparkles, Calculator, PenTool, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'

const actions = [
    { label: 'Bundles', icon: Package, href: '/bundles', color: 'bg-blue-100 text-blue-700' },
    { label: 'Products', icon: BookOpen, href: '/products', color: 'bg-green-100 text-green-700' },
    { label: 'New', icon: Sparkles, href: '/products?sort=newest', color: 'bg-amber-100 text-amber-700' },
    { label: 'Calculators', icon: Calculator, href: '/categories/calculators', color: 'bg-purple-100 text-purple-700' },
    { label: 'Writing', icon: PenTool, href: '/categories/writing-instruments', color: 'bg-rose-100 text-rose-700' },
    { label: 'Delivery', icon: Truck, href: '/delivery', color: 'bg-indigo-100 text-indigo-700' },
]

export function QuickActions() {
    return (
        <div className="w-full overflow-x-auto no-scrollbar py-6">
            <div className="flex gap-3 px-4 min-w-max">
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        asChild
                        variant="outline"
                        className="h-12 rounded-full border-gray-200 px-6 shadow-sm hover:shadow-md transition-all"
                    >
                        <Link href={action.href} className="flex items-center gap-2">
                            <div className={`p-1 rounded-full ${action.color}`}>
                                <action.icon className="h-4 w-4" />
                            </div>
                            <span className="font-medium text-gray-700">{action.label}</span>
                        </Link>
                    </Button>
                ))}
            </div>
        </div>
    )
}
