import { Suspense } from "react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"
import { ProductFilters } from "@/components/storefront/product-filters"
import { Skeleton } from "@/components/ui/skeleton"

interface ProductsPageProps {
  searchParams: {
    category?: string
    sort?: string
    featured?: string
    q?: string
    page?: string
  }
}

async function getProducts(searchParams: ProductsPageProps["searchParams"]) {
  const { category, sort, featured, q, page = "1" } = searchParams
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

  const [products, total, categories] = await Promise.all([
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
  ])

  return {
    products,
    categories,
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
  const { products, categories, pagination } = await getProducts(searchParams)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {searchParams.featured === "true" ? "Featured Products" : "All Products"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {pagination.total} products found
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-64">
          <ProductFilters categories={categories} />
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <Suspense fallback={<ProductGridSkeleton />}>
            {products.length > 0 ? (
              <>
                <ProductGrid
                  products={products.map((p) => ({
                    ...p,
                    price: Number(p.price),
                    comparePrice: p.comparePrice
                      ? Number(p.comparePrice)
                      : null,
                    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
                  }))}
                />
                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    {Array.from({ length: pagination.totalPages }, (_, i) => (
                      <a
                        key={i}
                        href={`?page=${i + 1}${
                          searchParams.category
                            ? `&category=${searchParams.category}`
                            : ""
                        }${searchParams.sort ? `&sort=${searchParams.sort}` : ""}`}
                        className={`flex h-10 w-10 items-center justify-center rounded-md border ${
                          pagination.page === i + 1
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-lg text-muted-foreground">
                  No products found
                </p>
              </div>
            )}
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-square w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  )
}
