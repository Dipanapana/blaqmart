'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import ReviewForm from '@/components/reviews/ReviewForm';
import { ArrowLeft, Loader2, Package, Store, TruckIcon } from 'lucide-react';

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  store: {
    id: string;
    name: string;
  };
  driver?: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
  }>;
}

export default function OrderReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);

        if (res.ok) {
          const data = await res.json();

          // Check if order is delivered
          if (data.status !== 'DELIVERED') {
            setError('You can only review delivered orders');
            return;
          }

          setOrder({
            id: data.id,
            orderNumber: data.orderNumber,
            status: data.status,
            store: data.store,
            driver: data.driver,
            items: data.items.map((item: any) => ({
              id: item.id,
              productId: item.productId,
              productName: item.product?.name || 'Product',
              quantity: item.quantity,
            })),
          });
        } else {
          setError('Order not found');
        }
      } catch (err) {
        setError('Failed to load order');
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12 flex justify-center items-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-semibold mb-4">
              {error || 'Order not found'}
            </p>
            <Link
              href="/orders"
              className="text-green-600 hover:underline font-medium"
            >
              Back to Orders
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leave a Review</h1>
          <p className="text-gray-600">
            Order #{order.orderNumber}
          </p>
        </div>

        <div className="space-y-8">
          {/* Store Review */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{order.store.name}</h2>
                <p className="text-sm text-gray-600">Rate your store experience</p>
              </div>
            </div>
            <ReviewForm
              type="store"
              storeId={order.store.id}
              orderId={order.id}
            />
          </div>

          {/* Product Reviews */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Rate Products</h2>
                <p className="text-sm text-gray-600">
                  Review each product from your order
                </p>
              </div>
            </div>

            <div className="space-y-6">
              {order.items.map((item) => (
                <div key={item.id} className="border-t pt-6 first:border-0 first:pt-0">
                  <h3 className="font-medium mb-4">
                    {item.productName} (x{item.quantity})
                  </h3>
                  <ReviewForm
                    type="product"
                    productId={item.productId}
                    orderId={order.id}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Driver Review */}
          {order.driver && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <TruckIcon className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">Rate Your Driver</h2>
                  <p className="text-sm text-gray-600">
                    How was your delivery experience?
                  </p>
                </div>
              </div>
              <ReviewForm
                type="driver"
                driverId={order.driver.id}
                orderId={order.id}
              />
            </div>
          )}
        </div>

        {/* Done Button */}
        <div className="mt-8">
          <Link
            href="/orders"
            className="block w-full py-3 bg-gray-100 text-gray-700 text-center rounded-lg hover:bg-gray-200 font-semibold"
          >
            Done - Back to Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
