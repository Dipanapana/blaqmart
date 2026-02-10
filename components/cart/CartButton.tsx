'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';

export default function CartButton() {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <Link
      href="/cart"
      className="relative p-2 hover:bg-slate-800 rounded-lg transition-colors"
      aria-label="Shopping cart"
    >
      <ShoppingCart className="w-5 h-5 text-slate-300" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
