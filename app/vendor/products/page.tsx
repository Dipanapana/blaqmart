'use client';

import { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import ProductForm from '@/components/vendor/ProductForm';
import VendorProductList from '@/components/vendor/VendorProductList';

interface Store {
  id: string;
  name: string;
}

export default function VendorProductsPage() {
  const [store, setStore] = useState<Store | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchStore();
  }, []);

  async function fetchStore() {
    try {
      const res = await fetch('/api/stores');
      const data = await res.json();

      if (data.stores && data.stores.length > 0) {
        setStore(data.stores[0]);
      }
    } catch (error) {
      console.error('Failed to fetch store:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleProductAdded() {
    setShowForm(false);
    setRefreshKey(prev => prev + 1);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Store Found</h2>
        <p className="text-gray-600 mb-6">
          You need to create a store before adding products
        </p>
        <a
          href="/vendor/store"
          className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          Create Store
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Products</h1>
          <p className="text-gray-600">
            Manage your product catalog for {store.name}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
        >
          <Plus className="w-5 h-5" />
          Add Product
        </button>
      </div>

      {/* Add Product Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <ProductForm
            storeId={store.id}
            onSuccess={handleProductAdded}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Products List */}
      <VendorProductList
        storeId={store.id}
        key={refreshKey}
      />
    </div>
  );
}
