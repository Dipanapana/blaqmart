"use client"

import { useState } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatPrice } from "@/lib/utils"
import type { DailyRevenue } from "@/lib/analytics"

interface RevenueChartProps {
  data7Days: DailyRevenue[]
  data30Days: DailyRevenue[]
}

export function RevenueChart({ data7Days, data30Days }: RevenueChartProps) {
  const [period, setPeriod] = useState<"7" | "30">("7")
  const data = period === "7" ? data7Days : data30Days

  // Calculate total for the period
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0)
  const totalOrders = data.reduce((sum, d) => sum + d.orderCount, 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Revenue Overview</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {formatPrice(totalRevenue)} from {totalOrders} orders
          </p>
        </div>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as "7" | "30")}>
          <TabsList>
            <TabsTrigger value="7">7 Days</TabsTrigger>
            <TabsTrigger value="30">30 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(value) => `R${value}`}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as DailyRevenue
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <p className="font-medium">{data.date}</p>
                        <p className="text-sm text-muted-foreground">
                          Revenue: {formatPrice(data.revenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Orders: {data.orderCount}
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#1E3A5F"
                strokeWidth={2}
                dot={{ fill: "#1E3A5F", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#1E3A5F" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
