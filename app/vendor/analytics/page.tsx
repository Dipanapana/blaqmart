'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import VendorNav from '@/components/vendor/VendorNav';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react';

interface Analytics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  activeProducts: number;
  averageOrderValue: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    itemCount: number;
    customerName: string;
    createdAt: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    price: number;
    imageUrl: string | null;
    quantitySold: number;
  }>;
  salesByDay: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export default function VendorAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Redirect if not vendor
    if (!authLoading && user?.role !== 'VENDOR') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/vendor/analytics');

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

    if (user?.role === 'VENDOR') {
      fetchAnalytics();
    }
  }, [user]);

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

  if (user?.role !== 'VENDOR' || !analytics) {
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
      case 'PREPARING':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-yellow-100 text-yellow-700';
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <VendorNav />

        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Track your sales and performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Revenue */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Revenue</h3>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(analytics.totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">All-time earnings</p>
          </div>

          {/* Total Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Total Orders</h3>
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-3xl font-bold">{analytics.totalOrders}</p>
            <p className="text-xs text-gray-500 mt-1">
              {analytics.pendingOrders} pending
            </p>
          </div>

          {/* Average Order Value */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Avg. Order Value</h3>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-3xl font-bold">
              {formatCurrency(analytics.averageOrderValue)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Per order</p>
          </div>

          {/* Completed Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">Completed</h3>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-3xl font-bold">{analytics.completedOrders}</p>
            <p className="text-xs text-gray-500 mt-1">Delivered orders</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Top Products */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Top Selling Products
              </h2>

              {analytics.topProducts.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No products sold yet</p>
              ) : (
                <div className="space-y-4">
                  {analytics.topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {product.imageUrl ? (
                          <Image
                            src={product.imageUrl}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{product.name}</h3>
                        <p className="text-sm text-gray-600">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">
                          {product.quantitySold}
                        </p>
                        <p className="text-xs text-gray-500">sold</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Products Overview */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-semibold mb-4">Products</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Total Products</span>
                <span className="font-bold text-2xl">{analytics.totalProducts}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Active</span>
                <span className="font-bold text-green-600 text-xl">
                  {analytics.activeProducts}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Inactive</span>
                <span className="font-bold text-gray-400 text-xl">
                  {analytics.totalProducts - analytics.activeProducts}
                </span>
              </div>
            </div>

            <Link
              href="/vendor/products"
              className="block w-full mt-6 py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 font-semibold"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-green-600" />
            Recent Orders
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
                      Items
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Total
                    </th>
                    <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">
                      Status
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
                      <td className="py-3 px-2 text-sm">{order.itemCount}</td>
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
                      <td className="py-3 px-2 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Link
            href="/vendor/orders"
            className="block w-full mt-4 py-2 border border-gray-300 text-center rounded-lg hover:bg-gray-50 font-semibold"
          >
            View All Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
