import { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { School, GraduationCap, MapPin, ArrowLeft, List, Phone, Mail } from "lucide-react"
import { db } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { WhatsAppButton } from "@/components/shared/whatsapp-button"

interface SchoolPageProps {
  params: Promise<{ slug: string }>
}

async function getSchool(slug: string) {
  return db.school.findUnique({
    where: { slug, isActive: true },
    include: {
      grades: {
        include: {
          grade: {
            select: {
              id: true,
              name: true,
              slug: true,
              sortOrder: true,
              image: true,
            },
          },
        },
        orderBy: {
          grade: {
            sortOrder: "asc",
          },
        },
      },
    },
  })
}

async function getStationeryCounts(schoolId: string) {
  return db.schoolStationeryItem.groupBy({
    by: ["gradeId"],
    where: { schoolId },
    _count: { id: true },
  })
}

export async function generateMetadata({ params }: SchoolPageProps): Promise<Metadata> {
  const { slug } = await params
  const school = await getSchool(slug)

  if (!school) {
    return { title: "School Not Found | Blaqmart Stationery" }
  }

  return {
    title: `${school.name} | Blaqmart Stationery`,
    description: `Browse stationery lists for ${school.name}. Find everything your child needs for the school year.`,
  }
}

export default async function SchoolPage({ params }: SchoolPageProps) {
  const { slug } = await params
  const school = await getSchool(slug)

  if (!school) {
    notFound()
  }

  const stationeryCounts = await getStationeryCounts(school.id)
  const countMap = new Map(stationeryCounts.map((c) => [c.gradeId, c._count.id]))

  const grades = school.grades.map((sg) => ({
    ...sg.grade,
    itemCount: countMap.get(sg.grade.id) || 0,
    hasItems: (countMap.get(sg.grade.id) || 0) > 0,
  }))

  const gradeRange = grades.length > 0
    ? `${grades[0].name} - ${grades[grades.length - 1].name}`
    : null

  return (
    <div className="container py-8">
      {/* Back Link */}
      <Link
        href="/schools"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Schools
      </Link>

      {/* School Hero */}
      <div className="mb-8 rounded-lg bg-primary/5 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary/10">
              <School className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{school.name}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {school.town}
                </div>
                {school.schoolType && (
                  <Badge variant="outline">{school.schoolType} School</Badge>
                )}
                {school.isPartner && (
                  <Badge variant="default">Partner School</Badge>
                )}
              </div>
              {gradeRange && (
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  <span>{gradeRange}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {school.contactPhone && (
              <a
                href={`tel:${school.contactPhone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Phone className="h-4 w-4" />
                {school.contactPhone}
              </a>
            )}
            {school.contactEmail && (
              <a
                href={`mailto:${school.contactEmail}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <Mail className="h-4 w-4" />
                {school.contactEmail}
              </a>
            )}
            <WhatsAppButton
              message={`Hi! I'm looking for stationery for ${school.name}. Can you help me?`}
              className="mt-2"
            >
              Contact via WhatsApp
            </WhatsAppButton>
          </div>
        </div>

        {school.description && (
          <p className="text-muted-foreground mt-4">{school.description}</p>
        )}
      </div>

      {/* Grades Grid */}
      <section>
        <h2 className="text-2xl font-bold mb-6">Select a Grade</h2>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {grades.map((grade) => (
            <Link
              key={grade.id}
              href={`/schools/${school.slug}/grade/${grade.slug}`}
            >
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-primary" />
                    {grade.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant={grade.hasItems ? "secondary" : "outline"}>
                      {grade.hasItems ? (
                        <>
                          <List className="h-3 w-3 mr-1" />
                          {grade.itemCount} items
                        </>
                      ) : (
                        "Coming Soon"
                      )}
                    </Badge>
                    {grade.hasItems && (
                      <span className="text-sm text-primary font-medium">
                        View List →
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {grades.length === 0 && (
          <div className="text-center py-12 bg-muted/50 rounded-lg">
            <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No grades available</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              This school doesn&apos;t have any grades assigned yet.
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
