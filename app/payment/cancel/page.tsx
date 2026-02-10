'use client';

import { Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { XCircle, ShoppingCart, Home, AlertTriangle, Loader2 } from 'lucide-react';

function PaymentCancelContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    async function cancelOrder() {
      if (!orderId) return;

      try {
        console.log('Payment cancelled for order:', orderId);
      } catch (error) {
        console.error('Failed to cancel order:', error);
      }
    }

    cancelOrder();
  }, [orderId]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
        <div className="flex justify-center mb-4">
          <XCircle className="w-20 h-20 text-orange-500" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">Payment Cancelled</h1>
        <p className="text-slate-400 mb-6">
          Your payment was cancelled and no charges were made to your account.
        </p>

        {orderId && (
          <div className="bg-orange-600/10 border border-orange-500/30 rounded-lg p-4 mb-6">
            <p className="text-sm text-orange-400">
              Your order has been cancelled and items have been returned to stock.
            </p>
          </div>
        )}

        {/* What Happened */}
        <div className="mt-8 bg-slate-700/30 rounded-lg p-5 text-left border border-slate-700">
          <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            What happened?
          </h3>
          <p className="text-sm text-slate-400 mb-3">
            You cancelled the payment process. This can happen if you:
          </p>
          <ul className="text-sm text-slate-400 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">&bull;</span>
              Clicked the &quot;Cancel&quot; button on the payment page
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">&bull;</span>
              Closed the payment window
            </li>
            <li className="flex items-start gap-2">
              <span className="text-orange-400 mt-0.5">&bull;</span>
              Encountered a payment error
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4">
          <Link
            href="/cart"
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-5 h-5" />
            Back to Cart
          </Link>
          <Link
            href="/"
            className="flex-1 py-3 border border-slate-600 text-white rounded-xl hover:bg-slate-700 font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-5 h-5" />
            Continue Shopping
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 pt-6 border-t border-slate-700">
          <p className="text-sm text-slate-500">
            Need help? Contact us at{' '}
            <a href="tel:+27123456789" className="text-blue-400 hover:underline">
              +27 12 345 6789
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
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
        <PaymentCancelContent />
      </Suspense>
    </main>
  );
}
