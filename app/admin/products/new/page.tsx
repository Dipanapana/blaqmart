import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { ProductForm } from "../product-form"

export const dynamic = 'force-dynamic'

async function getCategories() {
  return db.category.findMany({
    orderBy: { name: "asc" },
  })
}

async function getSuppliers() {
  return db.supplier.findMany({
    where: { isActive: true },
    orderBy: { shopName: "asc" },
  })
}

export default async function NewProductPage() {
  const [categories, suppliers] = await Promise.all([
    getCategories(),
    getSuppliers(),
  ])

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">
          Create a new product for your store
        </p>
      </div>

      <ProductForm categories={categories} suppliers={suppliers} />
    </div>
  )
}
