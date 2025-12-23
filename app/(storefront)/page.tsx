import { db } from "@/lib/db"
import { AnimatedHomepage } from "@/components/storefront/animated-homepage"

async function getHomePageData() {
  const [grades, categories, featuredProducts, stationeryPacks] = await Promise.all([
    db.grade.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    }),
    db.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: "desc" },
    }),
    db.stationeryPack.findMany({
      where: { isActive: true, isFeatured: true },
      take: 4,
      include: {
        grade: true,
        school: true,
        items: {
          include: { product: true },
          take: 5,
        },
      },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return { grades, categories, featuredProducts, stationeryPacks }
}

export default async function HomePage() {
  const { grades, categories, featuredProducts, stationeryPacks } =
    await getHomePageData()

  // Transform data for client component - only pass serializable fields
  const transformedProducts = featuredProducts.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images as string[]),
    stock: p.stock,
    isFeatured: p.isFeatured,
    isActive: p.isActive,
    sku: p.slug, // Use slug as sku for display
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags as string[]),
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  }))

  const transformedPacks = stationeryPacks.map((pack) => ({
    id: pack.id,
    name: pack.name,
    slug: pack.slug,
    description: pack.description,
    image: pack.image,
    price: Number(pack.price),
    comparePrice: pack.comparePrice ? Number(pack.comparePrice) : null,
    grade: pack.grade,
    school: pack.school,
    items: pack.items.map((item) => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
        comparePrice: item.product.comparePrice ? Number(item.product.comparePrice) : null,
        costPrice: item.product.costPrice ? Number(item.product.costPrice) : null,
      },
    })),
    isFeatured: pack.isFeatured,
  }))

  return (
    <AnimatedHomepage
      grades={grades}
      categories={categories}
      featuredProducts={transformedProducts}
      stationeryPacks={transformedPacks}
    />
  )
}
