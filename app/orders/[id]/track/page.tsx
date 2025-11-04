'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Navigation,
  Clock,
  Store as StoreIcon,
  TruckIcon,
  CheckCircle2
} from 'lucide-react';

interface TrackingData {
  orderId: string;
  orderNumber: string;
  status: string;
  estimatedTime: number | null;
  storeLocation: {
    name: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  deliveryLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  driver: {
    name: string;
    phone: string;
    currentLocation: {
      latitude: number;
      longitude: number;
      lastUpdate: string;
    } | null;
  } | null;
  metrics: {
    distanceToDelivery: string | null;
    estimatedArrival: string | null;
  };
  route: Array<{
    latitude: number;
    longitude: number;
    timestamp: string;
  }>;
}

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const [tracking, setTracking] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchTracking = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${params.id}/track`);

      if (res.ok) {
        const data = await res.json();
        setTracking(data.tracking);
        setError('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to load tracking information');
      }
    } catch (err) {
      setError('Failed to load tracking information');
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  // Auto-refresh every 10 seconds when out for delivery
  useEffect(() => {
    if (!autoRefresh || !tracking || tracking.status !== 'OUT_FOR_DELIVERY') {
      return;
    }

    const interval = setInterval(() => {
      fetchTracking();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, tracking, fetchTracking]);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return { color: 'bg-blue-100 text-blue-700', step: 1, total: 5 };
      case 'PREPARING':
        return { color: 'bg-orange-100 text-orange-700', step: 2, total: 5 };
      case 'READY':
        return { color: 'bg-purple-100 text-purple-700', step: 3, total: 5 };
      case 'OUT_FOR_DELIVERY':
        return { color: 'bg-green-100 text-green-700', step: 4, total: 5 };
      case 'DELIVERED':
        return { color: 'bg-green-600 text-white', step: 5, total: 5 };
      default:
        return { color: 'bg-gray-100 text-gray-700', step: 0, total: 5 };
    }
  };

  const formatLastUpdate = (timestamp: string) => {
    const now = new Date();
    const then = new Date(timestamp);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return `${seconds} seconds ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    return `${Math.floor(seconds / 3600)} hours ago`;
  };

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

  if (error || !tracking) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 font-semibold mb-4">
              {error || 'Tracking information not available'}
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

  const statusInfo = getStatusInfo(tracking.status);
  const progressPercentage = (statusInfo.step / statusInfo.total) * 100;

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
          <h1 className="text-3xl font-bold mb-2">Track Your Delivery</h1>
          <p className="text-gray-600">
            Order #{tracking.orderNumber}
          </p>
        </div>

        {/* Status Progress Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${statusInfo.color}`}>
              {tracking.status.replace(/_/g, ' ')}
            </span>
            {autoRefresh && tracking.status === 'OUT_FOR_DELIVERY' && (
              <span className="text-sm text-green-600 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                Live tracking
              </span>
            )}
          </div>

          <div className="relative">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-600">
              <span>Confirmed</span>
              <span>Preparing</span>
              <span>Ready</span>
              <span>On the way</span>
              <span>Delivered</span>
            </div>
          </div>
        </div>

        {/* Estimated Time */}
        {tracking.metrics.estimatedArrival && tracking.status === 'OUT_FOR_DELIVERY' && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 mb-6 border border-green-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Estimated Arrival</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {tracking.metrics.estimatedArrival}
                  </p>
                </div>
              </div>
              {tracking.metrics.distanceToDelivery && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Distance</p>
                  <p className="text-xl font-semibold text-gray-900">
                    {tracking.metrics.distanceToDelivery}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Location Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Store Location */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <StoreIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">Pickup Location</h3>
                <p className="text-sm text-gray-600">{tracking.storeLocation.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{tracking.storeLocation.address}</p>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Navigation className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Delivery Location</h3>
                <p className="text-sm text-gray-600">Your address</p>
              </div>
            </div>
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>{tracking.deliveryLocation.address}</p>
            </div>
          </div>
        </div>

        {/* Driver Information */}
        {tracking.driver && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TruckIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Your Driver</h3>
                <p className="text-sm text-gray-600">{tracking.driver.name}</p>
              </div>
            </div>

            {tracking.driver.currentLocation && (
              <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-green-900">
                      Driver location tracked
                    </span>
                  </div>
                  <span className="text-xs text-green-700">
                    Updated {formatLastUpdate(tracking.driver.currentLocation.lastUpdate)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Placeholder - Simple visualization */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
          <h3 className="font-semibold mb-4">Delivery Route</h3>
          <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
            <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Map visualization coming soon</p>
            <p className="text-sm text-gray-500">
              {tracking.route.length > 0
                ? `Tracking ${tracking.route.length} location points`
                : 'Waiting for driver location updates'}
            </p>
          </div>
        </div>

        {/* Auto-refresh Toggle */}
        {tracking.status === 'OUT_FOR_DELIVERY' && (
          <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-700">Auto-refresh every 10 seconds</span>
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                autoRefresh
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {autoRefresh ? 'Enabled' : 'Disabled'}
            </button>
          </div>
        )}

        {/* Delivery Complete Message */}
        {tracking.status === 'DELIVERED' && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-green-900 mb-2">
              Delivered Successfully!
            </h2>
            <p className="text-green-700 mb-6">
              Your order has been delivered. Thank you for shopping with BLAQMART!
            </p>
            <Link
              href={`/orders/${tracking.orderId}/review`}
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
            >
              Leave a Review
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
