import type {
  User,
  Product,
  Category,
  Order,
  OrderItem,
  Cart,
  CartItem,
  Address,
  HamperPreset,
  HamperPresetItem,
  DeliveryZone,
} from "@prisma/client"

// Extended types with relations
export type ProductWithCategory = Product & {
  category: Category
}

export type CartWithItems = Cart & {
  items: (CartItem & {
    product: Product
  })[]
}

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Product
  })[]
}

export type HamperPresetWithItems = HamperPreset & {
  items: (HamperPresetItem & {
    product: Product
  })[]
}

// Frontend types
export interface CartItemData {
  id: string
  productId: string
  name: string
  price: number
  image: string
  quantity: number
  stock: number
}

export interface CheckoutFormData {
  // Contact info (for guests)
  email?: string
  phone?: string

  // Delivery address
  recipientName: string
  streetAddress: string
  suburb: string
  city: string
  postalCode: string
  province: string

  // Delivery options
  deliveryDate: string
  deliverySlot: string
  deliveryNotes?: string

  // Gift options
  giftMessage?: string

  // Save preferences
  saveAddress?: boolean
  addressLabel?: string
}

export interface DeliverySlot {
  id: string
  label: string
  startTime: string
  endTime: string
  available: boolean
}

export interface DeliveryZoneInfo {
  id: string
  name: string
  fee: number
  freeAbove?: number
  sameDayCutoff?: string
}

// API response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Auth types
export interface SessionUser {
  id: string
  email: string
  name?: string | null
  role: "CUSTOMER" | "SUPPLIER" | "DRIVER" | "ADMIN"
  image?: string | null
}

// Store settings
export interface StoreInfo {
  name: string
  tagline: string
  email: string
  phone: string
  address: string
}

export interface DeliverySettings {
  operatingHours: {
    start: string
    end: string
  }
  deliverySlots: string[]
  sameDayCutoff: string
}

// PayFast types
export interface PayFastData {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
}
