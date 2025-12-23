import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, ChevronRight, ShoppingBag } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/shared/empty-state"

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PREPARING: "secondary",
  READY: "secondary",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

async function getOrders(userId: string) {
  return db.order.findMany({
    where: { customerId: userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function OrdersPage() {
  const session = await auth()

  if (!session) {
    redirect("/login?callbackUrl=/orders")
  }

  const orders = await getOrders(session.user.id)

  return (
    <div className="container py-8">
      <h1 className="mb-8 text-3xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders yet"
          description="When you place an order, it will appear here"
          actionLabel="Start Shopping"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                        <Package className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(order.createdAt)} · {order.items.length}{" "}
                          {order.items.length === 1 ? "item" : "items"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatPrice(Number(order.total))}
                        </p>
                        <Badge variant={statusColors[order.status]}>
                          {order.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
