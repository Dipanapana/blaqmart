/**
 * Analytics Query Functions
 *
 * Provides data for the admin analytics dashboard:
 * - Revenue trends (7/30 days)
 * - Orders by status
 * - Top selling products
 * - Sales by school
 * - Period comparisons (daily/weekly/monthly)
 */

import { db } from "@/lib/db"
import {
  startOfDay,
  startOfWeek,
  startOfMonth,
  subDays,
  subWeeks,
  subMonths,
  eachDayOfInterval,
  format,
} from "date-fns"

// ============== Types ==============

export interface DailyRevenue {
  date: string
  revenue: number
  orderCount: number
}

export interface OrderStatusCount {
  name: string
  value: number
  status: string
}

export interface TopProduct {
  name: string
  productId: string
  quantity: number
  revenue: number
}

export interface SchoolSales {
  name: string
  revenue: number
  orderCount: number
}

export interface PeriodMetrics {
  total: number
  orders: number
}

export interface ComparisonData {
  current: PeriodMetrics
  previous: PeriodMetrics
  change: number
}

export interface ComparisonMetrics {
  daily: ComparisonData
  weekly: ComparisonData
  monthly: ComparisonData
}

// ============== Revenue by Date Range ==============

export async function getRevenueByDateRange(days: number): Promise<DailyRevenue[]> {
  const endDate = new Date()
  const startDate = startOfDay(subDays(endDate, days - 1))

  // Get all paid orders in the date range
  const orders = await db.order.findMany({
    where: {
      createdAt: { gte: startDate },
      paymentStatus: "PAID",
    },
    select: {
      createdAt: true,
      total: true,
    },
  })

  // Generate all dates in range
  const dateRange = eachDayOfInterval({ start: startDate, end: endDate })

  // Aggregate by date
  return dateRange.map((date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayOrders = orders.filter(
      (o) => format(new Date(o.createdAt), "yyyy-MM-dd") === dateStr
    )

    return {
      date: format(date, "MMM dd"),
      revenue: dayOrders.reduce((sum, o) => sum + Number(o.total), 0),
      orderCount: dayOrders.length,
    }
  })
}

// ============== Orders by Status ==============

export async function getOrdersByStatus(): Promise<OrderStatusCount[]> {
  const statusCounts = await db.order.groupBy({
    by: ["status"],
    _count: { id: true },
  })

  const statusLabels: Record<string, string> = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READY: "Ready",
    OUT_FOR_DELIVERY: "Out for Delivery",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  }

  return statusCounts.map((item) => ({
    name: statusLabels[item.status] || item.status,
    value: item._count.id,
    status: item.status,
  }))
}

// ============== Top Selling Products ==============

export async function getTopSellingProducts(limit: number = 5): Promise<TopProduct[]> {
  // Aggregate order items by product
  const topProducts = await db.orderItem.groupBy({
    by: ["productId", "productName"],
    _sum: {
      quantity: true,
      totalPrice: true,
    },
    orderBy: {
      _sum: {
        quantity: "desc",
      },
    },
    take: limit,
  })

  return topProducts.map((item) => ({
    name: item.productName,
    productId: item.productId,
    quantity: item._sum.quantity || 0,
    revenue: Number(item._sum.totalPrice || 0),
  }))
}

// ============== Sales by School ==============

export async function getSalesBySchool(): Promise<SchoolSales[]> {
  // Get orders grouped by school (excluding null schoolId)
  const schoolOrders = await db.order.groupBy({
    by: ["schoolId"],
    where: {
      paymentStatus: "PAID",
    },
    _sum: { total: true },
    _count: { id: true },
  })

  // Get school names
  const schoolIds = schoolOrders
    .filter((s) => s.schoolId !== null)
    .map((s) => s.schoolId as string)

  const schools = await db.school.findMany({
    where: { id: { in: schoolIds } },
    select: { id: true, name: true },
  })

  const schoolMap = new Map(schools.map((s) => [s.id, s.name]))

  // Build results, separating school orders from direct orders
  const results: SchoolSales[] = []

  // Add school orders
  for (const item of schoolOrders) {
    if (item.schoolId) {
      results.push({
        name: schoolMap.get(item.schoolId) || "Unknown School",
        revenue: Number(item._sum.total || 0),
        orderCount: item._count.id,
      })
    }
  }

  // Add direct orders (no school)
  const directOrders = schoolOrders.find((s) => s.schoolId === null)
  if (directOrders) {
    results.push({
      name: "Direct Orders",
      revenue: Number(directOrders._sum.total || 0),
      orderCount: directOrders._count.id,
    })
  }

  // Sort by revenue descending
  return results.sort((a, b) => b.revenue - a.revenue)
}

// ============== Comparison Metrics ==============

async function getRevenueForPeriod(start: Date, end: Date): Promise<PeriodMetrics> {
  const result = await db.order.aggregate({
    where: {
      createdAt: { gte: start, lt: end },
      paymentStatus: "PAID",
    },
    _sum: { total: true },
    _count: { id: true },
  })

  return {
    total: Number(result._sum.total || 0),
    orders: result._count.id,
  }
}

function calculatePercentChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export async function getComparisonMetrics(): Promise<ComparisonMetrics> {
  const now = new Date()

  // Define period boundaries
  const todayStart = startOfDay(now)
  const yesterdayStart = startOfDay(subDays(now, 1))
  const thisWeekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
  const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 })
  const thisMonthStart = startOfMonth(now)
  const lastMonthStart = startOfMonth(subMonths(now, 1))

  // Fetch all metrics in parallel
  const [
    todayRevenue,
    yesterdayRevenue,
    thisWeekRevenue,
    lastWeekRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
  ] = await Promise.all([
    getRevenueForPeriod(todayStart, now),
    getRevenueForPeriod(yesterdayStart, todayStart),
    getRevenueForPeriod(thisWeekStart, now),
    getRevenueForPeriod(lastWeekStart, thisWeekStart),
    getRevenueForPeriod(thisMonthStart, now),
    getRevenueForPeriod(lastMonthStart, thisMonthStart),
  ])

  return {
    daily: {
      current: todayRevenue,
      previous: yesterdayRevenue,
      change: calculatePercentChange(yesterdayRevenue.total, todayRevenue.total),
    },
    weekly: {
      current: thisWeekRevenue,
      previous: lastWeekRevenue,
      change: calculatePercentChange(lastWeekRevenue.total, thisWeekRevenue.total),
    },
    monthly: {
      current: thisMonthRevenue,
      previous: lastMonthRevenue,
      change: calculatePercentChange(lastMonthRevenue.total, thisMonthRevenue.total),
    },
  }
}

// ============== Summary Stats (for quick dashboard) ==============

export async function getDashboardSummary() {
  const now = new Date()
  const todayStart = startOfDay(now)
  const last24Hours = subDays(now, 1)

  const [
    todayOrders,
    todayRevenue,
    pendingOrders,
    lowStockProducts,
  ] = await Promise.all([
    // Today's orders
    db.order.count({
      where: { createdAt: { gte: todayStart } },
    }),
    // Today's revenue (paid orders only)
    db.order.aggregate({
      where: {
        createdAt: { gte: todayStart },
        paymentStatus: "PAID",
      },
      _sum: { total: true },
    }),
    // Pending orders
    db.order.count({
      where: { status: "PENDING" },
    }),
    // Low stock products (stock <= 5)
    db.product.count({
      where: {
        isActive: true,
        stock: { lte: 5 },
      },
    }),
  ])

  return {
    todayOrders,
    todayRevenue: Number(todayRevenue._sum.total || 0),
    pendingOrders,
    lowStockProducts,
  }
}
