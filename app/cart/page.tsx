'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import CartItem from '@/components/cart/CartItem';
import { useCartStore } from '@/lib/store/cart-store';
import { formatCurrency } from '@/lib/utils';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function CartPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, getDeliveryFee, getTotal, clearCart } = useCartStore();

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  const handleCheckout = () => {
    if (!user) {
      // Redirect to login (will open modal)
      alert('Please sign in to continue with checkout');
      router.push('/');
      return;
    }

    // Navigate to checkout page
    router.push('/checkout');
  };

  const handleClearCart = () => {
    if (confirm('Are you sure you want to clear your cart?')) {
      clearCart();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-gray-600">
            {items.length === 0
              ? 'Your cart is empty'
              : `${items.length} item${items.length !== 1 ? 's' : ''} in your cart`}
          </p>
        </div>

        {items.length === 0 ? (
          /* Empty Cart State */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Add some products to get started
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        ) : (
          /* Cart with Items */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} />
              ))}

              {/* Clear Cart Button */}
              <button
                onClick={handleClearCart}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear Cart
              </button>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-medium">
                      {deliveryFee === 0 ? (
                        <span className="text-green-600">FREE</span>
                      ) : (
                        formatCurrency(deliveryFee)
                      )}
                    </span>
                  </div>

                  {deliveryFee > 0 && subtotal < 200 && (
                    <p className="text-xs text-gray-500 bg-green-50 p-2 rounded">
                      💡 Add {formatCurrency(200 - subtotal)} more for free delivery!
                    </p>
                  )}

                  <div className="border-t pt-3 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(total)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors mb-3"
                >
                  Proceed to Checkout
                </button>

                <Link
                  href="/"
                  className="block w-full py-2 text-center text-gray-600 hover:text-gray-900 font-medium"
                >
                  Continue Shopping
                </Link>

                {/* Trust Badges */}
                <div className="mt-6 pt-6 border-t space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Secure checkout
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Fast delivery (45 min or less)
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Quality guaranteed
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
