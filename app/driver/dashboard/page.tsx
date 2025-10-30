'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Clock,
  Loader2,
  CheckCircle,
  AlertCircle,
  Navigation,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: string;
  customerPhone: string;
  estimatedTime: number | null;
  createdAt: string;
  store: {
    name: string;
    address: string;
    phone: string;
  };
  customer: {
    name: string | null;
    phone: string;
  };
  items: Array<{
    id: string;
    quantity: number;
  }>;
}

interface DriverProfile {
  id: string;
  name: string;
  vehicleType: string;
  vehicleReg: string;
  isApproved: boolean;
  isActive: boolean;
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [myDeliveries, setMyDeliveries] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'available' | 'my-deliveries'>('available');

  useEffect(() => {
    // Redirect if not driver
    if (!authLoading && user?.role !== 'DRIVER') {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch driver profile
        const profileRes = await fetch('/api/driver/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setDriverProfile(profileData.profile);
        }

        // Fetch available orders
        const ordersRes = await fetch('/api/driver/available-orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setAvailableOrders(ordersData.orders || []);
        }

        // Fetch my deliveries
        const deliveriesRes = await fetch('/api/driver/my-deliveries');
        if (deliveriesRes.ok) {
          const deliveriesData = await deliveriesRes.json();
          setMyDeliveries(deliveriesData.orders || []);
        }
      } catch (error) {
        console.error('Failed to fetch driver data:', error);
      } finally {
        setLoading(false);
      }
    }

    if (user?.role === 'DRIVER') {
      fetchData();

      // Auto-refresh every 30 seconds
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleAcceptOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/driver/accept-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      if (res.ok) {
        // Refresh data
        const ordersRes = await fetch('/api/driver/available-orders');
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json();
          setAvailableOrders(ordersData.orders || []);
        }

        const deliveriesRes = await fetch('/api/driver/my-deliveries');
        if (deliveriesRes.ok) {
          const deliveriesData = await deliveriesRes.json();
          setMyDeliveries(deliveriesData.orders || []);
        }

        // Switch to my deliveries tab
        setTab('my-deliveries');
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to accept order');
      }
    } catch (error) {
      console.error('Failed to accept order:', error);
      alert('Failed to accept order');
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        // Refresh deliveries
        const deliveriesRes = await fetch('/api/driver/my-deliveries');
        if (deliveriesRes.ok) {
          const deliveriesData = await deliveriesRes.json();
          setMyDeliveries(deliveriesData.orders || []);
        }
      } else {
        alert('Failed to update order status');
      }
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order status');
    }
  };

  if (authLoading || (user?.role === 'DRIVER' && loading)) {
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

  if (user?.role !== 'DRIVER') {
    return null;
  }

  if (!driverProfile) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Driver Profile Not Found</h1>
          <p className="text-gray-600 mb-6">
            Please complete your driver registration first.
          </p>
          <Link
            href="/driver/register"
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
          >
            Register as Driver
          </Link>
        </div>
      </main>
    );
  }

  if (!driverProfile.isApproved) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <Clock className="w-16 h-16 text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Pending Approval</h1>
          <p className="text-gray-600 mb-6">
            Your driver application is being reviewed. You'll be notified once approved.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm text-blue-800">
              <strong>Driver Details:</strong><br />
              Name: {driverProfile.name}<br />
              Vehicle: {driverProfile.vehicleType} - {driverProfile.vehicleReg}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const activeDeliveries = myDeliveries.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Driver Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{driverProfile.name}</h1>
                <p className="text-gray-600">
                  {driverProfile.vehicleType} - {driverProfile.vehicleReg}
                </p>
              </div>
            </div>

            {activeDeliveries.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                <p className="text-green-800 font-medium">
                  {activeDeliveries.length} active{' '}
                  {activeDeliveries.length === 1 ? 'delivery' : 'deliveries'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setTab('available')}
            className={`px-6 py-3 rounded-lg font-medium ${
              tab === 'available'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Available Orders ({availableOrders.length})
          </button>
          <button
            onClick={() => setTab('my-deliveries')}
            className={`px-6 py-3 rounded-lg font-medium ${
              tab === 'my-deliveries'
                ? 'bg-green-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            My Deliveries ({myDeliveries.length})
          </button>
        </div>

        {/* Available Orders Tab */}
        {tab === 'available' && (
          <div>
            {availableOrders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Available Orders</h2>
                <p className="text-gray-600">
                  New orders will appear here when they're ready for delivery
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Order {order.orderNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Delivery Fee</p>
                        <p className="font-bold text-green-600">R 25.00</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Pick up from:</p>
                          <p className="font-medium">{order.store.name}</p>
                          <p className="text-sm text-gray-600">{order.store.address}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Navigation className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Deliver to:</p>
                          <p className="font-medium">{order.deliveryAddress}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Customer:</p>
                          <p className="font-medium">
                            {order.customer.name || 'Customer'} - {order.customer.phone}
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAcceptOrder(order.id)}
                      className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
                    >
                      Accept Delivery
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Deliveries Tab */}
        {tab === 'my-deliveries' && (
          <div>
            {myDeliveries.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
                <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">No Deliveries</h2>
                <p className="text-gray-600">
                  Accept orders from the "Available Orders" tab to start delivering
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myDeliveries.map((order) => (
                  <div
                    key={order.id}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">
                          Order {order.orderNumber}
                        </h3>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                            order.status === 'DELIVERED'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {order.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Total</p>
                        <p className="font-bold text-green-600">
                          {formatCurrency(order.total)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-gray-600">Deliver to:</p>
                          <p className="font-medium">{order.deliveryAddress}</p>
                          <p className="text-sm text-gray-600">{order.customer.phone}</p>
                        </div>
                      </div>
                    </div>

                    {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                      <div className="flex gap-2">
                        {order.status === 'READY' && (
                          <button
                            onClick={() =>
                              handleUpdateStatus(order.id, 'OUT_FOR_DELIVERY')
                            }
                            className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                          >
                            Start Delivery
                          </button>
                        )}
                        {order.status === 'OUT_FOR_DELIVERY' && (
                          <Link
                            href={`/driver/deliver/${order.id}`}
                            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-center"
                          >
                            Complete Delivery
                          </Link>
                        )}
                        <Link
                          href={`/orders/${order.id}`}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
                        >
                          Details
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
