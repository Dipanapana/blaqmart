import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { HamperForm } from "../../hamper-form"

interface EditHamperPageProps {
  params: { id: string }
}

async function getHamper(id: string) {
  return db.hamperPreset.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  })
}

async function getProducts() {
  return db.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })
}

export default async function EditHamperPage({ params }: EditHamperPageProps) {
  const [hamper, products] = await Promise.all([
    getHamper(params.id),
    getProducts(),
  ])

  if (!hamper) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/hampers"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Hamper Presets
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Hamper Preset</h1>
        <p className="text-muted-foreground">Update hamper preset details</p>
      </div>

      <HamperForm
        hamper={{
          ...hamper,
          price: Number(hamper.price),
          items: hamper.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        }}
        products={products.map((p) => ({
          ...p,
          price: Number(p.price),
          images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
        }))}
      />
    </div>
  )
}
