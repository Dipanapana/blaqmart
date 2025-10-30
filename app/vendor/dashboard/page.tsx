'use client';

import { useEffect, useState } from 'react';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  revenue: number;
}

export default function VendorDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch real stats from API
    // For now, using mock data
    setTimeout(() => {
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        totalOrders: 0,
        revenue: 0,
      });
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      label: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Active Products',
      value: stats.activeProducts,
      icon: ShoppingBag,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Total Orders',
      value: stats.totalOrders,
      icon: TrendingUp,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Revenue',
      value: `R${stats.revenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Vendor Dashboard</h1>
        <p className="text-gray-600">
          Manage your store, products, and orders
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold">
                {loading ? '...' : stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/vendor/store"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <Store className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Set Up Store</p>
            <p className="text-sm text-gray-500">Create or edit your store</p>
          </Link>

          <Link
            href="/vendor/products"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">Add Products</p>
            <p className="text-sm text-gray-500">List new products</p>
          </Link>

          <Link
            href="/"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center"
          >
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p className="font-medium">View Storefront</p>
            <p className="text-sm text-gray-500">See your public store</p>
          </Link>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
        <h2 className="text-xl font-bold mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              1
            </div>
            <div>
              <p className="font-medium">Set up your store</p>
              <p className="text-sm text-gray-600">
                Add your store details, location, and contact information
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              2
            </div>
            <div>
              <p className="font-medium">Add your products</p>
              <p className="text-sm text-gray-600">
                Upload product images, set prices, and manage inventory
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-300 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
              3
            </div>
            <div>
              <p className="font-medium">Start receiving orders</p>
              <p className="text-sm text-gray-600">
                Customers can now find and order from your store
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Store(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
      <polyline points="9 22 9 12 15 12 15 22"></polyline>
    </svg>
  );
}
