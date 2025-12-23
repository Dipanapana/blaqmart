"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export interface HamperItem {
  productId: string
  name: string
  price: number
  image: string
  quantity: number
}

interface HamperStore {
  items: HamperItem[]
  giftMessage: string
  recipientName: string
  currentStep: number
  presetId: string | null

  addItem: (product: Omit<HamperItem, "quantity">) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearHamper: () => void
  setGiftMessage: (message: string) => void
  setRecipientName: (name: string) => void
  setCurrentStep: (step: number) => void
  setPresetId: (id: string | null) => void
  loadPreset: (items: HamperItem[]) => void

  total: () => number
  itemCount: () => number
  getItem: (productId: string) => HamperItem | undefined
}

export const useHamper = create<HamperStore>()(
  persist(
    (set, get) => ({
      items: [],
      giftMessage: "",
      recipientName: "",
      currentStep: 0,
      presetId: null,

      addItem: (product) => {
        const { items } = get()
        const existing = items.find((i) => i.productId === product.productId)

        if (existing) {
          set({
            items: items.map((i) =>
              i.productId === product.productId
                ? { ...i, quantity: i.quantity + 1 }
                : i
            ),
          })
        } else {
          set({
            items: [...items, { ...product, quantity: 1 }],
          })
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) })
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        })
      },

      clearHamper: () =>
        set({
          items: [],
          giftMessage: "",
          recipientName: "",
          currentStep: 0,
          presetId: null,
        }),

      setGiftMessage: (message) => set({ giftMessage: message }),
      setRecipientName: (name) => set({ recipientName: name }),
      setCurrentStep: (step) => set({ currentStep: step }),
      setPresetId: (id) => set({ presetId: id }),

      loadPreset: (items) => set({ items, presetId: null }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      getItem: (productId) =>
        get().items.find((i) => i.productId === productId),
    }),
    { name: "blaqmart-hamper" }
  )
)
