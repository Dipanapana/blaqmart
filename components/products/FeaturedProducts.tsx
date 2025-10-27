'use client';

import { Crown } from 'lucide-react';
import ProductCard from './ProductCard';

interface Store {
  id: string;
  name: string;
  subscriptionTier: string;
  products: Array<{
    id: string;
    name: string;
    description: string | null;
    price: number;
    imageUrl: string | null;
    stock: number;
    isActive: boolean;
  }>;
}

interface FeaturedProductsProps {
  stores: Store[];
}

export default function FeaturedProducts({ stores }: FeaturedProductsProps) {
  if (stores.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-yellow-50 to-orange-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-6 h-6 text-yellow-600" />
          <h3 className="text-2xl font-bold">Featured Stores</h3>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full font-medium">
            Premium
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => (
            <div key={store.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold">{store.name}</h4>
                <Crown className="w-5 h-5 text-yellow-500" />
              </div>

              <div className="space-y-3">
                {store.products.slice(0, 3).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-500 line-clamp-1">
                        {product.description}
                      </p>
                    </div>
                    <span className="font-bold text-green-600 ml-3">
                      R{product.price.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
                View Store
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
