'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface Grade {
    id: string
    name: string
    slug: string
    image?: string
}

interface GradeStoriesProps {
    grades: Grade[]
}

export function GradeStories({ grades }: GradeStoriesProps) {
    return (
        <div className="w-full overflow-x-auto no-scrollbar py-4 bg-white border-b border-gray-100">
            <div className="flex gap-4 px-4 min-w-max">
                {grades.map((grade, index) => (
                    <Link key={grade.id} href={`/grades/${grade.slug}`} className="flex flex-col items-center gap-2 group">
                        <div className="relative">
                            {/* Animated gradient ring */}
                            <div className="absolute -inset-[3px] rounded-full bg-gradient-to-tr from-accent via-primary to-accent opacity-70 group-hover:opacity-100 animate-spin-slow" />

                            <div className="relative h-16 w-16 rounded-full p-[2px] bg-white">
                                <div className="h-full w-full rounded-full overflow-hidden bg-gray-100 relative">
                                    {grade.image ? (
                                        <Image
                                            src={grade.image}
                                            alt={grade.name}
                                            fill
                                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary font-bold text-lg">
                                            {grade.name.replace('Grade ', '')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Pulsing indicator for active/new */}
                            {index === 0 && (
                                <span className="absolute bottom-0 right-0 h-4 w-4 rounded-full bg-accent border-2 border-white animate-pulse" />
                            )}
                        </div>

                        <span className="text-xs font-medium text-center text-gray-700 group-hover:text-primary transition-colors">
                            {grade.name}
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
