import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { db } from "@/lib/db"
import { StationeryManager } from "./stationery-manager"

async function getSchool(id: string) {
  return db.school.findUnique({
    where: { id },
    include: {
      grades: {
        include: {
          grade: true,
        },
        orderBy: {
          grade: {
            sortOrder: "asc",
          },
        },
      },
      schoolStationeryItems: {
        include: {
          grade: true,
          product: true,
        },
        orderBy: [
          { grade: { sortOrder: "asc" } },
          { sortOrder: "asc" },
        ],
      },
    },
  })
}

async function getProducts() {
  return db.product.findMany({
    where: { isActive: true },
    include: {
      category: true,
    },
    orderBy: [
      { category: { name: "asc" } },
      { name: "asc" },
    ],
  })
}

export default async function SchoolStationeryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [school, products] = await Promise.all([getSchool(id), getProducts()])

  if (!school) {
    notFound()
  }

  // Format products with parsed images
  const formattedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
    images: (() => {
      try {
        return JSON.parse(p.images || "[]")
      } catch {
        return []
      }
    })(),
  }))

  // Group stationery items by grade
  const stationeryByGrade = school.schoolStationeryItems.reduce((acc, item) => {
    const gradeId = item.gradeId
    if (!acc[gradeId]) {
      acc[gradeId] = []
    }
    acc[gradeId].push({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price),
      },
    })
    return acc
  }, {} as Record<string, typeof school.schoolStationeryItems>)

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
        <h1 className="text-3xl font-bold">Manage Stationery Lists</h1>
        <p className="text-muted-foreground">
          {school.name} - {school.town}
        </p>
      </div>

      <StationeryManager
        schoolId={school.id}
        schoolName={school.name}
        grades={school.grades.map((sg) => sg.grade)}
        stationeryByGrade={stationeryByGrade}
        products={formattedProducts}
      />
    </div>
  )
}
