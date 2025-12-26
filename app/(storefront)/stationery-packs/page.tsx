import Link from 'next/link'
import { Package, GraduationCap, Filter, Sparkles } from 'lucide-react'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/button'
import { StationeryPackCardWithCart } from '@/components/storefront/stationery-pack-card-with-cart'
import { GradeSelectorCompact } from '@/components/storefront/grade-selector'

interface StationeryPacksPageProps {
  searchParams: { grade?: string }
}

async function getPacksData(gradeSlug?: string) {
  const whereClause: { isActive: boolean; grade?: { slug: string } } = {
    isActive: true,
  }

  if (gradeSlug) {
    whereClause.grade = { slug: gradeSlug }
  }

  const [packs, grades] = await Promise.all([
    db.stationeryPack.findMany({
      where: whereClause,
      include: {
        grade: true,
        school: true,
        items: {
          include: { product: true },
          take: 5,
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
    }),
    db.grade.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    }),
  ])

  return { packs, grades }
}

export const metadata = {
  title: 'Stationery Packs | Blaqmart',
  description: 'Complete school stationery packs for Grade R to Matric. Everything your child needs in one convenient pack, delivered to your door.',
}

export default async function StationeryPacksPage({ searchParams }: StationeryPacksPageProps) {
  const { packs, grades } = await getPacksData(searchParams.grade)

  // Group packs by phase
  const phases = [
    { name: 'Foundation Phase', slugs: ['grade-r', 'grade-1', 'grade-2', 'grade-3'], color: 'blue', icon: '🎨' },
    { name: 'Intermediate Phase', slugs: ['grade-4', 'grade-5', 'grade-6'], color: 'emerald', icon: '📚' },
    { name: 'Senior Phase', slugs: ['grade-7', 'grade-8', 'grade-9'], color: 'amber', icon: '🔬' },
    { name: 'FET Phase', slugs: ['grade-10', 'grade-11', 'grade-12'], color: 'rose', icon: '🎓' },
  ]

  const groupedPacks = phases.map((phase) => ({
    ...phase,
    packs: packs.filter((pack) => pack.grade && phase.slugs.includes(pack.grade.slug)),
  })).filter((phase) => phase.packs.length > 0)

  const selectedGrade = searchParams.grade
  const totalPacks = packs.length

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary to-primary/90 py-12 text-white">
        <div className="container">
          <div className="flex items-center gap-4 mb-4">
            <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
              <Package className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold sm:text-4xl">Stationery Packs</h1>
              <p className="mt-1 text-white/80">
                Complete school supply packs for every grade
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">{totalPacks}</p>
              <p className="text-sm text-white/70">Available Packs</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">R199+</p>
              <p className="text-sm text-white/70">Starting From</p>
            </div>
            <div className="rounded-xl bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-2xl font-bold">40%</p>
              <p className="text-sm text-white/70">Average Savings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="sticky top-16 z-40 border-b bg-background/95 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by grade:</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
              <Button
                variant={!selectedGrade ? 'default' : 'outline'}
                size="sm"
                asChild
              >
                <Link href="/stationery-packs">All Grades</Link>
              </Button>
              <GradeSelectorCompact
                grades={grades}
                selectedGrade={selectedGrade}
                onSelect={undefined}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Packs Grid */}
      <section className="py-10 sm:py-12">
        <div className="container">
          {selectedGrade ? (
            // Filtered view - flat grid
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold">
                  {grades.find((g) => g.slug === selectedGrade)?.name || 'Selected'} Packs
                </h2>
                <p className="text-muted-foreground">
                  {packs.length} pack{packs.length !== 1 ? 's' : ''} available
                </p>
              </div>
              {packs.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {packs.map((pack, index) => (
                    <StationeryPackCardWithCart
                      key={pack.id}
                      index={index}
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
              ) : (
                <div className="py-20 text-center">
                  <GraduationCap className="mx-auto h-16 w-16 text-muted-foreground/50" />
                  <h3 className="mt-4 text-lg font-semibold">No packs for this grade yet</h3>
                  <p className="mt-2 text-muted-foreground">
                    We're adding more packs soon. Check back later!
                  </p>
                  <Button className="mt-4" asChild>
                    <Link href="/stationery-packs">View All Packs</Link>
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Grouped by phase view
            <div className="space-y-12">
              {groupedPacks.map((phase) => (
                <div key={phase.name}>
                  <div className="mb-6 flex items-center gap-3">
                    <span className="text-2xl">{phase.icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold">{phase.name}</h2>
                      <p className="text-muted-foreground">
                        {phase.packs.length} pack{phase.packs.length !== 1 ? 's' : ''} available
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {phase.packs.map((pack, index) => (
                      <StationeryPackCardWithCart
                        key={pack.id}
                        index={index}
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
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-10 sm:py-12">
        <div className="container">
          <h2 className="mb-8 text-center text-2xl font-bold">Why Choose Our Packs?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Complete Sets</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Everything on the official requirements list
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Quality Brands</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Staedtler, Croxley, Casio and more
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                <span className="text-xl">💰</span>
              </div>
              <h3 className="font-semibold">Save Up to 40%</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Compared to buying items separately
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <span className="text-xl">🚚</span>
              </div>
              <h3 className="font-semibold">Free Local Delivery</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Warrenton & Jan Kempdorp
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-10 text-white">
        <div className="container text-center">
          <h2 className="text-xl font-bold sm:text-2xl">Can't find what you need?</h2>
          <p className="mx-auto mt-2 max-w-xl text-white/80">
            We can create custom packs for your school's specific requirements.
            Contact us for bulk orders and special requests.
          </p>
          <Button variant="accent" className="mt-6" asChild>
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
