import { Metadata } from "next"
import Link from "next/link"
import { School, GraduationCap, MapPin } from "lucide-react"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = {
  title: "Schools | Blaqmart Stationery",
  description: "Browse stationery lists for schools in Warrenton. Find everything your child needs for the school year.",
}

async function getSchools() {
  return db.school.findMany({
    where: { isActive: true },
    include: {
      grades: {
        include: {
          grade: {
            select: {
              id: true,
              name: true,
              slug: true,
              sortOrder: true,
            },
          },
        },
        orderBy: {
          grade: {
            sortOrder: "asc",
          },
        },
      },
      _count: {
        select: {
          schoolStationeryItems: true,
        },
      },
    },
    orderBy: [
      { schoolType: "asc" },
      { name: "asc" },
    ],
  })
}

export default async function SchoolsPage() {
  const schools = await getSchools()

  // Group schools by type
  const groupedSchools = {
    Primary: schools.filter((s) => s.schoolType === "Primary"),
    Intermediate: schools.filter((s) => s.schoolType === "Intermediate"),
    Secondary: schools.filter((s) => s.schoolType === "Secondary"),
  }

  return (
    <div className="container py-8">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Schools in Warrenton</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Find your school and browse our complete stationery lists. Each list is tailored to your school&apos;s requirements.
        </p>
      </div>

      {/* Schools by Type */}
      {Object.entries(groupedSchools).map(([type, typeSchools]) => {
        if (typeSchools.length === 0) return null

        return (
          <section key={type} className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <School className="h-6 w-6 text-primary" />
              {type} Schools
            </h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {typeSchools.map((school) => {
                const grades = school.grades.map((sg) => sg.grade)
                const gradeRange = grades.length > 0
                  ? `${grades[0].name} - ${grades[grades.length - 1].name}`
                  : "No grades assigned"

                return (
                  <Card key={school.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                            <School className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{school.name}</CardTitle>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {school.town}
                            </div>
                          </div>
                        </div>
                        {school.isPartner && (
                          <Badge variant="default">Partner</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      {school.description && (
                        <p className="text-sm text-muted-foreground mb-4">
                          {school.description}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm mb-4">
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                        <span>{gradeRange}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant={school._count.schoolStationeryItems > 0 ? "secondary" : "outline"}>
                          {school._count.schoolStationeryItems > 0
                            ? `${school._count.schoolStationeryItems} items`
                            : "Coming Soon"}
                        </Badge>

                        <Button asChild size="sm">
                          <Link href={`/schools/${school.slug}`}>
                            View Grades
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </section>
        )
      })}

      {schools.length === 0 && (
        <div className="text-center py-12">
          <School className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-medium">No schools available yet</h2>
          <p className="mt-2 text-muted-foreground">
            We&apos;re adding schools soon. Check back later!
          </p>
        </div>
      )}
    </div>
  )
}
