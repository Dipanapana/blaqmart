import { Metadata } from "next"
import {
  getRevenueByDateRange,
  getOrdersByStatus,
  getTopSellingProducts,
  getSalesBySchool,
  getComparisonMetrics,
} from "@/lib/analytics"
import { ComparisonCards } from "@/components/admin/analytics/comparison-cards"
import { RevenueChart } from "@/components/admin/analytics/revenue-chart"
import { OrdersStatusChart } from "@/components/admin/analytics/orders-status-chart"
import { TopProducts } from "@/components/admin/analytics/top-products"
import { SchoolSalesChart } from "@/components/admin/analytics/school-sales-chart"

export const metadata: Metadata = {
  title: "Analytics | Blaqmart Admin",
  description: "View sales analytics and business metrics",
}

// Revalidate every 5 minutes
export const revalidate = 300

async function getAnalyticsData() {
  const [
    revenue7Days,
    revenue30Days,
    ordersByStatus,
    topProducts,
    salesBySchool,
    comparisonMetrics,
  ] = await Promise.all([
    getRevenueByDateRange(7),
    getRevenueByDateRange(30),
    getOrdersByStatus(),
    getTopSellingProducts(5),
    getSalesBySchool(),
    getComparisonMetrics(),
  ])

  return {
    revenue7Days,
    revenue30Days,
    ordersByStatus,
    topProducts,
    salesBySchool,
    comparisonMetrics,
  }
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Track your business performance and trends
        </p>
      </div>

      {/* Comparison Cards - Today/Week/Month vs Previous */}
      <ComparisonCards metrics={data.comparisonMetrics} />

      {/* Revenue Chart - Full Width */}
      <RevenueChart
        data7Days={data.revenue7Days}
        data30Days={data.revenue30Days}
      />

      {/* Two-column layout for smaller charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Orders by Status Pie Chart */}
        <OrdersStatusChart data={data.ordersByStatus} />

        {/* Top Selling Products */}
        <TopProducts data={data.topProducts} />
      </div>

      {/* School Sales - Full Width */}
      <SchoolSalesChart data={data.salesBySchool} />
    </div>
  )
}
