import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  Phone,
  ChevronRight,
  ShoppingBag,
  Download,
  MessageCircle,
} from "lucide-react"
import { db } from "@/lib/db"
import { formatPrice, formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface OrderDetailPageProps {
  params: { id: string }
}

async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

const statusSteps = [
  { status: "PENDING", label: "Pending", icon: Clock },
  { status: "CONFIRMED", label: "Confirmed", icon: CheckCircle },
  { status: "PREPARING", label: "Preparing", icon: Package },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery", icon: Truck },
  { status: "DELIVERED", label: "Delivered", icon: CheckCircle },
]

const statusColors: Record<string, "default" | "secondary" | "success" | "warning" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "secondary",
  PREPARING: "secondary",
  READY: "secondary",
  OUT_FOR_DELIVERY: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
}

export default async function OrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order.status
  )

  return (
    <div className="container py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/orders" className="hover:text-primary">
          Orders
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{order.orderNumber}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Order {order.orderNumber}</h1>
              <p className="text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <Badge variant={statusColors[order.status]}>
              {order.status.replace(/_/g, " ")}
            </Badge>
          </div>

          {/* Status Tracker */}
          {order.status !== "CANCELLED" && (
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {/* Progress Line */}
                  <div className="absolute left-6 top-0 h-full w-0.5 bg-muted" />
                  <div
                    className="absolute left-6 top-0 w-0.5 bg-primary transition-all"
                    style={{
                      height: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  />

                  {/* Steps */}
                  <div className="space-y-6">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex
                      const Icon = step.icon

                      return (
                        <div
                          key={step.status}
                          className="relative flex items-center gap-4"
                        >
                          <div
                            className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full ${
                              isCompleted
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <p
                              className={`font-medium ${
                                isCompleted ? "" : "text-muted-foreground"
                              }`}
                            >
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-sm text-muted-foreground">
                                Current status
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted">
                      {item.product.images[0] ? (
                        <Image
                          src={item.product.images[0]}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 justify-between">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatPrice(Number(item.unitPrice))}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(Number(item.totalPrice))}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Delivery</span>
                  <span>
                    {Number(order.deliveryFee) === 0 ? (
                      <span className="text-success">Free</span>
                    ) : (
                      formatPrice(Number(order.deliveryFee))
                    )}
                  </span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Discount</span>
                    <span>-{formatPrice(Number(order.discount))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          {order.statusHistory.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {order.statusHistory.map((history) => (
                    <div key={history.id} className="flex gap-4">
                      <div className="flex-shrink-0">
                        <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {history.status.replace(/_/g, " ")}
                        </p>
                        {history.note && (
                          <p className="text-sm text-muted-foreground">
                            {history.note}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(history.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">{order.shippingName}</p>
                  <p className="text-sm text-muted-foreground">
                    {order.shippingAddress}
                    <br />
                    {order.shippingSuburb}, {order.shippingCity}{" "}
                    {order.shippingPostalCode}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <p className="text-sm">{order.shippingPhone}</p>
              </div>
              <div className="flex items-start gap-3">
                <Truck className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {order.deliveryDate
                      ? formatDate(order.deliveryDate)
                      : "Pending"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliverySlot === "morning"
                      ? "09:00 - 12:00"
                      : order.deliverySlot === "afternoon"
                      ? "12:00 - 15:00"
                      : order.deliverySlot === "evening"
                      ? "15:00 - 18:00"
                      : order.deliverySlot}
                  </p>
                </div>
              </div>
              {order.deliveryNotes && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-medium">Delivery Notes:</p>
                  <p className="text-sm text-muted-foreground">
                    {order.deliveryNotes}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gift Message */}
          {order.giftMessage && (
            <Card>
              <CardHeader>
                <CardTitle>Gift Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {order.giftMessage}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full" asChild>
                <a href={`/api/orders/${order.id}/receipt`} download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Receipt
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a
                  href={`https://wa.me/27794022296?text=${encodeURIComponent(
                    `Hi Blaqmart! I have a question about my order #${order.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  WhatsApp Support
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Need Help */}
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                If you have any questions about your order, please contact us:
              </p>
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  <strong>Email:</strong> orders@blaqmart.co.za
                </p>
                <p>
                  <strong>WhatsApp:</strong> 079 402 2296
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
