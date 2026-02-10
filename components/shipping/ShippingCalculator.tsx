'use client';

import { Truck, MapPin } from 'lucide-react';
import { useCartStore } from '@/lib/store/cart-store';
import {
  PROVINCES,
  PROVINCE_DISPLAY_NAMES,
  SHIPPING_RATES,
  FREE_SHIPPING_THRESHOLD,
  getEstimatedDeliveryDays,
} from '@/lib/shipping';
import { formatCurrency } from '@/lib/utils';

interface ShippingCalculatorProps {
  subtotal?: number;
  compact?: boolean;
}

export default function ShippingCalculator({ subtotal, compact = false }: ShippingCalculatorProps) {
  const { province, setProvince, getSubtotal, getShippingFee } = useCartStore();
  const currentSubtotal = subtotal ?? getSubtotal();
  const shippingFee = getShippingFee();
  const isFreeShipping = currentSubtotal >= FREE_SHIPPING_THRESHOLD;

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3'}>
      {/* Province selector */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          <MapPin className="w-3.5 h-3.5 inline mr-1" />
          Deliver to
        </label>
        <select
          value={province || ''}
          onChange={(e) => setProvince(e.target.value)}
          className="w-full px-3 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select province</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>
              {PROVINCE_DISPLAY_NAMES[p]} - {formatCurrency(SHIPPING_RATES[p])}
            </option>
          ))}
        </select>
      </div>

      {/* Shipping info */}
      {province && (
        <div className="bg-slate-800/50 rounded-lg p-3 space-y-1.5">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5" />
              Shipping
            </span>
            <span className={isFreeShipping ? 'text-green-400 font-semibold' : 'text-white font-semibold'}>
              {isFreeShipping ? 'FREE' : formatCurrency(shippingFee)}
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Est. {getEstimatedDeliveryDays(province)}
          </p>
        </div>
      )}

      {/* Free shipping incentive */}
      {!isFreeShipping && (
        <p className="text-xs text-blue-400">
          Free shipping on orders over {formatCurrency(FREE_SHIPPING_THRESHOLD)}
        </p>
      )}
    </div>
  );
}
