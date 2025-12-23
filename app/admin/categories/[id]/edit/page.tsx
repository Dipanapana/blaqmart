import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { CategoryForm } from "../../category-form"

async function getCategory(id: string) {
  return db.category.findUnique({
    where: { id },
  })
}

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string }
}) {
  const category = await getCategory(params.id)

  if (!category) {
    notFound()
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/categories"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Categories
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">
          Update category information
        </p>
      </div>

      <CategoryForm category={category} />
    </div>
  )
}
