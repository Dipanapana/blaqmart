import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { calculateShippingFee, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  stock: number;
  storeId: string;
  storeName: string;
}

interface CartStore {
  items: CartItem[];
  province: string | null;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setProvince: (province: string) => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getShippingFee: () => number;
  getDeliveryFee: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      province: null,

      addItem: (item) => {
        const items = get().items;
        const existingItem = items.find((i) => i.productId === item.productId);

        if (existingItem) {
          set({
            items: items.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: Math.min(i.quantity + 1, item.stock) }
                : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((i) => i.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.min(quantity, i.stock) }
              : i
          ),
        });
      },

      clearCart: () => {
        set({ items: [], province: null });
      },

      setProvince: (province) => {
        set({ province });
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        const province = get().province;
        return calculateShippingFee(province, subtotal);
      },

      // Backward compatibility alias
      getDeliveryFee: () => {
        return get().getShippingFee();
      },

      getTotal: () => {
        return get().getSubtotal() + get().getShippingFee();
      },
    }),
    {
      name: 'blaqmart-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
