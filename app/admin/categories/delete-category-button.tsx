"use client"

import { Trash } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

interface DeleteCategoryButtonProps {
  categoryId: string
  categoryName: string
  hasProducts: boolean
}

export function DeleteCategoryButton({
  categoryId,
  categoryName,
  hasProducts,
}: DeleteCategoryButtonProps) {
  const router = useRouter()
  const [showDialog, setShowDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to delete category")
      }

      toast.success("Category deleted successfully")
      router.refresh()
      setShowDialog(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete category")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <DropdownMenuItem
        className="text-destructive"
        disabled={hasProducts}
        onSelect={(e) => {
          e.preventDefault()
          if (!hasProducts) {
            setShowDialog(true)
          }
        }}
      >
        <Trash className="mr-2 h-4 w-4" />
        Delete
        {hasProducts && (
          <span className="ml-2 text-xs text-muted-foreground">
            (has products)
          </span>
        )}
      </DropdownMenuItem>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{categoryName}"? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
