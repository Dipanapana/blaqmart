import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { ProductForm } from "../../product-form"

interface EditProductPageProps {
  params: { id: string }
}

async function getProduct(id: string) {
  return db.product.findUnique({
    where: { id },
    include: {
      category: true,
      supplier: true,
    },
  })
}

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

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const [product, categories, suppliers] = await Promise.all([
    getProduct(params.id),
    getCategories(),
    getSuppliers(),
  ])

  if (!product) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold">Edit Product</h1>
        <p className="text-muted-foreground">Update product information</p>
      </div>

      <ProductForm
        product={{
          ...product,
          price: Number(product.price),
          compareAtPrice: product.comparePrice
            ? Number(product.comparePrice)
            : null,
          comparePrice: product.comparePrice
            ? Number(product.comparePrice)
            : null,
          weight: product.weight ? Number(product.weight) : null,
          images: typeof product.images === 'string'
            ? JSON.parse(product.images)
            : (product.images || []),
        }}
        categories={categories}
        suppliers={suppliers}
      />
    </div>
  )
}
