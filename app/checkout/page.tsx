'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import { ArrowLeft, MapPin, Phone, Loader2, CreditCard, ShoppingBag } from 'lucide-react';

interface DeliveryInfo {
  address: string;
  phone: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, getDeliveryFee, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<DeliveryInfo>>({});

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
    address: '',
    phone: user?.phone || '',
    notes: '',
  });

  // Update phone when user loads
  useEffect(() => {
    if (user?.phone) {
      setDeliveryInfo(prev => ({ ...prev, phone: user.phone }));
    }
  }, [user]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<DeliveryInfo> = {};

    if (!deliveryInfo.address.trim()) {
      newErrors.address = 'Delivery address is required';
    } else if (deliveryInfo.address.trim().length < 10) {
      newErrors.address = 'Please provide a complete address';
    }

    if (!deliveryInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+27\d{9}$/.test(deliveryInfo.phone)) {
      newErrors.phone = 'Phone must be in format +27XXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) {
      return;
    }

    if (!user) {
      alert('Please log in to continue');
      return;
    }

    setLoading(true);

    try {
      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress: deliveryInfo.address,
          customerPhone: deliveryInfo.phone,
          notes: deliveryInfo.notes,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const { order } = await orderResponse.json();

      // Initiate PayFast payment
      const paymentResponse = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          amount: order.total,
        }),
      });

      if (!paymentResponse.ok) {
        throw new Error('Failed to initiate payment');
      }

      const { paymentUrl } = await paymentResponse.json();

      // Redirect to PayFast
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null; // Will redirect
  }

  const subtotal = getSubtotal();
  const deliveryFee = getDeliveryFee();
  const total = getTotal();

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back to cart */}
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to cart
        </Link>

        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Delivery Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-600" />
                Delivery Information
              </h2>

              <div className="space-y-4">
                {/* Address */}
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-2">
                    Delivery Address *
                  </label>
                  <textarea
                    id="address"
                    value={deliveryInfo.address}
                    onChange={(e) => {
                      setDeliveryInfo({ ...deliveryInfo, address: e.target.value });
                      setErrors({ ...errors, address: undefined });
                    }}
                    placeholder="Enter your full delivery address (street, suburb, city)"
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={deliveryInfo.phone}
                    onChange={(e) => {
                      setDeliveryInfo({ ...deliveryInfo, phone: e.target.value });
                      setErrors({ ...errors, phone: undefined });
                    }}
                    placeholder="+27XXXXXXXXX"
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={deliveryInfo.notes}
                    onChange={(e) => setDeliveryInfo({ ...deliveryInfo, notes: e.target.value })}
                    placeholder="Any special instructions for delivery?"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-green-600" />
                Payment Method
              </h2>

              <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">PayFast</h3>
                    <p className="text-sm text-gray-600">
                      Secure payment via credit card, debit card, or EFT
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  You will be redirected to PayFast to complete your payment securely.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-4">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-green-600" />
                Order Summary
              </h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pricing Summary */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span className="font-semibold">
                    {deliveryFee === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      formatCurrency(deliveryFee)
                    )}
                  </span>
                </div>
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-green-600">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>

              {/* Free delivery notice */}
              {deliveryFee === 0 && (
                <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-2">
                  <p className="text-sm text-green-700 text-center font-medium">
                    🎉 You qualify for free delivery!
                  </p>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleCheckout}
                disabled={loading || !user}
                className="w-full mt-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Proceed to Payment
                  </>
                )}
              </button>

              {!user && (
                <p className="text-sm text-red-600 text-center mt-2">
                  Please log in to complete checkout
                </p>
              )}

              {/* Trust badges */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    🔒 Secure Payment
                  </span>
                  <span className="flex items-center gap-1">
                    ✓ Money-back Guarantee
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
