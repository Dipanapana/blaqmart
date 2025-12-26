'use client'

import Link from 'next/link'
import { X, ChevronRight, Phone, Package, BookOpen, School, Info, HelpCircle, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'

interface MobileNavOverlayProps {
    isOpen: boolean
    onClose: () => void
    grades: { id: string; name: string; slug: string }[]
}

export function MobileNavOverlay({ isOpen, onClose, grades }: MobileNavOverlayProps) {
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

                    {/* Menu Panel */}
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 left-0 z-50 w-[85%] max-w-sm bg-white shadow-2xl overflow-y-auto"
                    >
                        <div className="flex flex-col min-h-full">
                            {/* Header */}
                            <div className="p-4 flex items-center justify-between border-b">
                                <span className="font-bold text-xl text-primary">Menu</span>
                                <Button variant="ghost" size="icon" onClick={onClose}>
                                    <X className="h-6 w-6" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 p-4 space-y-6">
                                {/* Shop by Grade */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Shop by Grade</h3>
                                    <div className="grid grid-cols-4 gap-2">
                                        {grades.map((grade) => (
                                            <Link
                                                key={grade.id}
                                                href={`/grades/${grade.slug}`}
                                                onClick={onClose}
                                                className="flex items-center justify-center h-12 rounded-lg bg-gray-50 hover:bg-primary/5 hover:text-primary border border-gray-100 transition-colors font-medium text-sm"
                                            >
                                                {grade.name.replace('Grade ', '')}
                                            </Link>
                                        ))}
                                    </div>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Main Links */}
                                <div className="space-y-1">
                                    <Link href="/bundles" onClick={onClose} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <Package className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            <span className="font-medium text-gray-900">Bundles</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </Link>
                                    <Link href="/products" onClick={onClose} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <BookOpen className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            <span className="font-medium text-gray-900">All Products</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </Link>
                                    <Link href="/schools" onClick={onClose} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <School className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            <span className="font-medium text-gray-900">Find Your School</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </Link>
                                </div>

                                <hr className="border-gray-100" />

                                {/* Support Links */}
                                <div className="space-y-1">
                                    <Link href="/about" onClick={onClose} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <Info className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            <span className="font-medium text-gray-900">About Us</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </Link>
                                    <Link href="/contact" onClick={onClose} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <HelpCircle className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            <span className="font-medium text-gray-900">Contact Support</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </Link>
                                    <Link href="/track-order" onClick={onClose} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                                        <div className="flex items-center gap-3">
                                            <Truck className="h-5 w-5 text-gray-500 group-hover:text-primary" />
                                            <span className="font-medium text-gray-900">Track Order</span>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-gray-300" />
                                    </Link>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t bg-gray-50">
                                <Button className="w-full bg-green-500 hover:bg-green-600 text-white gap-2" size="lg" asChild>
                                    <a href="https://wa.me/27794022296">
                                        <Phone className="h-4 w-4" />
                                        WhatsApp Us
                                    </a>
                                </Button>
                                <p className="text-center text-xs text-gray-400 mt-4">
                                    © 2025 Blaqmart
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
