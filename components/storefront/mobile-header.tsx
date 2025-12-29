'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CartSheet } from '@/components/storefront/cart-sheet'
import { Logo } from '@/components/shared/logo'

interface MobileHeaderProps {
    onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    return (
        <header
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out',
                isScrolled ? 'h-12 bg-white/80 backdrop-blur-md shadow-sm' : 'h-14 bg-white'
            )}
        >
            <div className="container h-full flex items-center justify-between px-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={onMenuClick} className="-ml-2">
                        <Menu className="h-6 w-6 text-primary" />
                    </Button>
                </div>

                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                    <Logo size={isScrolled ? "sm" : "md"} />
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-primary">
                        <Search className="h-5 w-5" />
                    </Button>
                    <CartSheet />
                </div>
            </div>
        </header>
    )
}
