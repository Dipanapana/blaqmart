'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface Grade {
    id: string
    name: string
    slug: string
}

interface StickyGradeStoriesProps {
    grades: Grade[]
    activeGrade?: string
}

export function StickyGradeStories({ grades, activeGrade }: StickyGradeStoriesProps) {
    return (
        <div className="sticky top-14 z-40 bg-white border-b border-gray-100 py-2 shadow-sm">
            <div className="w-full overflow-x-auto no-scrollbar">
                <div className="flex gap-3 px-4 min-w-max">
                    {grades.map((grade) => {
                        const isActive = activeGrade === grade.slug
                        return (
                            <Link
                                key={grade.id}
                                href={`/grades/${grade.slug}`}
                                className={cn(
                                    "flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {grade.name.replace('Grade ', '')}
                            </Link>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
