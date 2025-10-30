'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  Store,
  Loader2,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  customerPhone: string;
  estimatedTime: number | null;
  createdAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  store: {
    id: string;
    name: string;
    phone: string;
    address: string;
  };
  customer: {
    name: string | null;
    phone: string;
  };
  driver: {
    name: string | null;
    phone: string;
  } | null;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  }>;
}

const ORDER_STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', icon: Clock },
  { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircle },
  { key: 'PREPARING', label: 'Preparing', icon: Package },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', icon: Truck },
  { key: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

export default function OrderTrackingPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);

        if (!res.ok) {
          throw new Error('Failed to fetch order');
        }

        const data = await res.json();
        setOrder(data.order);
      } catch (err) {
        setError('Failed to load order details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchOrder();

      // Poll for updates every 30 seconds
      const interval = setInterval(fetchOrder, 30000);
      return () => clearInterval(interval);
    }
  }, [params.id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">{error || 'Order Not Found'}</h1>
          <Link href="/" className="text-green-600 hover:underline">
            Return to homepage
          </Link>
        </div>
      </main>
    );
  }

  const currentStatusIndex = ORDER_STATUS_STEPS.findIndex(
    (step) => step.key === order.status
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </Link>

        {/* Order Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">Order {order.orderNumber}</h1>
              <p className="text-gray-600">
                Placed on {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  order.status === 'DELIVERED'
                    ? 'bg-green-100 text-green-700'
                    : order.status === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {order.status.replace(/_/g, ' ')}
              </span>
              {order.paymentStatus === 'PAID' && (
                <p className="text-sm text-green-600 mt-1">✓ Paid</p>
              )}
            </div>
          </div>

          {/* Estimated Time */}
          {order.estimatedTime && order.status !== 'DELIVERED' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 font-medium">
                🕐 Estimated delivery: {order.estimatedTime} minutes
              </p>
            </div>
          )}
        </div>

        {/* Order Status Timeline */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-6">Order Status</h2>

          <div className="relative">
            {ORDER_STATUS_STEPS.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const Icon = step.icon;

              return (
                <div key={step.key} className="relative flex items-start mb-8 last:mb-0">
                  {/* Connector Line */}
                  {index < ORDER_STATUS_STEPS.length - 1 && (
                    <div
                      className={`absolute left-5 top-10 w-0.5 h-full -ml-px ${
                        isCompleted ? 'bg-green-600' : 'bg-gray-300'
                      }`}
                    />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isCompleted
                        ? 'bg-green-600 border-green-600'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        isCompleted ? 'text-white' : 'text-gray-400'
                      }`}
                    />
                  </div>

                  {/* Label */}
                  <div className="ml-4">
                    <h3
                      className={`font-semibold ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 text-green-600 text-sm">
                          (Current)
                        </span>
                      )}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-green-600" />
              Delivery Information
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="font-medium">{order.deliveryAddress}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Contact</p>
                <p className="font-medium">{order.customerPhone}</p>
              </div>

              {order.driver && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600 mb-1">Driver</p>
                  <p className="font-medium">{order.driver.name || 'Driver'}</p>
                  <p className="text-sm text-gray-600">{order.driver.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Store Information */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Store className="w-5 h-5 text-green-600" />
              Store Information
            </h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600 mb-1">Store Name</p>
                <p className="font-medium">{order.store.name}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Address</p>
                <p className="text-sm">{order.store.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Phone</p>
                <p className="text-sm">{order.store.phone}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-green-600" />
            Order Items
          </h2>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                  {item.product.imageUrl ? (
                    <Image
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {formatCurrency(item.price * item.quantity)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.price)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="border-t mt-6 pt-4 space-y-2">
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
              <span className="font-bold text-lg">Total</span>
              <span className="font-bold text-lg text-green-600">
                {formatCurrency(order.total)}
              </span>
            </div>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Need help with your order?</strong><br />
            Contact the store directly at{' '}
            <a href={`tel:${order.store.phone}`} className="underline">
              {order.store.phone}
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
