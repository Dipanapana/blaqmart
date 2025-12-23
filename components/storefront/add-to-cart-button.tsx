"use client"

import { useState } from "react"
import { Minus, Plus, ShoppingCart, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/hooks/use-cart"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image: string
    stock: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem, getItem, updateQuantity } = useCart()

  const cartItem = getItem(product.id)
  const isOutOfStock = product.stock <= 0
  const maxQuantity = product.stock - (cartItem?.quantity || 0)

  const handleAddToCart = () => {
    if (isOutOfStock || quantity <= 0) return

    for (let i = 0; i < quantity; i++) {
      addItem({
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        stock: product.stock,
      })
    }

    setIsAdded(true)
    setTimeout(() => setIsAdded(false), 2000)
    setQuantity(1)
  }

  const incrementQuantity = () => {
    if (quantity < maxQuantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  if (cartItem) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-lg font-medium">
            {cartItem.quantity}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
            disabled={cartItem.quantity >= product.stock}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          <Check className="mr-1 inline h-4 w-4 text-success" />
          {cartItem.quantity} in your cart
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center rounded-md border">
          <Button
            variant="ghost"
            size="icon"
            onClick={decrementQuantity}
            disabled={quantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={incrementQuantity}
            disabled={quantity >= maxQuantity}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          {isAdded ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              {isOutOfStock ? "Out of Stock" : "Add to Cart"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
