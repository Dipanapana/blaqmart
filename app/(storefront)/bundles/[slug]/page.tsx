import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Package, Check, Sparkles, Star } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"
import { StickyPackAddToCart } from "@/components/storefront/sticky-pack-add-to-cart"
import { StationeryPackCardWithCart } from "@/components/storefront/stationery-pack-card-with-cart"

interface BundlePageProps {
  params: { slug: string }
}

async function getBundleData(slug: string) {
  const pack = await db.stationeryPack.findUnique({
    where: { slug, isActive: true },
    include: {
      grade: true,
      school: true,
      items: {
        include: {
          product: {
            include: { category: true }
          }
        },
      },
    },
  })

  if (!pack) return null

  // Get related packs (same grade or featured)
  const relatedPacks = await db.stationeryPack.findMany({
    where: {
      isActive: true,
      id: { not: pack.id },
      OR: [
        { gradeId: pack.gradeId },
        { isFeatured: true }
      ]
    },
    include: {
      grade: true,
      school: true,
      items: {
        include: { product: true },
        take: 5,
      },
    },
    take: 4,
  })

  return { pack, relatedPacks }
}

export async function generateMetadata({ params }: BundlePageProps) {
  const data = await getBundleData(params.slug)
  if (!data) return { title: "Bundle Not Found" }

  return {
    title: `${data.pack.name} | Blaqmart`,
    description: data.pack.description || `Complete bundle with ${data.pack.items.length} items. Quality products delivered to your door.`,
  }
}

export default async function BundlePage({ params }: BundlePageProps) {
  const data = await getBundleData(params.slug)

  if (!data) {
    notFound()
  }

  const { pack, relatedPacks } = data

  const savings = pack.comparePrice ? Number(pack.comparePrice) - Number(pack.price) : 0
  const savingsPercent = pack.comparePrice
    ? Math.round((savings / Number(pack.comparePrice)) * 100)
    : 0

  // Calculate what buying items separately would cost
  const itemsTotal = pack.items.reduce((sum, item) => {
    return sum + (Number(item.product.price) * item.quantity)
  }, 0)

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-primary/90 py-4">
        <div className="container">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10" asChild>
            <Link href="/bundles">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Bundles
            </Link>
          </Button>
        </div>
      </div>

      <main>
        <div className="container px-4 py-6">
          {/* Hero Section */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50">
              {pack.image ? (
                <Image
                  src={pack.image}
                  alt={pack.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-32 w-32 text-primary/20" />
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {pack.isFeatured && (
                  <Badge className="bg-gradient-to-r from-yellow-400 to-amber-500 text-yellow-900 border-none">
                    <Star className="mr-1 h-3 w-3 fill-current" />
                    Popular
                  </Badge>
                )}
                {savingsPercent > 0 && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-none">
                    Save {savingsPercent}%
                  </Badge>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Grade & School */}
              <div className="flex flex-wrap gap-2">
                {pack.grade && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    {pack.grade.name}
                  </Badge>
                )}
                {pack.school && (
                  <Badge variant="outline">
                    {pack.school.name}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold text-gray-900">{pack.name}</h1>

              {/* Description */}
              {pack.description && (
                <p className="text-lg text-gray-600">{pack.description}</p>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    {formatPrice(Number(pack.price))}
                  </span>
                  {pack.comparePrice && (
                    <span className="text-xl text-gray-400 line-through">
                      {formatPrice(Number(pack.comparePrice))}
                    </span>
                  )}
                </div>
                {savings > 0 && (
                  <div className="flex items-center gap-2 text-green-600 font-medium">
                    <Sparkles className="h-4 w-4" />
                    You save {formatPrice(savings)}!
                  </div>
                )}
                {itemsTotal > Number(pack.price) && (
                  <p className="text-sm text-gray-500">
                    Items bought separately: {formatPrice(itemsTotal)}
                  </p>
                )}
              </div>

              {/* What's Included */}
              <div className="space-y-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  What's Included ({pack.items.length} items)
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {pack.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white">
                        {item.product.images && typeof item.product.images === 'string' ? (
                          <Image
                            src={JSON.parse(item.product.images)[0] || ''}
                            alt={item.product.name}
                            width={40}
                            height={40}
                            className="rounded object-cover"
                          />
                        ) : (
                          <Check className="h-5 w-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {item.product.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Qty: {item.quantity} • {formatPrice(Number(item.product.price))} each
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Desktop Add to Cart (hidden on mobile - shown in sticky bar) */}
              <div className="hidden lg:block pt-4">
                <StickyPackAddToCart
                  pack={{
                    id: pack.id,
                    name: pack.name,
                    price: Number(pack.price),
                    image: pack.image || undefined,
                  }}
                  isInline
                />
              </div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <span className="text-2xl">🚚</span>
              <p className="mt-2 text-sm font-medium">Free Local Delivery</p>
              <p className="text-xs text-gray-500">Warrenton & Jan Kempdorp</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <span className="text-2xl">✅</span>
              <p className="mt-2 text-sm font-medium">Quality Brands</p>
              <p className="text-xs text-gray-500">Staedtler, Croxley, Casio</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <span className="text-2xl">📦</span>
              <p className="mt-2 text-sm font-medium">Complete Bundle</p>
              <p className="text-xs text-gray-500">Everything you need</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 text-center">
              <span className="text-2xl">💰</span>
              <p className="mt-2 text-sm font-medium">Save Money</p>
              <p className="text-xs text-gray-500">Better than buying separate</p>
            </div>
          </div>

          {/* Related Bundles */}
          {relatedPacks.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {relatedPacks.map((relatedPack, index) => (
                  <StationeryPackCardWithCart
                    key={relatedPack.id}
                    index={index}
                    pack={{
                      id: relatedPack.id,
                      name: relatedPack.name,
                      slug: relatedPack.slug,
                      description: relatedPack.description || undefined,
                      image: relatedPack.image || undefined,
                      price: Number(relatedPack.price),
                      comparePrice: relatedPack.comparePrice ? Number(relatedPack.comparePrice) : undefined,
                      gradeName: relatedPack.grade?.name,
                      schoolName: relatedPack.school?.name,
                      itemCount: relatedPack.items.length,
                      items: relatedPack.items.map((item) => ({
                        id: item.id,
                        productName: item.product.name,
                        quantity: item.quantity,
                      })),
                      isFeatured: relatedPack.isFeatured,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Add to Cart for Mobile */}
      <StickyPackAddToCart
        pack={{
          id: pack.id,
          name: pack.name,
          price: Number(pack.price),
          image: pack.image || undefined,
        }}
      />
    </div>
  )
}
