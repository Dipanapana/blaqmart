import Link from "next/link"
import Image from "next/image"
import { db } from "@/lib/db"
import { Card, CardContent } from "@/components/ui/card"

export const dynamic = 'force-dynamic'

async function getCategories() {
  return db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  })
}

export default async function CategoriesPage() {
  const categories = await getCategories()

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">Shop by Category</h1>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {categories.map((category) => (
          <Link key={category.id} href={`/categories/${category.slug}`}>
            <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
              <div className="relative aspect-[4/3] bg-muted">
                {category.image ? (
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                    <span className="text-6xl font-bold text-primary/20">
                      {category.name.charAt(0)}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h2 className="text-xl font-bold">{category.name}</h2>
                  <p className="text-sm text-white/80">
                    {category._count.products} products
                  </p>
                </div>
              </div>
              {category.description && (
                <CardContent className="p-4">
                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
