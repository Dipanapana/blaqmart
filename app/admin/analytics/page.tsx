'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Truck,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';

interface Analytics {
  users: {
    total: number;
    vendors: number;
    drivers: number;
    customers: number;
  };
  stores: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    active: number;
  };
  orders: {
    total: number;
    paid: number;
    delivered: number;
    pending: number;
  };
  revenue: {
    total: number;
    averageOrderValue: number;
  };
  drivers: {
    pending: number;
    active: number;
  };
  ordersByStatus: Array<{
    status: string;
    _count: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    customerName: string;
    storeName: string;
    createdAt: string;
  }>;
  topStores: Array<{
    id: string;
    name: string;
    address: string;
    revenue: number;
    orders: number;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (!authLoading && user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/admin/analytics');

        if (res.ok) {
          const data = await res.json();
          setAnalytics(data.analytics);
        }
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'ADMIN') {
      fetchAnalytics();
    }
  }, [user]);

  if (authLoading || (user?.role === 'ADMIN' && loading)) {
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

  if (user?.role !== 'ADMIN' || !analytics) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-green-100 text-green-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      case 'OUT_FOR_DELIVERY':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Platform Analytics</h1>
            <p className="text-gray-600">BLAQMART Performance Dashboard</p>
          </div>
          <Link
            href="/admin/drivers"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
          >
            Manage Drivers
          </Link>
        </div>

        {/* Key Platform Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
              <DollarSign className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{formatCurrency(analytics.revenue.total)}</p>
            <p className="text-xs opacity-80 mt-1">All-time platform earnings</p>
          </div>

          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Orders</h3>
              <ShoppingCart className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{analytics.orders.total}</p>
            <p className="text-xs opacity-80 mt-1">
              {analytics.orders.paid} paid, {analytics.orders.pending} pending
            </p>
          </div>

          {/* Total Users */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Total Users</h3>
              <Users className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{analytics.users.total}</p>
            <p className="text-xs opacity-80 mt-1">
              {analytics.users.vendors}V, {analytics.users.drivers}D, {analytics.users.customers}C
            </p>
          </div>

          {/* Active Stores */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium opacity-90">Active Stores</h3>
              <Store className="w-8 h-8 opacity-80" />
            </div>
            <p className="text-3xl font-bold">{analytics.stores.active}</p>
            <p className="text-xs opacity-80 mt-1">
              of {analytics.stores.total} total
            </p>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Products</h3>
              <Package className="w-6 h-6 text-green-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{analytics.products.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active</span>
                <span className="font-bold text-green-600">{analytics.products.active}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Drivers</h3>
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Active</span>
                <span className="font-bold text-green-600">{analytics.drivers.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Pending</span>
                <span className="font-bold text-orange-600">{analytics.drivers.pending}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Avg Order Value</h3>
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-purple-600">
              {formatCurrency(analytics.revenue.averageOrderValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per paid order</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Stores */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Top Performing Stores</h2>

            {analytics.topStores.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No store sales yet</p>
            ) : (
              <div className="space-y-4">
                {analytics.topStores.map((store, index) => (
                  <div key={store.id} className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{store.name}</h3>
                      <p className="text-xs text-gray-500 truncate">{store.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(store.revenue)}</p>
                      <p className="text-xs text-gray-500">{store.orders} orders</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Orders by Status</h2>

            <div className="space-y-3">
              {analytics.ordersByStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        item.status
                      )}`}
                    >
                      {item.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="font-bold">{item._count}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between font-bold">
                <span>Total Orders</span>
                <span className="text-green-600">{analytics.orders.total}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Recent Platform Orders
          </h2>

          {analytics.recentOrders.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No orders yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Order
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Customer
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Store
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Payment
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <Link
                          href={`/orders/${order.id}`}
                          className="font-medium text-green-600 hover:underline"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3 px-2 text-sm">{order.customerName}</td>
                      <td className="py-3 px-2 text-sm">{order.storeName}</td>
                      <td className="py-3 px-2 font-semibold">
                        {formatCurrency(order.total)}
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
