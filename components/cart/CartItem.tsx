'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, Trash2, Camera } from 'lucide-react';
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
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="flex gap-4">
        {/* Product Image */}
        <Link
          href={`/products/${item.productId}`}
          className="relative w-20 h-20 bg-slate-900 rounded-lg flex-shrink-0 overflow-hidden"
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
              <Camera className="w-8 h-8 text-slate-600" />
            </div>
          )}
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link href={`/products/${item.productId}`}>
            <h3 className="font-semibold text-white truncate hover:text-blue-400 transition-colors">
              {item.name}
            </h3>
          </Link>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              {/* Quantity Controls */}
              <div className="flex items-center border border-slate-600 rounded-lg">
                <button
                  onClick={handleDecrease}
                  disabled={item.quantity <= 1}
                  className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 py-1.5 font-semibold text-sm text-white min-w-[2.5rem] text-center">
                  {item.quantity}
                </span>
                <button
                  onClick={handleIncrease}
                  disabled={item.quantity >= item.stock}
                  className="p-1.5 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white"
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {item.quantity >= item.stock && (
                <span className="text-xs text-amber-500 font-medium">Max</span>
              )}
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-xs text-slate-500">
                {formatCurrency(item.price)} x {item.quantity}
              </p>
              <p className="text-lg font-bold text-blue-400">
                {formatCurrency(itemTotal)}
              </p>
            </div>
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={handleRemove}
          className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg h-fit transition-colors"
          aria-label="Remove from cart"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
