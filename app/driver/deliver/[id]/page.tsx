'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  ArrowLeft,
  Camera,
  Upload,
  Loader2,
  CheckCircle,
  MapPin,
  Phone,
  Package,
} from 'lucide-react';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  deliveryAddress: string;
  customerPhone: string;
  customer: {
    name: string | null;
    phone: string;
  };
  store: {
    name: string;
  };
  items: Array<{
    id: string;
    quantity: number;
    product: {
      name: string;
    };
  }>;
}

export default function DeliverOrderPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);

        if (res.ok) {
          const data = await res.json();
          setOrder(data.order);
        }
      } catch (error) {
        console.error('Failed to fetch order:', error);
      } finally {
        setLoading(false);
      }
    }

    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteDelivery = async () => {
    if (!imageFile) {
      alert('Please upload a delivery proof photo');
      return;
    }

    setUploading(true);

    try {
      // Upload photo to Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload photo');
      }

      const uploadData = await uploadRes.json();

      // Complete delivery
      const deliveryRes = await fetch('/api/driver/complete-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order?.id,
          photoUrl: uploadData.url,
          notes: notes.trim() || null,
        }),
      });

      if (!deliveryRes.ok) {
        throw new Error('Failed to complete delivery');
      }

      alert('Delivery completed successfully!');
      router.push('/driver/dashboard');
    } catch (error: any) {
      console.error('Delivery completion error:', error);
      alert(error.message || 'Failed to complete delivery');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        </div>
      </main>
    );
  }

  if (!order || user?.id !== order.driverId) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <Link href="/driver/dashboard" className="text-green-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (order.status === 'DELIVERED') {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Delivery Completed</h1>
            <p className="text-gray-600 mb-6">
              This order has already been delivered.
            </p>
            <Link
              href="/driver/dashboard"
              className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link
          href="/driver/dashboard"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100">
          <h1 className="text-2xl font-bold mb-6">Complete Delivery</h1>

          {/* Order Details */}
          <div className="mb-6 pb-6 border-b">
            <h2 className="text-lg font-semibold mb-4">Order Details</h2>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Order Number</p>
                <p className="font-medium">{order.orderNumber}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Store</p>
                <p className="font-medium">{order.store.name}</p>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Delivery Address</p>
                  <p className="font-medium">{order.deliveryAddress}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium">
                    {order.customer.name || 'Customer'} - {order.customer.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Package className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600">Items</p>
                  {order.items.map((item) => (
                    <p key={item.id} className="text-sm">
                      {item.quantity}x {item.product.name}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Photo Upload */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Proof of Delivery</h2>

            {imagePreview ? (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Delivery proof"
                  className="w-full max-h-96 object-contain rounded-lg border border-gray-300"
                />
                <button
                  onClick={() => {
                    setImagePreview(null);
                    setImageFile(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-700"
                >
                  Remove photo
                </button>
              </div>
            ) : (
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-green-500 transition-colors">
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 mb-1">Take a photo of the delivery</p>
                  <p className="text-sm text-gray-500">
                    Photo showing the delivered items or customer receiving the order
                  </p>
                </div>
              </label>
            )}
          </div>

          {/* Delivery Notes */}
          <div className="mb-6">
            <label htmlFor="notes" className="block text-sm font-medium mb-2">
              Delivery Notes (Optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any notes about the delivery?"
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Complete Button */}
          <button
            onClick={handleCompleteDelivery}
            disabled={!imageFile || uploading}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Completing Delivery...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Complete Delivery
              </>
            )}
          </button>

          {!imageFile && (
            <p className="text-sm text-gray-500 text-center mt-2">
              Please upload a delivery proof photo to continue
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
