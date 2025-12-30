import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { SchoolForm } from "../../school-form"

async function getSchool(id: string) {
  return db.school.findUnique({
    where: { id },
    include: {
      grades: {
        include: {
          grade: true,
        },
      },
    },
  })
}

async function getGrades() {
  return db.grade.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  })
}

export default async function EditSchoolPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [school, grades] = await Promise.all([getSchool(id), getGrades()])

  if (!school) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold">Edit School</h1>
        <p className="text-muted-foreground">Update {school.name}</p>
      </div>

      <SchoolForm school={school} allGrades={grades} />
    </div>
  )
}
