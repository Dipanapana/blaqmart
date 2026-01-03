"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { OrderStatusCount } from "@/lib/analytics"

interface OrdersStatusChartProps {
  data: OrderStatusCount[]
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F59E0B",      // Amber
  CONFIRMED: "#3B82F6",    // Blue
  PREPARING: "#8B5CF6",    // Purple
  READY: "#06B6D4",        // Cyan
  OUT_FOR_DELIVERY: "#1E3A5F", // Navy (brand)
  DELIVERED: "#22C55E",    // Green
  CANCELLED: "#EF4444",    // Red
}

export function OrdersStatusChart({ data }: OrdersStatusChartProps) {
  const totalOrders = data.reduce((sum, d) => sum + d.value, 0)

  // Filter out zero values and transform for Recharts compatibility
  const chartData = data
    .filter((d) => d.value > 0)
    .map((d) => ({
      name: d.name,
      value: d.value,
      status: d.status,
    }))

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No orders yet
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Orders by Status</CardTitle>
        <p className="text-sm text-muted-foreground">
          {totalOrders} total orders
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) =>
                  `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
                }
                labelLine={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] || "#6B7280"}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as {
                      name: string
                      value: number
                      status: string
                    }
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.value} orders
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {((item.value / totalOrders) * 100).toFixed(1)}% of total
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
