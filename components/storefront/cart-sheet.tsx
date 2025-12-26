'use client'

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { useState, useEffect } from "react"

export function CartSheet() {
    const {
        items,
        updateQuantity,
        removeItem,
        subtotal,
    } = useCart()

    const [isOpen, setIsOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) return null

    const deliveryThreshold = 500
    const deliveryFee = subtotal() >= deliveryThreshold ? 0 : 50
    const remaining = deliveryThreshold - subtotal()
    const total = subtotal() + deliveryFee
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-6 w-6" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-bold flex items-center justify-center text-primary">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] rounded-t-[20px] p-0 flex flex-col">
                <SheetHeader className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <SheetTitle>Shopping Cart ({itemCount})</SheetTitle>
                        {/* Close button is built-in but we can add custom if needed */}
                    </div>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <ShoppingBag className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
                        <p className="text-gray-500 mb-6">Looks like you haven't added any products yet.</p>
                        <Button onClick={() => setIsOpen(false)} className="w-full max-w-xs">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Free delivery progress */}
                            {remaining > 0 ? (
                                <div className="rounded-lg bg-blue-50 p-3 border border-blue-100">
                                    <p className="text-sm text-blue-800 mb-2">
                                        Add <span className="font-bold">{formatPrice(remaining)}</span> more for free delivery!
                                    </p>
                                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${Math.min((subtotal() / deliveryThreshold) * 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="rounded-lg bg-green-50 p-3 border border-green-100 flex items-center gap-2 text-green-800 text-sm font-medium">
                                    <span className="text-lg">🎉</span> You've unlocked free delivery!
                                </div>
                            )}

                            {/* Cart Items */}
                            <div className="space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-3">
                                        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            ) : (
                                                <ShoppingBag className="h-8 w-8 m-auto text-gray-400" />
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-medium text-sm line-clamp-2">{item.name}</h4>
                                                    <button
                                                        onClick={() => removeItem(item.productId)}
                                                        className="text-gray-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2">
                                                <div className="flex items-center rounded-lg border bg-white h-8">
                                                    <button
                                                        className="px-2 h-full hover:bg-gray-50 rounded-l-lg disabled:opacity-50"
                                                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="h-3 w-3" />
                                                    </button>
                                                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                                    <button
                                                        className="px-2 h-full hover:bg-gray-50 rounded-r-lg disabled:opacity-50"
                                                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                        disabled={item.quantity >= item.stock}
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                                <span className="font-semibold text-sm">
                                                    {formatPrice(item.price * item.quantity)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t bg-white space-y-4">
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal())}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Delivery</span>
                                    <span>{deliveryFee === 0 ? 'Free' : formatPrice(deliveryFee)}</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between text-lg font-bold">
                                    <span>Total</span>
                                    <span>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <Button asChild className="w-full h-12 text-base font-bold rounded-xl" onClick={() => setIsOpen(false)}>
                                <Link href="/checkout">
                                    Checkout <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </>
                )}
            </SheetContent>
        </Sheet>
    )
}
