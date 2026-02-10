'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import CartItem from '@/components/cart/CartItem';
import ShippingCalculator from '@/components/shipping/ShippingCalculator';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowRight, Shield, Truck, Award } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, getShippingFee, getTotal, clearCart, province } = useCartStore();

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();

  const handleCheckout = () => {
    if (!user) {
      alert('Please sign in to continue with checkout');
      router.push('/');
      return;
    }

    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Shopping Cart</h1>
          <p className="text-slate-400">
            {items.length === 0
              ? 'Your cart is empty'
              : `${items.length} item${items.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 text-center border border-slate-700">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Your cart is empty</h2>
            <p className="text-slate-400 mb-6">Browse our security products to get started</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-colors"
            >
              Browse Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}

              <button
                onClick={handleClearCart}
                className="text-sm text-slate-500 hover:text-red-400 font-medium transition-colors"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-24">
                <h2 className="text-xl font-bold text-white mb-4">Order Summary</h2>

                {/* Shipping Calculator */}
                <div className="mb-4">
                  <ShippingCalculator compact />
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal</span>
                    <span className="font-medium text-white">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-slate-400">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {!province ? (
                        <span className="text-slate-500">Select province</span>
                      ) : shippingFee === 0 ? (
                        <span className="text-green-400">FREE</span>
                      ) : (
                        <span className="text-white">{formatCurrency(shippingFee)}</span>
                      )}
                    </span>
                  </div>

                  {shippingFee > 0 && subtotal < FREE_SHIPPING_THRESHOLD && (
                    <p className="text-xs text-blue-400 bg-blue-600/10 p-2 rounded-lg border border-blue-600/20">
                      Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more for free shipping!
                    </p>
                  )}

                  <div className="border-t border-slate-700 pt-3 flex justify-between text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-blue-400">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-500 transition-all hover:shadow-lg hover:shadow-blue-600/25 mb-3"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/"
                  className="block w-full py-2 text-center text-slate-400 hover:text-white font-medium transition-colors"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t border-slate-700 space-y-2.5">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Shield className="w-4 h-4 text-blue-500" />
                    Secure Yoco checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Truck className="w-4 h-4 text-blue-500" />
                    3-5 business day nationwide shipping
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Award className="w-4 h-4 text-blue-500" />
                    1-year warranty on all products
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
