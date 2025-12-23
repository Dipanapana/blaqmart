import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { formatPrice, formatDate } from "@/lib/utils"
import { OrderSuccessCelebration } from "@/components/storefront/order-success-celebration"

interface OrderSuccessPageProps {
  params: { id: string }
}

async function getOrder(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      items: {
        include: { product: true },
      },
    },
  })
}

export default async function OrderSuccessPage({
  params,
}: OrderSuccessPageProps) {
  const order = await getOrder(params.id)

  if (!order) {
    notFound()
  }

  // Transform order data for client component
  const transformedOrder = {
    id: order.id,
    orderNumber: order.orderNumber,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    shippingName: order.shippingName,
    shippingAddress: order.shippingAddress,
    shippingSuburb: order.shippingSuburb,
    shippingCity: order.shippingCity,
    shippingPostalCode: order.shippingPostalCode,
    deliveryDate: order.deliveryDate,
    deliverySlot: order.deliverySlot,
    giftMessage: order.giftMessage,
    items: order.items.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      productName: item.productName,
      totalPrice: Number(item.totalPrice),
    })),
  }

  return (
    <OrderSuccessCelebration
      order={transformedOrder}
      formatPrice={formatPrice}
      formatDate={formatDate}
    />
  )
}
