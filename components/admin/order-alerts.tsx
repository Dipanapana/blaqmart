import Link from "next/link"
import { AlertTriangle, Clock, Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface OrderAlertData {
  id: string
  orderNumber: string
  shippingName: string
  createdAt: Date
  total: number
}

interface OrderAlertsProps {
  staleOrders: OrderAlertData[]
  unprocessedCount: number
}

export function OrderAlerts({ staleOrders, unprocessedCount }: OrderAlertsProps) {
  const hasAlerts = staleOrders.length > 0 || unprocessedCount > 0

  if (!hasAlerts) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Package className="h-5 w-5" />
            All Caught Up!
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-600">
            No orders need immediate attention.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Orders Needing Attention
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {staleOrders.length > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{staleOrders.length} Stale Orders</AlertTitle>
            <AlertDescription>
              These orders have been pending for over 24 hours and need immediate
              attention.
              <div className="mt-2 space-y-1">
                {staleOrders.slice(0, 3).map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="block text-sm hover:underline"
                  >
                    {order.orderNumber} - {order.shippingName}
                  </Link>
                ))}
                {staleOrders.length > 3 && (
                  <p className="text-sm">
                    +{staleOrders.length - 3} more orders
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                asChild
              >
                <Link href="/admin/orders?status=PENDING&stale=true">
                  View All Stale Orders
                </Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {unprocessedCount > 0 && staleOrders.length === 0 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>{unprocessedCount} New Orders</AlertTitle>
            <AlertDescription>
              Orders waiting to be processed.
              <Button
                variant="outline"
                size="sm"
                className="mt-2 ml-0 block"
                asChild
              >
                <Link href="/admin/orders?status=PENDING">Process Now</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
