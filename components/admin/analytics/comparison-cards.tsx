"use client"

import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/utils"
import type { ComparisonMetrics } from "@/lib/analytics"

interface TrendIndicatorProps {
  change: number
}

function TrendIndicator({ change }: TrendIndicatorProps) {
  if (change > 0) {
    return (
      <span className="flex items-center text-green-600 text-sm font-medium">
        <TrendingUp className="h-4 w-4 mr-1" />
        +{change}%
      </span>
    )
  }
  if (change < 0) {
    return (
      <span className="flex items-center text-red-600 text-sm font-medium">
        <TrendingDown className="h-4 w-4 mr-1" />
        {change}%
      </span>
    )
  }
  return (
    <span className="flex items-center text-muted-foreground text-sm">
      <Minus className="h-4 w-4 mr-1" />
      0%
    </span>
  )
}

interface ComparisonCardsProps {
  metrics: ComparisonMetrics
}

export function ComparisonCards({ metrics }: ComparisonCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Today vs Yesterday */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Today vs Yesterday
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(metrics.daily.current.total)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              {metrics.daily.current.orders} order{metrics.daily.current.orders !== 1 ? "s" : ""}
            </span>
            <TrendIndicator change={metrics.daily.change} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Yesterday: {formatPrice(metrics.daily.previous.total)}
          </p>
        </CardContent>
      </Card>

      {/* This Week vs Last Week */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Week vs Last Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(metrics.weekly.current.total)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              {metrics.weekly.current.orders} order{metrics.weekly.current.orders !== 1 ? "s" : ""}
            </span>
            <TrendIndicator change={metrics.weekly.change} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last week: {formatPrice(metrics.weekly.previous.total)}
          </p>
        </CardContent>
      </Card>

      {/* This Month vs Last Month */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Month vs Last Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatPrice(metrics.monthly.current.total)}
          </div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm text-muted-foreground">
              {metrics.monthly.current.orders} order{metrics.monthly.current.orders !== 1 ? "s" : ""}
            </span>
            <TrendIndicator change={metrics.monthly.change} />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Last month: {formatPrice(metrics.monthly.previous.total)}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
