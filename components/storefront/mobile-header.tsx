'use client'

import { useState, useEffect } from 'react'
import { Menu, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { CartSheet } from '@/components/storefront/cart-sheet'
import { Logo } from '@/components/shared/logo'

interface MobileHeaderProps {
    onMenuClick: () => void
    onSearchClick?: () => void
}

export function MobileHeader({ onMenuClick, onSearchClick }: MobileHeaderProps) {
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
                'fixed top-0 inset-x-0 z-50 border-b transition-all duration-200',
                isScrolled ? 'h-12 bg-white/95 backdrop-blur-md shadow-sm' : 'h-14 bg-white'
            )}
        >
            <div className="flex items-center justify-between h-full px-4">
                {/* Left: Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onMenuClick}
                    className="-ml-2 shrink-0"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Center: Logo (flexbox, not absolute) */}
                <div className="flex-1 flex justify-center">
                    <Logo size={isScrolled ? "xs" : "sm"} />
                </div>

                {/* Right: Search + Cart */}
                <div className="flex items-center gap-1 shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onSearchClick}
                        className="text-muted-foreground hover:text-primary"
                    >
                        <Search className="h-5 w-5" />
                    </Button>
                    <CartSheet />
                </div>
            </div>
        </header>
    )
}
