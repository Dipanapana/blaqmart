import Link from "next/link"
import {
  Package,
  ShoppingCart,
  DollarSign,
  AlertCircle,
  ChevronRight,
} from "lucide-react"
import { db } from "@/lib/db"
import { formatPrice } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ActivityFeed } from "@/components/admin/activity-feed"
import { OrderAlerts } from "@/components/admin/order-alerts"

export const dynamic = 'force-dynamic'

async function getDashboardStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const [
    todayOrders,
    todayRevenue,
    pendingOrders,
    lowStockProducts,
    recentOrders,
    totalProducts,
    recentActivity,
    staleOrders,
  ] = await Promise.all([
    db.order.count({
      where: { createdAt: { gte: today } },
    }),
    db.order.aggregate({
      where: {
        createdAt: { gte: today },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
    }),
    db.order.count({
      where: { status: "PENDING" },
    }),
    db.product.count({
      where: {
        isActive: true,
        trackStock: true,
        stock: { lte: 5 },
      },
    }),
    db.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        items: true,
      },
    }),
    db.product.count({ where: { isActive: true } }),
    // Recent activity logs
    db.activityLog.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
    // Stale orders (pending > 24 hours)
    db.order.findMany({
      where: {
        status: "PENDING",
        createdAt: { lt: twentyFourHoursAgo },
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        orderNumber: true,
        shippingName: true,
        createdAt: true,
        total: true,
      },
    }),
  ])

  return {
    todayOrders,
    todayRevenue: Number(todayRevenue._sum.total || 0),
    pendingOrders,
    lowStockProducts,
    recentOrders,
    totalProducts,
    recentActivity: recentActivity.map((a) => ({
      ...a,
      details: a.details as Record<string, unknown> | null,
    })),
    staleOrders: staleOrders.map((o) => ({
      ...o,
      total: Number(o.total),
    })),
  }
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

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">Dashboard</h1>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Orders
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">orders received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Today&apos;s Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(stats.todayRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">from paid orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <AlertCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockProducts}</div>
            <p className="text-xs text-muted-foreground">
              of {stats.totalProducts} products
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Activity Grid */}
      <div className="mb-8 grid gap-4 lg:grid-cols-2">
        <OrderAlerts
          staleOrders={stats.staleOrders}
          unprocessedCount={stats.pendingOrders}
        />
        <ActivityFeed activities={stats.recentActivity} />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link
            href="/admin/orders"
            className="text-sm text-primary hover:underline"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground">No orders yet</p>
            ) : (
              stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted"
                >
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.shippingName} · {order.items.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(Number(order.total))}
                      </p>
                      <Badge variant={statusColors[order.status]} className="text-xs">
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
