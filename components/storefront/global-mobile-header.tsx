'use client'

import { useState } from 'react'
import { MobileHeader } from './mobile-header'
import { MobileNavOverlay } from './mobile-nav-overlay'
import { SearchModal } from './search-modal'

export function GlobalMobileHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    return (
        <>
            <div className="md:hidden">
                <MobileHeader
                    onMenuClick={() => setIsMenuOpen(true)}
                    onSearchClick={() => setIsSearchOpen(true)}
                />
            </div>

            <MobileNavOverlay
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                grades={[]}
            />

            <SearchModal
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
            />
        </>
    )
}
