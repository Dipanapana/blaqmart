import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ChevronRight } from "lucide-react"
import { db } from "@/lib/db"
import { ProductGrid } from "@/components/storefront/product-grid"

interface CategoryPageProps {
  params: { slug: string }
}

async function getCategoryWithProducts(slug: string) {
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      },
    },
  })

  return category
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = await getCategoryWithProducts(params.slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/categories" className="hover:text-primary">
          Categories
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{category.name}</span>
      </nav>

      {/* Category Header */}
      <div className="mb-8">
        <div className="relative overflow-hidden rounded-lg bg-muted">
          <div className="relative h-48 md:h-64">
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-primary/20 to-accent/20" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h1 className="text-3xl font-bold md:text-4xl">{category.name}</h1>
              {category.description && (
                <p className="mt-2 text-white/80">{category.description}</p>
              )}
              <p className="mt-2 text-sm text-white/60">
                {category.products.length} products
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Products */}
      {category.products.length > 0 ? (
        <ProductGrid
          initialProducts={category.products.map((p) => ({
            ...p,
            price: Number(p.price),
            comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
          }))}
        />
      ) : (
        <div className="py-12 text-center">
          <p className="text-lg text-muted-foreground">
            No products in this category yet.
          </p>
          <Link href="/products" className="mt-4 text-primary hover:underline">
            Browse all products
          </Link>
        </div>
      )}
    </div>
  )
}
