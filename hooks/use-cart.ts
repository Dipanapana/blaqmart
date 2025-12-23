"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface CartItem {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

interface CartStore {
  items: CartItem[]
  giftMessage: string | null
  isOpen: boolean

  addItem: (product: Omit<CartItem, "id" | "quantity">) => void
  updateQuantity: (productId: string, quantity: number) => void
  removeItem: (productId: string) => void
  clearCart: () => void
  setGiftMessage: (message: string | null) => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void

  subtotal: () => number
  itemCount: () => number
  getItem: (productId: string) => CartItem | undefined
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      giftMessage: null,
      isOpen: false,

      addItem: (product) => {
        const { items } = get()
        const existing = items.find((i) => i.productId === product.productId)

        if (existing) {
          // Don't exceed stock
          const newQuantity = Math.min(existing.quantity + 1, product.stock)
          set({
            items: items.map((i) =>
              i.productId === product.productId
                ? { ...i, quantity: newQuantity }
                : i
            ),
          })
        } else {
          set({
            items: [
              ...items,
              {
                ...product,
                id: crypto.randomUUID(),
                quantity: 1,
              },
            ],
          })
        }
        // Open cart when item is added
        set({ isOpen: true })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        const item = get().items.find((i) => i.productId === productId)
        if (item) {
          // Don't exceed stock
          const newQuantity = Math.min(quantity, item.stock)
          set({
            items: get().items.map((i) =>
              i.productId === productId ? { ...i, quantity: newQuantity } : i
            ),
          })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      clearCart: () => set({ items: [], giftMessage: null }),

      setGiftMessage: (message) => set({ giftMessage: message }),

      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      toggleCart: () => set({ isOpen: !get().isOpen }),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getItem: (productId) =>
        get().items.find((i) => i.productId === productId),
    }),
    {
      name: "blaqmart-cart",
      partialize: (state) => ({
        items: state.items,
        giftMessage: state.giftMessage,
      }),
    }
  )
)
