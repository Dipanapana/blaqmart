import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { HamperForm } from "../hamper-form"

export const dynamic = 'force-dynamic'

async function getProducts() {
  return db.product.findMany({
    where: { isActive: true },
    include: { category: true },
    orderBy: [{ category: { name: "asc" } }, { name: "asc" }],
  })
}

export default async function NewHamperPage() {
  const products = await getProducts()

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
        <h1 className="text-3xl font-bold">Create Hamper Preset</h1>
        <p className="text-muted-foreground">
          Create a pre-built hamper package for customers
        </p>
      </div>

      <HamperForm
        products={products.map((p) => ({
          ...p,
          price: Number(p.price),
          images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
        }))}
      />
    </div>
  )
}
