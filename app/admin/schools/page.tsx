import Link from "next/link"
import { Plus, School, MoreHorizontal, Edit, List, GraduationCap } from "lucide-react"
import { db } from "@/lib/db"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export const dynamic = 'force-dynamic'

async function getSchools() {
  return db.school.findMany({
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
      _count: {
        select: {
          schoolStationeryItems: true,
          orders: true,
        },
      },
    },
    orderBy: [
      { schoolType: "asc" },
      { name: "asc" },
    ],
  })
}

export default async function AdminSchoolsPage() {
  const schools = await getSchools()

  // Group schools by type
  const groupedSchools = {
    Primary: schools.filter((s) => s.schoolType === "Primary"),
    Intermediate: schools.filter((s) => s.schoolType === "Intermediate"),
    Secondary: schools.filter((s) => s.schoolType === "Secondary"),
    Other: schools.filter((s) => !s.schoolType),
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schools</h1>
        <Button asChild>
          <Link href="/admin/schools/new">
            <Plus className="mr-2 h-4 w-4" />
            Add School
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{schools.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              With Stationery Lists
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {schools.filter((s) => s._count.schoolStationeryItems > 0).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Partner Schools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              {schools.filter((s) => s.isPartner).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{schools.length} Schools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-muted-foreground">
                  <th className="pb-3 font-medium">School</th>
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Grades</th>
                  <th className="pb-3 font-medium">Stationery Items</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => {
                  const grades = school.grades.map((sg) => sg.grade)
                  const gradeRange = grades.length > 0
                    ? `${grades[0].name} - ${grades[grades.length - 1].name}`
                    : "No grades"

                  return (
                    <tr key={school.id} className="border-b">
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                            <School className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{school.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {school.town}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant="outline">
                          {school.schoolType || "Not set"}
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{gradeRange}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <Badge variant={school._count.schoolStationeryItems > 0 ? "default" : "secondary"}>
                          {school._count.schoolStationeryItems} items
                        </Badge>
                      </td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          <Badge variant={school.isActive ? "success" : "secondary"}>
                            {school.isActive ? "Active" : "Inactive"}
                          </Badge>
                          {school.isPartner && (
                            <Badge variant="default">Partner</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/schools/${school.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit School
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/schools/${school.id}/stationery`}>
                                <List className="mr-2 h-4 w-4" />
                                Manage Stationery
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {schools.length === 0 && (
            <div className="py-12 text-center">
              <School className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No schools yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Add your first school to get started.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/schools/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add School
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
