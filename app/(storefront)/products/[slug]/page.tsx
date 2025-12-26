import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { MobileProductDetailWrapper } from "@/components/storefront/mobile-product-detail-wrapper"

interface ProductPageProps {
  params: { slug: string }
}

async function getProductData(slug: string) {
  const product = await db.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true },
  })

  if (!product) return null

  // Get related products
  const relatedProducts = await db.product.findMany({
    where: {
      categoryId: product.categoryId,
      isActive: true,
      id: { not: product.id },
    },
    take: 4,
  })

  // Get grades for nav
  const grades = await db.grade.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })

  return { product, relatedProducts, grades }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const data = await getProductData(params.slug)

  if (!data) {
    notFound()
  }

  const { product: rawProduct, relatedProducts: rawRelatedProducts, grades } = data

  // Transform product data
  const product = {
    ...rawProduct,
    price: Number(rawProduct.price),
    comparePrice: rawProduct.comparePrice ? Number(rawProduct.comparePrice) : null,
    images: typeof rawProduct.images === 'string'
      ? JSON.parse(rawProduct.images) as string[]
      : (rawProduct.images || []) as string[],
    tags: typeof rawProduct.tags === 'string'
      ? JSON.parse(rawProduct.tags) as string[]
      : (rawProduct.tags || []) as string[],
  }

  const relatedProducts = rawRelatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    stock: p.stock,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    sku: p.slug,
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags as string[]),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))

  return (
    <MobileProductDetailWrapper
      product={product}
      relatedProducts={relatedProducts}
      grades={grades}
    />
  )
}
