import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { SchoolForm } from "../school-form"

async function getGrades() {
  return db.grade.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
}

export default async function NewSchoolPage() {
  const grades = await getGrades()

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/schools"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Schools
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New School</h1>
        <p className="text-muted-foreground">
          Create a new school and assign grades
        </p>
      </div>

      <SchoolForm allGrades={grades} />
    </div>
  )
}
