import crypto from "crypto"

const PAYFAST_URL =
  process.env.NODE_ENV === "production"
    ? "https://www.payfast.co.za/eng/process"
    : "https://sandbox.payfast.co.za/eng/process"

interface PayFastData {
  merchant_id: string
  merchant_key: string
  return_url: string
  cancel_url: string
  notify_url: string
  name_first: string
  email_address: string
  m_payment_id: string
  amount: string
  item_name: string
  [key: string]: string
}

export function generatePaymentData(order: {
  id: string
  orderNumber: string
  total: number
  customer: { name: string; email: string }
}): PayFastData & { signature: string; action: string } {
  const data: PayFastData = {
    merchant_id: process.env.PAYFAST_MERCHANT_ID!,
    merchant_key: process.env.PAYFAST_MERCHANT_KEY!,
    return_url: `${process.env.NEXT_PUBLIC_URL}/orders/${order.id}/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_URL}/orders/${order.id}/cancelled`,
    notify_url: `${process.env.NEXT_PUBLIC_URL}/api/payments/webhook`,
    name_first: order.customer.name.split(" ")[0],
    email_address: order.customer.email,
    m_payment_id: order.id,
    amount: order.total.toFixed(2),
    item_name: `Blaqmart Order #${order.orderNumber}`,
  }

  const signature = generateSignature(data)

  return { ...data, signature, action: PAYFAST_URL }
}

function generateSignature(data: Record<string, string>): string {
  const passphrase = process.env.PAYFAST_PASSPHRASE

  const params = Object.entries(data)
    .filter(([_, value]) => value !== "")
    .map(
      ([key, value]) =>
        `${key}=${encodeURIComponent(value.trim()).replace(/%20/g, "+")}`
    )
    .join("&")

  const signatureString = passphrase
    ? `${params}&passphrase=${encodeURIComponent(passphrase.trim())}`
    : params

  return crypto.createHash("md5").update(signatureString).digest("hex")
}

export function validateWebhook(
  data: Record<string, string>,
  receivedSignature: string
): boolean {
  const { signature, ...rest } = data
  const calculatedSignature = generateSignature(rest)
  return calculatedSignature === receivedSignature
}

export function getPayFastUrl(): string {
  return PAYFAST_URL
}
