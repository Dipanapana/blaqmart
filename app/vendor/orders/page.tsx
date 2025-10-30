'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import VendorNav from '@/components/vendor/VendorNav';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { Package, Loader2, ChevronRight, AlertCircle } from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: number;
  deliveryAddress: string;
  customerPhone: string;
  createdAt: string;
  customer: {
    name: string | null;
    phone: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

export default function VendorOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  useEffect(() => {
    // Redirect if not vendor
    if (!authLoading && user?.role !== 'VENDOR') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch('/api/vendor/orders');

        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'VENDOR') {
      fetchOrders();

      // Poll for new orders every 30 seconds
      const interval = setInterval(fetchOrders, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Refresh orders
        setOrders((prev) =>
          prev.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-700';
      case 'PREPARING':
        return 'bg-orange-100 text-orange-700';
      case 'CONFIRMED':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (selectedStatus === 'ALL') return true;
    return order.status === selectedStatus;
  });

  const pendingOrders = orders.filter(
    (o) => o.status === 'PENDING' || o.status === 'CONFIRMED'
  );

  if (authLoading || (user?.role === 'VENDOR' && loading)) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (user?.role !== 'VENDOR') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <VendorNav />

        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Orders</h1>
            <p className="text-gray-600">Manage your store orders</p>
          </div>

          {pendingOrders.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <p className="text-orange-800 font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                {pendingOrders.length} order{pendingOrders.length !== 1 ? 's' : ''}{' '}
                need attention
              </p>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  selectedStatus === status
                    ? 'bg-green-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            )
          )}
        </div>

        {filteredOrders.length === 0 ? (
          /* No orders */
          <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">
              {selectedStatus === 'ALL' ? 'No orders yet' : `No ${selectedStatus} orders`}
            </h2>
            <p className="text-gray-600">
              {selectedStatus === 'ALL'
                ? 'Your orders will appear here when customers place them'
                : 'Try selecting a different status filter'}
            </p>
          </div>
        ) : (
          /* Orders list */
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg mb-1">
                      Order {order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="mb-4 pb-4 border-b">
                  <p className="text-sm text-gray-600 mb-1">Customer</p>
                  <p className="font-medium">{order.customer.name || 'Customer'}</p>
                  <p className="text-sm text-gray-600">{order.customer.phone}</p>
                  <p className="text-sm text-gray-600 mt-2">
                    <strong>Delivery:</strong> {order.deliveryAddress}
                  </p>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <p className="text-sm font-semibold mb-2">Items:</p>
                  <div className="space-y-1">
                    {order.items.map((item) => (
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
                  <div className="mt-2 pt-2 border-t flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-green-600">{formatCurrency(order.total)}</span>
                  </div>
                </div>

                {/* Actions */}
                {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                  <div className="flex gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                      >
                        Confirm Order
                      </button>
                    )}
                    {order.status === 'CONFIRMED' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'PREPARING' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'READY')}
                        className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold"
                      >
                        Mark as Ready
                      </button>
                    )}
                    <Link
                      href={`/orders/${order.id}`}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold flex items-center gap-2"
                    >
                      View Details
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
