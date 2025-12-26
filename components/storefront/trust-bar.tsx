'use client'

import { Truck, Shield, CreditCard, Award } from 'lucide-react'

const features = [
    { icon: Truck, label: 'Free Local Delivery', sub: 'Warrenton & Jan Kemp' },
    { icon: Award, label: 'Quality Guaranteed', sub: 'Top Brands Only' },
    { icon: CreditCard, label: 'Secure Payment', sub: 'Yoco & PayFast' },
    { icon: Shield, label: 'Buyer Protection', sub: 'Safe Shopping' },
]

export function TrustBar() {
    return (
        <section className="border-y border-gray-100 bg-white py-4">
            <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-6 px-4 min-w-max">
                    {features.map((feature) => (
                        <div key={feature.label} className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/5 text-primary">
                                <feature.icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">{feature.label}</span>
                                <span className="text-xs text-gray-500">{feature.sub}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
