import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Package, Truck, MapPin, Phone, Mail, User } from "lucide-react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { formatPrice, formatDate } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusUpdate } from "./order-status-update"

interface OrderDetailPageProps {
  params: { id: string }
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

const statusSteps = [
  { status: "PENDING", label: "Order Placed" },
  { status: "CONFIRMED", label: "Confirmed" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
]

async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      payment: true,
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  })
}

export default async function AdminOrderDetailPage({
  params,
}: OrderDetailPageProps) {
  const session = await auth()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.status === order.status
  )
  const isCancelled = order.status === "CANCELLED"

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/orders"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Link>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order {order.orderNumber}</h1>
          <p className="text-muted-foreground">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <Badge variant={statusColors[order.status]} className="w-fit text-base px-4 py-1">
          {order.status.replace(/_/g, " ")}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Status Timeline */}
          {!isCancelled && (
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <div className="flex justify-between">
                    {statusSteps.map((step, index) => {
                      const isCompleted = index <= currentStepIndex
                      const isCurrent = index === currentStepIndex
                      return (
                        <div
                          key={step.status}
                          className="flex flex-1 flex-col items-center"
                        >
                          <div
                            className={`z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                              isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted bg-background"
                            } ${isCurrent ? "ring-2 ring-primary ring-offset-2" : ""}`}
                          >
                            {index + 1}
                          </div>
                          <span
                            className={`mt-2 text-xs text-center ${
                              isCompleted
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                  {/* Progress Line */}
                  <div className="absolute left-0 right-0 top-4 -z-0 h-0.5 bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{
                        width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderStatusUpdate
                orderId={order.id}
                currentStatus={order.status}
              />
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Items ({order.items.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0]}
                          alt={item.productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(Number(item.unitPrice))} × {item.quantity}
                      </p>
                    </div>
                    <p className="font-semibold">
                      {formatPrice(Number(item.totalPrice))}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-6" />

              {/* Order Summary */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(Number(order.subtotal))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Delivery Fee</span>
                  <span>{formatPrice(Number(order.deliveryFee))}</span>
                </div>
                {Number(order.discount) > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-{formatPrice(Number(order.discount))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(Number(order.total))}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Notes */}
          {order.deliveryNotes && (
            <Card>
              <CardHeader>
                <CardTitle>Delivery Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{order.deliveryNotes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {order.customer ? (
                <>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{order.customer.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${order.customer.email}`}
                      className="text-primary hover:underline"
                    >
                      {order.customer.email}
                    </a>
                  </div>
                  {order.customer.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={`tel:${order.customer.phone}`}
                        className="text-primary hover:underline"
                      >
                        {order.customer.phone}
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground">Guest checkout</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Delivery Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1 text-sm">
                <p className="font-medium">{order.shippingName}</p>
                <p>{order.shippingAddress}</p>
                <p>
                  {order.shippingSuburb}, {order.shippingCity}
                </p>
                <p>{order.shippingPostalCode}</p>
                <p className="pt-2">
                  <Phone className="mr-2 inline h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${order.shippingPhone}`}
                    className="text-primary hover:underline"
                  >
                    {order.shippingPhone}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Delivery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {order.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Date</span>
                    <span className="font-medium">
                      {formatDate(order.deliveryDate)}
                    </span>
                  </div>
                )}
                {order.deliverySlot && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Slot</span>
                    <span className="font-medium">{order.deliverySlot}</span>
                  </div>
                )}
                {order.deliveryNotes && (
                  <div className="pt-2">
                    <p className="text-muted-foreground mb-1">Notes:</p>
                    <p>{order.deliveryNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {order.payment && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Method</span>
                      <span className="font-medium capitalize">
                        {order.payment.provider.replace(/_/g, " ").toLowerCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <Badge
                        variant={
                          order.payment.status === "PAID"
                            ? "success"
                            : order.payment.status === "FAILED"
                            ? "destructive"
                            : "warning"
                        }
                      >
                        {order.payment.status}
                      </Badge>
                    </div>
                    {order.payment.providerPaymentId && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          Transaction ID
                        </span>
                        <span className="font-mono text-xs">
                          {order.payment.providerPaymentId}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
