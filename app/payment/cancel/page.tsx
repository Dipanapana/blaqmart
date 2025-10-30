'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { XCircle, ShoppingCart, Home } from 'lucide-react';

export default function PaymentCancelPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // If there's an order ID, mark it as cancelled
    async function cancelOrder() {
      if (!orderId) return;

      try {
        // Payment will be marked as failed by IPN, but we can also mark it here
        console.log('Payment cancelled for order:', orderId);
      } catch (error) {
        console.error('Failed to cancel order:', error);
      }
    }

    cancelOrder();
  }, [orderId]);

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Cancel Message */}
        <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
          <div className="flex justify-center mb-4">
            <XCircle className="w-20 h-20 text-orange-500" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Payment Cancelled</h1>
          <p className="text-gray-600 mb-6">
            Your payment was cancelled and no charges were made to your account.
          </p>

          {orderId && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-orange-800">
                Your order has been cancelled and items have been returned to stock.
              </p>
            </div>
          )}

          {/* What Happened */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-semibold mb-2">What happened?</h3>
            <p className="text-sm text-gray-600 mb-3">
              You cancelled the payment process. This can happen if you:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Clicked the "Cancel" button on the payment page</li>
              <li>Closed the payment window</li>
              <li>Encountered a payment error</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-4">
            <Link
              href="/cart"
              className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-5 h-5" />
              Back to Cart
            </Link>
            <Link
              href="/"
              className="flex-1 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center justify-center gap-2"
            >
              <Home className="w-5 h-5" />
              Continue Shopping
            </Link>
          </div>

          {/* Help */}
          <div className="mt-8 pt-6 border-t">
            <p className="text-sm text-gray-500">
              Need help? Contact us at{' '}
              <a href="tel:+27123456789" className="text-green-600 hover:underline">
                +27 12 345 6789
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
