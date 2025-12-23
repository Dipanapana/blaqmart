"use client"

import Link from "next/link"
import Image from "next/image"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useCart } from "@/hooks/use-cart"
import { formatPrice } from "@/lib/utils"
import { EmptyState } from "@/components/shared/empty-state"

export default function CartPage() {
  const {
    items,
    giftMessage,
    updateQuantity,
    removeItem,
    setGiftMessage,
    subtotal,
    clearCart,
  } = useCart()

  const deliveryThreshold = 500
  const deliveryFee = subtotal() >= deliveryThreshold ? 0 : 50
  const remaining = deliveryThreshold - subtotal()
  const total = subtotal() + deliveryFee

  if (items.length === 0) {
    return (
      <div className="container py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added any products yet. Start shopping to fill your cart!"
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      </div>
    )
  }

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{items.length} items</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear Cart
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id}>
                  <div className="flex gap-4">
                    <div className="relative h-24 w-24 overflow-hidden rounded-md bg-muted">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.price)} each
                      </p>
                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.stock}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-medium">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="mt-4" />
                </div>
              ))}

              {/* Gift Message */}
              <div className="pt-4">
                <Label htmlFor="giftMessage">Gift Message (Optional)</Label>
                <Textarea
                  id="giftMessage"
                  placeholder="Add a personal message to your order..."
                  value={giftMessage || ""}
                  onChange={(e) => setGiftMessage(e.target.value || null)}
                  className="mt-2"
                  maxLength={200}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {(giftMessage?.length || 0)}/200 characters
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Free delivery progress */}
              {remaining > 0 && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-sm">
                    Add{" "}
                    <span className="font-semibold text-primary">
                      {formatPrice(remaining)}
                    </span>{" "}
                    more for free delivery!
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted-foreground/20">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{
                        width: `${Math.min(
                          (subtotal() / deliveryThreshold) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(subtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {deliveryFee === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPrice(deliveryFee)
                    )}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button asChild size="lg" className="w-full">
                <Link href="/checkout">
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>

              <Button variant="outline" asChild className="w-full">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
