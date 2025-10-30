'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Store } from 'lucide-react';
import { useCartStore, CartItem as CartItemType } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCartStore();

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < item.stock) {
      updateQuantity(item.productId, item.quantity + 1);
    }
  };

  const handleRemove = () => {
    if (confirm(`Remove ${item.name} from cart?`)) {
      removeItem(item.productId);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/products/${item.productId}`}
          className="relative w-24 h-24 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden"
        >
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="w-8 h-8 text-gray-300" />
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.productId}`}>
            <h3 className="font-semibold text-lg truncate hover:text-green-600 transition-colors">
              {item.name}
            </h3>
          </Link>
          <p className="text-sm text-gray-600 mb-2">{item.storeName}</p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Quantity Controls */}
              <div className="flex items-center border border-gray-300 rounded-lg">
                <button
                  onClick={handleDecrease}
                  disabled={item.quantity <= 1}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={item.quantity >= item.stock}
                  className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Stock Warning */}
              {item.quantity >= item.stock && (
                <span className="text-xs text-orange-600 font-medium">
                  Max stock
                </span>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-sm text-gray-500">
                {formatCurrency(item.price)} × {item.quantity}
              </p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(itemTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg h-fit transition-colors"
          aria-label="Remove from cart"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
