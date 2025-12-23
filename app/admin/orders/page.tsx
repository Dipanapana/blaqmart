import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { db } from "@/lib/db"
import { formatPrice, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface OrdersPageProps {
  searchParams: { status?: string }
}

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PREPARING: "secondary",
  READY: "secondary",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

async function getOrders(status?: string) {
  const where: any = {}
  if (status && status !== "all") {
    where.status = status
  }

  return db.order.findMany({
    where,
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function AdminOrdersPage({
  searchParams,
}: OrdersPageProps) {
  const orders = await getOrders(searchParams.status)

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Orders</h1>
        <form>
          <Select name="status" defaultValue={searchParams.status || "all"}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="PREPARING">Preparing</SelectItem>
              <SelectItem value="OUT_FOR_DELIVERY">Out for Delivery</SelectItem>
              <SelectItem value="DELIVERED">Delivered</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </form>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{orders.length} Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No orders found
              </p>
            ) : (
              orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">
                      {order.shippingName} · {order.shippingSuburb}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatPrice(Number(order.total))}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} items
                      </p>
                      <Badge
                        variant={statusColors[order.status]}
                        className="mt-1"
                      >
                        {order.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
