import { db } from "@/lib/db"
import { MobileProductsPageWrapper } from "@/components/storefront/mobile-products-page-wrapper"

interface ProductsPageProps {
  searchParams: {
    category?: string
    sort?: string
    featured?: string
    q?: string
    page?: string
    grade?: string
  }
}

async function getProductsData(searchParams: ProductsPageProps["searchParams"]) {
  const { category, sort, featured, q, page = "1", grade } = searchParams
  const pageNumber = parseInt(page)
  const limit = 12

  const where: any = { isActive: true }

  if (category) {
    where.category = { slug: category }
  }

  if (featured === "true") {
    where.isFeatured = true
  }

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ]
  }

  const orderBy: any = {}
  switch (sort) {
    case "price-asc":
      orderBy.price = "asc"
      break
    case "price-desc":
      orderBy.price = "desc"
      break
    case "newest":
      orderBy.createdAt = "desc"
      break
    default:
      orderBy.isFeatured = "desc"
  }

  const [products, total, categories, grades] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      take: limit,
      skip: (pageNumber - 1) * limit,
      include: { category: true },
    }),
    db.product.count({ where }),
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
    db.grade.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    }),
  ])

  return {
    products,
    categories,
    grades,
    pagination: {
      page: pageNumber,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const { products, categories, grades, pagination } = await getProductsData(searchParams)

  const transformedProducts = products.map((p) => ({
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
    <MobileProductsPageWrapper
      products={transformedProducts}
      categories={categories}
      grades={grades}
      pagination={pagination}
      searchParams={searchParams}
    />
  )
}


