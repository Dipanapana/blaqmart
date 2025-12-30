"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

const schoolSchema = z.object({
  name: z.string().min(1, "Name is required"),
  town: z.string().min(1, "Town is required"),
  schoolType: z.string().optional(),
  address: z.string().optional(),
  contactEmail: z.string().email().optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  description: z.string().optional(),
  isActive: z.boolean(),
  isPartner: z.boolean(),
})

type SchoolFormData = z.infer<typeof schoolSchema>

interface Grade {
  id: string
  name: string
  slug: string
  sortOrder: number
}

interface SchoolFormProps {
  school?: {
    id: string
    name: string
    slug: string
    town: string
    schoolType: string | null
    address: string | null
    contactEmail: string | null
    contactPhone: string | null
    description: string | null
    isActive: boolean
    isPartner: boolean
    grades: Array<{ grade: Grade }>
  }
  allGrades: Grade[]
}

export function SchoolForm({ school, allGrades }: SchoolFormProps) {
  const [selectedGrades, setSelectedGrades] = useState<string[]>(
    school?.grades.map((g) => g.grade.id) || []
  )
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const isEditing = !!school

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SchoolFormData>({
    resolver: zodResolver(schoolSchema),
    defaultValues: {
      name: school?.name || "",
      town: school?.town || "Warrenton",
      schoolType: school?.schoolType || "",
      address: school?.address || "",
      contactEmail: school?.contactEmail || "",
      contactPhone: school?.contactPhone || "",
      description: school?.description || "",
      isActive: school?.isActive ?? true,
      isPartner: school?.isPartner ?? false,
    },
  })

  const toggleGrade = (gradeId: string) => {
    setSelectedGrades((prev) =>
      prev.includes(gradeId)
        ? prev.filter((id) => id !== gradeId)
        : [...prev, gradeId]
    )
  }

  const onSubmit = async (data: SchoolFormData) => {
    startTransition(async () => {
      try {
        const url = isEditing
          ? `/api/admin/schools/${school.id}`
          : "/api/admin/schools"
        const method = isEditing ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            gradeIds: selectedGrades,
          }),
        })

        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Failed to save school")
        }

        toast.success(
          isEditing
            ? "School updated successfully"
            : "School created successfully"
        )
        router.push("/admin/schools")
        router.refresh()
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to save school"
        )
      }
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>School Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                School Name <span className="text-destructive">*</span>
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="town">
                Town <span className="text-destructive">*</span>
              </Label>
              <Select
                value={watch("town")}
                onValueChange={(value) => setValue("town", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select town" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Warrenton">Warrenton</SelectItem>
                  <SelectItem value="Jan Kempdorp">Jan Kempdorp</SelectItem>
                  <SelectItem value="Hartswater">Hartswater</SelectItem>
                  <SelectItem value="Christiana">Christiana</SelectItem>
                  <SelectItem value="Kimberley">Kimberley</SelectItem>
                </SelectContent>
              </Select>
              {errors.town && (
                <p className="text-sm text-destructive">{errors.town.message}</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="schoolType">School Type</Label>
              <Select
                value={watch("schoolType") || ""}
                onValueChange={(value) => setValue("schoolType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Primary">Primary</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Secondary">Secondary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" {...register("address")} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                {...register("contactEmail")}
              />
              {errors.contactEmail && (
                <p className="text-sm text-destructive">
                  {errors.contactEmail.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone</Label>
              <Input id="contactPhone" {...register("contactPhone")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" {...register("description")} rows={3} />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) =>
                  setValue("isActive", checked as boolean)
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPartner"
                checked={watch("isPartner")}
                onCheckedChange={(checked) =>
                  setValue("isPartner", checked as boolean)
                }
              />
              <Label htmlFor="isPartner" className="cursor-pointer">
                Partner School (allows school collection)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Grades</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Select the grades available at this school
          </p>
          <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {allGrades.map((grade) => (
              <div
                key={grade.id}
                className={`flex items-center space-x-2 rounded-md border p-3 cursor-pointer transition-colors ${
                  selectedGrades.includes(grade.id)
                    ? "border-primary bg-primary/5"
                    : "border-muted hover:border-primary/50"
                }`}
                onClick={() => toggleGrade(grade.id)}
              >
                <Checkbox
                  checked={selectedGrades.includes(grade.id)}
                  onCheckedChange={() => toggleGrade(grade.id)}
                />
                <Label className="cursor-pointer">{grade.name}</Label>
              </div>
            ))}
          </div>
          {selectedGrades.length > 0 && (
            <p className="text-sm text-muted-foreground mt-4">
              {selectedGrades.length} grade(s) selected
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update School"
          ) : (
            "Create School"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
