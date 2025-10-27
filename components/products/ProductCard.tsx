'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Store, Crown } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  store: {
    id: string;
    name: string;
    subscriptionTier?: string;
  };
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isPremiumStore = product.store.subscriptionTier === 'PREMIUM' ||
                         product.store.subscriptionTier === 'ENTERPRISE';

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block relative h-48 bg-gray-100">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Store className="w-12 h-12 mx-auto mb-2" />
              <span className="text-sm">No image</span>
            </div>
          </div>
        )}

        {/* Out of stock badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold">
              Out of Stock
            </span>
          </div>
        )}

        {/* Premium badge */}
        {isPremiumStore && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <Crown className="w-3 h-3" />
            Premium
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-lg mb-1 line-clamp-1 hover:text-green-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <Link
          href={`/stores/${product.store.id}`}
          className="text-sm text-gray-600 hover:text-green-600 transition-colors mb-2 flex items-center gap-1"
        >
          <Store className="w-3 h-3" />
          {product.store.name}
        </Link>

        {product.description && (
          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(product.price)}
            </span>
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-xs text-orange-600 mt-1">
                Only {product.stock} left
              </p>
            )}
          </div>

          <button
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
