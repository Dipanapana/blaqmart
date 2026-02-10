'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, Store as StoreIcon, Loader2 } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  subscriptionTier: string;
  _count?: {
    products: number;
  };
}

export default function VendorStorePage() {
  const router = useRouter();
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    latitude: -26.2041,
    longitude: 28.0473,
  });

  useEffect(() => {
    fetchStore();
  }, []);

  async function fetchStore() {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();

      if (data.stores && data.stores.length > 0) {
        const existingStore = data.stores[0];
        setStore(existingStore);
        setFormData({
          name: existingStore.name,
          address: existingStore.address,
          phone: existingStore.phone,
          latitude: existingStore.latitude,
          longitude: existingStore.longitude,
        });
      }
    } catch (error) {
      console.error('Failed to fetch store:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/stores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const newStore = await res.json();
        setStore(newStore);
        alert('Store created successfully!');
        router.push('/vendor/products');
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to create store');
      }
    } catch (error) {
      console.error('Create store error:', error);
      alert('Failed to create store');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (store) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold mb-2">My Store</h1>
        <p className="text-gray-600 mb-8">
          Your store is live and ready to receive orders
        </p>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{store.name}</h2>
              <div className="flex items-center gap-2 text-gray-600 mb-2">
                <MapPin className="w-4 h-4" />
                <span>{store.address}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{store.phone}</span>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              store.isActive
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              {store.isActive ? 'Active' : 'Inactive'}
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Subscription Tier</p>
                <p className="font-semibold">{store.subscriptionTier}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Products</p>
                <p className="font-semibold">{store._count?.products || 0}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => router.push('/vendor/products')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Manage Products
            </button>
            <button
              onClick={() => setStore(null)}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Edit Store
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-2">Create Your Store</h1>
      <p className="text-gray-600 mb-8">
        Set up your store to start selling on BLAQMART
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Store Name *
          </label>
          <div className="relative">
            <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., BLAQMART Security"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Store Address *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Road, Johannesburg, 2000"
              rows={3}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Customers will see this address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Contact Phone *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="0812345678"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Store...
              </span>
            ) : (
              'Create Store'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
