'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ProductGallery from '@/components/products/ProductGallery';
import ShippingCalculator from '@/components/shipping/ShippingCalculator';
import ProductReviews from '@/components/reviews/ProductReviews';
import { ArrowLeft, ShoppingCart, Loader2, Camera, Shield, RotateCcw, Award, Check } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useCartStore } from '@/lib/store/cart-store';
import { motion } from 'framer-motion';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  images?: string[];
  stock: number;
  isActive: boolean;
  category?: string;
  sku?: string | null;
  specs?: Record<string, any> | null;
  store: {
    id: string;
    name: string;
    address?: string;
    phone?: string;
    subscriptionTier?: string;
  };
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        }
      } catch (error) {
        console.error('Failed to fetch product:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: crypto.randomUUID(),
      productId: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
      storeId: product.store.id,
      storeName: product.store.name,
    });

    if (quantity > 1) {
      updateQuantity(product.id, quantity);
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-slate-950">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Product Not Found</h1>
          <Link href="/" className="text-blue-400 hover:underline">
            Return to homepage
          </Link>
        </div>
      </main>
    );
  }

  const specs = product.specs || {};

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Gallery */}
          <ProductGallery
            images={product.images || []}
            productName={product.name}
          />

          {/* Info */}
          <div className="space-y-6">
            {product.category && (
              <span className="inline-flex items-center gap-1.5 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold">
                <Camera className="w-3 h-3" />
                {product.category === 'SECURITY_DASHCAM' ? 'Dashcam' : 'Accessory'}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>

            {product.sku && (
              <p className="text-sm text-slate-500">SKU: {product.sku}</p>
            )}

            {product.description && (
              <p className="text-slate-400 leading-relaxed">{product.description}</p>
            )}

            <div className="text-4xl font-bold text-blue-400">
              {formatCurrency(product.price)}
            </div>

            {/* Quick specs */}
            {Object.keys(specs).length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(specs).slice(0, 6).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 p-2.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                    <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="text-xs text-slate-300 capitalize">
                      {typeof value === 'boolean' ? key.replace(/([A-Z])/g, ' $1').trim() : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Shipping */}
            <ShippingCalculator subtotal={product.price * quantity} />

            {/* Quantity + Cart */}
            {product.stock > 0 ? (
              <div className="space-y-4 border-t border-slate-800 pt-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 border border-slate-600 rounded-lg hover:bg-slate-800 text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="w-12 text-center font-semibold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-10 h-10 border border-slate-600 rounded-lg hover:bg-slate-800 text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {product.stock <= 10 && (
                    <p className="text-sm text-amber-500 mt-2">Only {product.stock} left</p>
                  )}
                </div>

                <motion.button
                  onClick={handleAddToCart}
                  whileTap={{ scale: 0.97 }}
                  className={`w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all ${
                    addedToCart
                      ? 'bg-green-600 text-white'
                      : 'bg-blue-600 text-white hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-600/25'
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check className="w-5 h-5" />
                      Added to Cart!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" />
                      Add to Cart
                    </>
                  )}
                </motion.button>
              </div>
            ) : (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-center">
                <p className="text-red-400 font-semibold">Out of Stock</p>
              </div>
            )}

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="text-center p-2">
                <Shield className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">Secure Payment</p>
              </div>
              <div className="text-center p-2">
                <RotateCcw className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">7-Day Returns</p>
              </div>
              <div className="text-center p-2">
                <Award className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-500">1-Year Warranty</p>
              </div>
            </div>
          </div>
        </div>

        {/* Full Specs */}
        {Object.keys(specs).length > 0 && (
          <div className="mt-16 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Specifications</h2>
            <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden">
              {Object.entries(specs).map(([key, value], index) => (
                <div
                  key={key}
                  className={`flex justify-between items-center px-6 py-3.5 ${
                    index % 2 === 0 ? 'bg-slate-800/30' : ''
                  } ${index < Object.entries(specs).length - 1 ? 'border-b border-slate-700/30' : ''}`}
                >
                  <span className="text-slate-400 text-sm capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-white text-sm font-medium">
                    {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <div className="mt-16 max-w-4xl mx-auto">
          <ProductReviews productId={product.id} />
        </div>
      </div>
    </main>
  );
}
