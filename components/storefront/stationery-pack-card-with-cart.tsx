'use client'

import { useCart } from '@/hooks/use-cart'
import { StationeryPackCard } from './stationery-pack-card'

interface StationeryPackItem {
  id: string
  productName: string
  quantity: number
}

interface StationeryPack {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  price: number
  comparePrice?: number
  gradeName?: string
  schoolName?: string
  itemCount?: number
  items?: StationeryPackItem[]
  isFeatured?: boolean
}

interface StationeryPackCardWithCartProps {
  pack: StationeryPack
  className?: string
  index?: number
}

export function StationeryPackCardWithCart({
  pack,
  className,
  index,
}: StationeryPackCardWithCartProps) {
  const { addItem } = useCart()

  const handleAddToCart = (packData: StationeryPack) => {
    addItem({
      productId: packData.id,
      name: packData.name,
      price: packData.price,
      image: packData.image || '',
      stock: 999, // Packs don't have stock limits
    })
  }

  return (
    <StationeryPackCard
      pack={pack}
      onAddToCart={handleAddToCart}
      className={className}
      index={index}
    />
  )
}
