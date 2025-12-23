import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package, GraduationCap, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { ProductGrid } from '@/components/storefront/product-grid'
import { StationeryPackCard } from '@/components/storefront/stationery-pack-card'
import { GradeSelectorCompact } from '@/components/storefront/grade-selector'

interface GradePageProps {
  params: { slug: string }
}

async function getGradeData(slug: string) {
  const grade = await db.grade.findUnique({
    where: { slug },
  })

  if (!grade) return null

  const [packs, products, allGrades] = await Promise.all([
    db.stationeryPack.findMany({
      where: { gradeId: grade.id, isActive: true },
      include: {
        grade: true,
        school: true,
        items: {
          include: { product: true },
          take: 5,
        },
      },
      orderBy: { sortOrder: 'asc' },
    }),
    db.product.findMany({
      where: {
        isActive: true,
        tags: { contains: grade.slug },
      },
      take: 12,
      orderBy: { createdAt: 'desc' },
    }),
    db.grade.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return { grade, packs, products, allGrades }
}

export async function generateMetadata({ params }: GradePageProps) {
  const data = await getGradeData(params.slug)
  if (!data) return { title: 'Grade Not Found' }

  return {
    title: `${data.grade.name} Stationery | Blaqmart`,
    description: `Complete stationery packs and supplies for ${data.grade.name}. Quality school supplies delivered to your door in Warrenton and surrounding areas.`,
  }
}

export default async function GradePage({ params }: GradePageProps) {
  const data = await getGradeData(params.slug)

  if (!data) {
    notFound()
  }

  const { grade, packs, products, allGrades } = data

  // Transform products
  const transformedProducts = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: Number(p.price),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : null,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images as string[]),
    stock: p.stock,
    isFeatured: p.isFeatured,
  }))

  // Get grade phase info for styling
  const getGradePhase = (slug: string) => {
    const phases = [
      { name: 'Foundation Phase', slugs: ['grade-r', 'grade-1', 'grade-2', 'grade-3'], color: 'blue' },
      { name: 'Intermediate Phase', slugs: ['grade-4', 'grade-5', 'grade-6'], color: 'emerald' },
      { name: 'Senior Phase', slugs: ['grade-7', 'grade-8', 'grade-9'], color: 'amber' },
      { name: 'FET Phase', slugs: ['grade-10', 'grade-11', 'grade-12'], color: 'rose' },
    ]
    return phases.find((p) => p.slugs.includes(slug)) || phases[0]
  }

  const phase = getGradePhase(grade.slug)
  const isMatric = grade.slug === 'grade-12'

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className={`bg-gradient-to-br from-${phase.color}-500 to-${phase.color}-600 py-12 text-white`}>
        <div className="container">
          <Button variant="ghost" size="sm" className="mb-4 text-white/80 hover:text-white hover:bg-white/10" asChild>
            <Link href="/#shop-by-grade">
              <ArrowLeft className="mr-2 h-4 w-4" />
              All Grades
            </Link>
          </Button>

          <div className="flex items-center gap-4">
            <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm`}>
              <span className="text-4xl font-bold">{grade.name.replace('Grade ', '')}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold sm:text-4xl">{grade.name}</h1>
                {isMatric && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900">
                    <Sparkles className="h-3 w-3" />
                    Matric
                  </span>
                )}
              </div>
              <p className="mt-1 text-white/80">{phase.name}</p>
              {grade.description && (
                <p className="mt-2 max-w-xl text-white/70">{grade.description}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Grade Selector */}
      <section className="border-b py-4">
        <div className="container">
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            <span className="shrink-0 text-sm font-medium text-muted-foreground">Quick switch:</span>
            <GradeSelectorCompact
              grades={allGrades}
              selectedGrade={grade.slug}
            />
          </div>
        </div>
      </section>

      {/* Stationery Packs for this Grade */}
      {packs.length > 0 && (
        <section className="py-10 sm:py-12">
          <div className="container">
            <div className="mb-6 flex items-center gap-3">
              <div className={`rounded-full bg-${phase.color}-100 p-2`}>
                <Package className={`h-5 w-5 text-${phase.color}-600`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{grade.name} Stationery Packs</h2>
                <p className="text-muted-foreground">Complete packs with everything your child needs</p>
              </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {packs.map((pack) => (
                <StationeryPackCard
                  key={pack.id}
                  pack={{
                    id: pack.id,
                    name: pack.name,
                    slug: pack.slug,
                    description: pack.description || undefined,
                    image: pack.image || undefined,
                    price: Number(pack.price),
                    comparePrice: pack.comparePrice ? Number(pack.comparePrice) : undefined,
                    gradeName: pack.grade?.name,
                    schoolName: pack.school?.name,
                    itemCount: pack.items.length,
                    items: pack.items.map((item) => ({
                      id: item.id,
                      productName: item.product.name,
                      quantity: item.quantity,
                    })),
                    isFeatured: pack.isFeatured,
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Individual Products */}
      {transformedProducts.length > 0 && (
        <section className="bg-muted/30 py-10 sm:py-12">
          <div className="container">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Individual Items</h2>
                <p className="text-muted-foreground">Shop items separately for {grade.name}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href={`/products?grade=${grade.slug}`}>
                  View All
                </Link>
              </Button>
            </div>

            <ProductGrid products={transformedProducts} />
          </div>
        </section>
      )}

      {/* Empty State */}
      {packs.length === 0 && transformedProducts.length === 0 && (
        <section className="py-20">
          <div className="container text-center">
            <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground/50" />
            <h2 className="mt-4 text-xl font-semibold">No products yet</h2>
            <p className="mt-2 text-muted-foreground">
              We're adding {grade.name} products soon. Check back later!
            </p>
            <Button className="mt-6" asChild>
              <Link href="/products">Browse All Products</Link>
            </Button>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="bg-primary py-10 text-white">
        <div className="container text-center">
          <h2 className="text-xl font-bold sm:text-2xl">Need help choosing?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/80">
            Our stationery packs include everything on the official {grade.name} requirements list.
            Order now and we'll deliver to your door!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Button variant="accent" asChild>
              <Link href="/contact">Contact Us</Link>
            </Button>
            <Button variant="outline" className="border-white text-white hover:bg-white hover:text-primary" asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
