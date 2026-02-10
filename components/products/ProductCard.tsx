'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  stock: number;
  isActive: boolean;
  category?: string;
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
  const categoryLabel = product.category === 'SECURITY_DASHCAM'
    ? 'Dashcam'
    : product.category === 'SECURITY_ACCESSORY'
    ? 'Accessory'
    : null;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="bg-slate-800 rounded-xl border border-slate-700 hover:border-slate-600 overflow-hidden group"
    >
      {/* Product Image */}
      <Link href={`/products/${product.id}`} className="block relative h-48 bg-slate-900">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="w-12 h-12 text-slate-600" />
          </div>
        )}

        {/* Out of stock badge */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Category badge */}
        {categoryLabel && (
          <div className="absolute top-3 left-3">
            <span className="bg-blue-600/90 text-white px-2.5 py-1 rounded-full text-xs font-semibold">
              {categoryLabel}
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${product.id}`}>
          <h3 className="font-semibold text-base text-white mb-1 line-clamp-1 hover:text-blue-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.description && (
          <p className="text-sm text-slate-400 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Price and Action */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-xl font-bold text-blue-400">
              {formatCurrency(product.price)}
            </span>
            {product.stock > 0 && product.stock <= 10 && (
              <p className="text-xs text-amber-500 mt-0.5">
                Only {product.stock} left
              </p>
            )}
          </div>

          <button
            onClick={() => onAddToCart?.(product)}
            disabled={product.stock === 0}
            className="px-3.5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}
