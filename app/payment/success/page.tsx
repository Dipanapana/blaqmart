'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store/cart-store';
import { CheckCircle, Package, Loader2, Home } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart on successful payment
    clearCart();

    // Fetch order details
    async function fetchOrder() {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, clearCart]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Success Message */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your order. We've received your payment and your order is being processed.
          </p>

          {order && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">Order Number</p>
              <p className="text-2xl font-bold text-green-600">{order.orderNumber}</p>
            </div>
          )}

          {/* Order Details */}
          {order && (
            <div className="mt-6 border-t pt-6 text-left">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Order Details
              </h2>

              <div className="space-y-3 mb-4">
                {order.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-medium">
                    {order.deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(order.deliveryFee)
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold">Total Paid</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(order.total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Delivery Address:</strong><br />
                  {order.deliveryAddress}
                </p>
                <p className="text-sm text-blue-800 mt-2">
                  <strong>Contact:</strong> {order.customerPhone}
                </p>
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">What happens next?</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>✓ You'll receive an SMS confirmation shortly</li>
              <li>✓ The vendor will prepare your order</li>
              <li>✓ A driver will deliver your order within 45 minutes</li>
              <li>✓ You can track your order status in real-time</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            {order && (
              <Link
                href={`/orders/${order.id}`}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
              >
                Track Order
              </Link>
            )}
            <Link
              href="/"
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
