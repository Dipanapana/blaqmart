"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { SchoolSales } from "@/lib/analytics"

interface SchoolSalesChartProps {
  data: SchoolSales[]
}

export function SchoolSalesChart({ data }: SchoolSalesChartProps) {
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Sales by School</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            No school sales data yet
          </div>
        </CardContent>
      </Card>
    )
  }

  // Truncate long school names for display
  const chartData = data.map((item) => ({
    ...item,
    displayName:
      item.name.length > 15 ? item.name.substring(0, 15) + "..." : item.name,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales by School</CardTitle>
        <p className="text-sm text-muted-foreground">
          Total: {formatPrice(totalRevenue)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: 10, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="displayName"
                tick={{ fontSize: 11 }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tickFormatter={(value) => `R${value}`}
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as SchoolSales & {
                      displayName: string
                    }
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: {formatPrice(data.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Orders: {data.orderCount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Avg per order:{" "}
                          {formatPrice(data.revenue / data.orderCount || 0)}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Bar
                dataKey="revenue"
                fill="#FFB81C"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
