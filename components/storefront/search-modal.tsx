'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Search, Loader2, Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { formatPrice } from '@/lib/utils'

interface SearchResult {
    id: string
    name: string
    slug: string
    price: number
    images: string[]
}

interface SearchModalProps {
    isOpen: boolean
    onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [recentSearches, setRecentSearches] = useState<string[]>([])

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('blaqmart_recent_searches')
        if (saved) {
            setRecentSearches(JSON.parse(saved).slice(0, 5))
        }
    }, [])

    // Save search to recent
    const saveToRecent = useCallback((term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5)
        setRecentSearches(updated)
        localStorage.setItem('blaqmart_recent_searches', JSON.stringify(updated))
    }, [recentSearches])

    // Search products
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        const searchProducts = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/products?search=${encodeURIComponent(query)}&limit=6`)
                const data = await res.json()
                if (data.success) {
                    setResults(data.data.products || [])
                }
            } catch (error) {
                console.error('Search error:', error)
            } finally {
                setLoading(false)
            }
        }

        const debounce = setTimeout(searchProducts, 300)
        return () => clearTimeout(debounce)
    }, [query])

    // Handle escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose()
        }
        if (isOpen) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = ''
        }
    }, [isOpen, onClose])

    const handleResultClick = (productName: string) => {
        saveToRecent(productName)
        onClose()
    }

    const handleRecentClick = (term: string) => {
        setQuery(term)
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-x-0 top-0 z-50 bg-white shadow-2xl max-h-[85vh] overflow-hidden flex flex-col"
                    >
                        {/* Search Input */}
                        <div className="p-4 border-b">
                            <div className="flex items-center gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Search products..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="pl-10 h-12 text-base"
                                        autoFocus
                                    />
                                    {loading && (
                                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-primary" />
                                    )}
                                </div>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>

                        {/* Results */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {!query && recentSearches.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Recent Searches</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map((term, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleRecentClick(term)}
                                                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {query && results.length === 0 && !loading && (
                                <div className="text-center py-8">
                                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No products found for &quot;{query}&quot;</p>
                                </div>
                            )}

                            {results.length > 0 && (
                                <div className="space-y-2">
                                    {results.map((product) => {
                                        const image = product.images?.[0] || '/images/placeholder.png'
                                        return (
                                            <Link
                                                key={product.id}
                                                href={`/products/${product.slug}`}
                                                onClick={() => handleResultClick(product.name)}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                                    <Image
                                                        src={image}
                                                        alt={product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium truncate">{product.name}</p>
                                                    <p className="text-sm text-primary font-medium">
                                                        {formatPrice(product.price)}
                                                    </p>
                                                </div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            )}

                            {query && results.length > 0 && (
                                <Link
                                    href={`/products?search=${encodeURIComponent(query)}`}
                                    onClick={onClose}
                                    className="block text-center text-primary font-medium py-3 mt-2 hover:underline"
                                >
                                    View all results for &quot;{query}&quot;
                                </Link>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
