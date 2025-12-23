import Link from "next/link"
import { Plus, Package, MoreHorizontal, Pencil, Trash2, Eye, EyeOff } from "lucide-react"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

async function getHamperPresets() {
  return db.hamperPreset.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  })
}

export default async function AdminHampersPage() {
  const hampers = await getHamperPresets()

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hamper Presets</h1>
          <p className="text-muted-foreground">
            Manage pre-built hamper packages for customers
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/hampers/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Hamper Preset
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {hampers.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No hamper presets yet</p>
              <p className="text-muted-foreground mb-4">
                Create your first hamper preset to get started
              </p>
              <Button asChild>
                <Link href="/admin/hampers/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Hamper Preset
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          hampers.map((hamper) => (
            <Card key={hamper.id} className="overflow-hidden">
              <div className="aspect-video relative bg-muted">
                {hamper.image ? (
                  <img
                    src={hamper.image}
                    alt={hamper.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-2">
                  {hamper.isFeatured && (
                    <Badge variant="default">Featured</Badge>
                  )}
                  {!hamper.isActive && (
                    <Badge variant="secondary">
                      <EyeOff className="mr-1 h-3 w-3" />
                      Hidden
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{hamper.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/hampers/${hamper.id}/edit`}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/hamper-builder?preset=${hamper.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {hamper.description || "No description"}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">
                      {formatPrice(Number(hamper.price))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {hamper.items.length} items included
                    </p>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/hampers/${hamper.id}/edit`}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
