'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Plus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Pack {
    id: string
    name: string
    slug: string
    price: number
    comparePrice: number | null
    image: string | null
    grade?: { name: string } | null
}

interface FeaturedPacksProps {
    packs: Pack[]
}

export function FeaturedPacks({ packs }: FeaturedPacksProps) {
    return (
        <section className="py-8 bg-gray-50">
            <div className="container px-4 mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-primary">Featured Packs</h2>
                <Link href="/packs" className="text-sm font-medium text-accent flex items-center">
                    See All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
            </div>

            <div className="w-full overflow-x-auto no-scrollbar pb-4">
                <div className="flex gap-4 px-4 min-w-max">
                    {packs.map((pack) => (
                        <div key={pack.id} className="w-[180px]">
                            <Card className="h-full overflow-hidden border-none shadow-md rounded-2xl">
                                <div className="relative aspect-[4/5] bg-white p-4">
                                    {pack.image ? (
                                        <Image
                                            src={pack.image}
                                            alt={pack.name}
                                            fill
                                            className="object-contain"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
                                            <span className="text-2xl">🎒</span>
                                        </div>
                                    )}
                                    {pack.comparePrice && (
                                        <Badge className="absolute top-2 left-2 bg-red-500 text-white border-none text-[10px]">
                                            Save {Math.round(((pack.comparePrice - pack.price) / pack.comparePrice) * 100)}%
                                        </Badge>
                                    )}
                                </div>

                                <CardContent className="p-3 bg-white">
                                    <div className="text-xs text-gray-500 mb-1">{pack.grade?.name || 'All Grades'}</div>
                                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 h-10 mb-2">
                                        {pack.name}
                                    </h3>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-primary">R{pack.price}</span>
                                            {pack.comparePrice && (
                                                <span className="text-[10px] text-gray-400 line-through">R{pack.comparePrice}</span>
                                            )}
                                        </div>
                                        <Button size="icon" className="h-8 w-8 rounded-full bg-accent text-primary hover:bg-accent/90 shadow-sm">
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
