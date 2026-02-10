'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import { useCartStore } from '@/lib/store/cart-store';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/utils';
import {
  PROVINCES,
  PROVINCE_DISPLAY_NAMES,
  FREE_SHIPPING_THRESHOLD,
} from '@/lib/shipping';
import { ArrowLeft, MapPin, Phone, Loader2, CreditCard, ShoppingBag, Truck, Camera } from 'lucide-react';

interface ShippingInfo {
  street: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { items, getSubtotal, getShippingFee, getTotal, province, setProvince } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<ShippingInfo>>({});

  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    street: '',
    suburb: '',
    city: '',
    province: province || '',
    postalCode: '',
    phone: user?.phone || '',
    notes: '',
  });

  useEffect(() => {
    if (user?.phone) {
      setShippingInfo(prev => ({ ...prev, phone: user.phone || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (shippingInfo.province) {
      setProvince(shippingInfo.province);
    }
  }, [shippingInfo.province, setProvince]);

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ShippingInfo> = {};

    if (!shippingInfo.street.trim()) {
      newErrors.street = 'Street address is required';
    }
    if (!shippingInfo.city.trim()) {
      newErrors.city = 'City is required';
    }
    if (!shippingInfo.province) {
      newErrors.province = 'Province is required';
    }
    if (!shippingInfo.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{4}$/.test(shippingInfo.postalCode)) {
      newErrors.postalCode = 'Must be a 4-digit postal code';
    }
    if (!shippingInfo.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+27\d{9}$/.test(shippingInfo.phone)) {
      newErrors.phone = 'Phone must be in format +27XXXXXXXXX';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;
    if (!user) {
      alert('Please log in to continue');
      return;
    }

    setLoading(true);

    try {
      const deliveryAddress = [
        shippingInfo.street,
        shippingInfo.suburb,
        shippingInfo.city,
        PROVINCE_DISPLAY_NAMES[shippingInfo.province],
        shippingInfo.postalCode,
      ].filter(Boolean).join(', ');

      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryAddress,
          customerPhone: shippingInfo.phone,
          notes: shippingInfo.notes,
          province: shippingInfo.province,
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
      window.location.href = paymentUrl;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const subtotal = getSubtotal();
  const shippingFee = getShippingFee();
  const total = getTotal();

  const inputClasses = (field: string) =>
    `w-full px-4 py-3 bg-slate-800 border rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
      errors[field as keyof ShippingInfo] ? 'border-red-500' : 'border-slate-600'
    }`;

  return (
    <main className="min-h-screen bg-slate-950">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link
          href="/cart"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to cart
        </Link>

        <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                Shipping Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label htmlFor="province" className="block text-sm font-medium text-slate-300 mb-2">
                    Province *
                  </label>
                  <select
                    id="province"
                    value={shippingInfo.province}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, province: e.target.value });
                      setErrors({ ...errors, province: undefined });
                    }}
                    className={inputClasses('province')}
                  >
                    <option value="">Select your province</option>
                    {PROVINCES.map((p) => (
                      <option key={p} value={p}>{PROVINCE_DISPLAY_NAMES[p]}</option>
                    ))}
                  </select>
                  {errors.province && <p className="text-sm text-red-400 mt-1">{errors.province}</p>}
                </div>

                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-slate-300 mb-2">
                    Street Address *
                  </label>
                  <input
                    id="street"
                    type="text"
                    value={shippingInfo.street}
                    onChange={(e) => {
                      setShippingInfo({ ...shippingInfo, street: e.target.value });
                      setErrors({ ...errors, street: undefined });
                    }}
                    placeholder="123 Main Road"
                    className={inputClasses('street')}
                  />
                  {errors.street && <p className="text-sm text-red-400 mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="suburb" className="block text-sm font-medium text-slate-300 mb-2">
                      Suburb
                    </label>
                    <input
                      id="suburb"
                      type="text"
                      value={shippingInfo.suburb}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, suburb: e.target.value })}
                      placeholder="Sandton"
                      className={inputClasses('suburb')}
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-slate-300 mb-2">
                      City *
                    </label>
                    <input
                      id="city"
                      type="text"
                      value={shippingInfo.city}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, city: e.target.value });
                        setErrors({ ...errors, city: undefined });
                      }}
                      placeholder="Johannesburg"
                      className={inputClasses('city')}
                    />
                    {errors.city && <p className="text-sm text-red-400 mt-1">{errors.city}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-slate-300 mb-2">
                      Postal Code *
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      value={shippingInfo.postalCode}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, postalCode: e.target.value });
                        setErrors({ ...errors, postalCode: undefined });
                      }}
                      placeholder="2196"
                      maxLength={4}
                      className={inputClasses('postalCode')}
                    />
                    {errors.postalCode && <p className="text-sm text-red-400 mt-1">{errors.postalCode}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                      Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={(e) => {
                        setShippingInfo({ ...shippingInfo, phone: e.target.value });
                        setErrors({ ...errors, phone: undefined });
                      }}
                      placeholder="+27XXXXXXXXX"
                      className={inputClasses('phone')}
                    />
                    {errors.phone && <p className="text-sm text-red-400 mt-1">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-slate-300 mb-2">
                    Delivery Notes (Optional)
                  </label>
                  <textarea
                    id="notes"
                    value={shippingInfo.notes}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                    placeholder="Gate code, complex name, special instructions..."
                    rows={2}
                    className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                Payment Method
              </h2>

              <div className="border-2 border-blue-500/50 rounded-lg p-4 bg-blue-600/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Yoco</h3>
                    <p className="text-sm text-slate-400">Credit card, debit card, or QR code</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-slate-700/50 rounded-lg p-3">
                <p className="text-sm text-slate-300">
                  You will be redirected to Yoco to complete your payment securely.
                </p>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 sticky top-24">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-blue-500" />
                Order Summary
              </h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-14 h-14 bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm text-white truncate">{item.name}</h3>
                      <p className="text-sm text-slate-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-700 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Subtotal</span>
                  <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Shipping</span>
                  <span className="font-semibold">
                    {!shippingInfo.province ? (
                      <span className="text-slate-500">-</span>
                    ) : shippingFee === 0 ? (
                      <span className="text-green-400">FREE</span>
                    ) : (
                      <span className="text-white">{formatCurrency(shippingFee)}</span>
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-700 pt-2 flex justify-between">
                  <span className="font-bold text-lg text-white">Total</span>
                  <span className="font-bold text-lg text-blue-400">{formatCurrency(total)}</span>
                </div>
              </div>

              {shippingFee === 0 && shippingInfo.province && (
                <div className="mt-3 bg-green-600/10 border border-green-600/20 rounded-lg p-2">
                  <p className="text-sm text-green-400 text-center font-medium">
                    You qualify for free shipping!
                  </p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={loading || !user}
                className="w-full mt-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 font-semibold disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:shadow-blue-600/25"
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
                <p className="text-sm text-red-400 text-center mt-2">
                  Please sign in to complete checkout
                </p>
              )}

              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <CreditCard className="w-3 h-3" />
                    Secure Payment
                  </span>
                  <span className="flex items-center gap-1">
                    <Truck className="w-3 h-3" />
                    Nationwide Courier
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
