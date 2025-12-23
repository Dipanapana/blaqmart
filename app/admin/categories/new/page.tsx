import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { CategoryForm } from "../category-form"

export default function NewCategoryPage() {
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
        <h1 className="text-3xl font-bold">Add New Category</h1>
        <p className="text-muted-foreground">
          Create a new product category
        </p>
      </div>

      <CategoryForm />
    </div>
  )
}
