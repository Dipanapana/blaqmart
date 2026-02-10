'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store/cart-store';
import { CheckCircle, Package, Loader2, Home, Truck } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');
  const clearCart = useCartStore((state) => state.clearCart);

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearCart();

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
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
        <div className="flex justify-center mb-4">
          <CheckCircle className="w-20 h-20 text-green-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Payment Successful!</h1>
        <p className="text-slate-400 mb-6">
          Thank you for your order. Your payment has been received and your order is being processed.
        </p>

        {order && (
          <div className="bg-blue-600/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-blue-400">{order.orderNumber}</p>
          </div>
        )}

        {order && (
          <div className="mt-6 border-t border-slate-700 pt-6 text-left">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-500" />
              Order Details
            </h2>

            <div className="space-y-3 mb-4">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium text-white">
                    {formatCurrency(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-700 pt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Subtotal</span>
                <span className="font-medium text-white">{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Shipping</span>
                <span className="font-medium">
                  {order.deliveryFee === 0 ? (
                    <span className="text-green-400">FREE</span>
                  ) : (
                    <span className="text-white">{formatCurrency(order.deliveryFee)}</span>
                  )}
                </span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between">
                <span className="font-bold text-white">Total Paid</span>
                <span className="font-bold text-blue-400">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>

            <div className="mt-6 bg-slate-700/50 rounded-lg p-4">
              <p className="text-sm text-slate-300">
                <strong className="text-white">Shipping Address:</strong><br />
                {order.deliveryAddress}
              </p>
              <p className="text-sm text-slate-300 mt-2">
                <strong className="text-white">Contact:</strong> {order.customerPhone}
              </p>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-8 bg-slate-700/30 rounded-lg p-5 text-left border border-slate-700">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <Truck className="w-5 h-5 text-blue-500" />
            What happens next?
          </h3>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">1.</span>
              You&apos;ll receive an SMS confirmation shortly
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">2.</span>
              Your order is being packed at our warehouse
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">3.</span>
              A courier will collect and deliver within 3-5 business days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5">4.</span>
              You&apos;ll receive a tracking number via SMS
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          {order && (
            <Link
              href={`/orders/${order.id}`}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-semibold transition-colors text-center"
            >
              View Order
            </Link>
          )}
          <Link
            href="/"
            className="flex-1 py-3 border border-slate-600 text-white rounded-xl hover:bg-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      <Suspense
        fallback={
          <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        }
      >
        <PaymentSuccessContent />
      </Suspense>
    </main>
  );
}
