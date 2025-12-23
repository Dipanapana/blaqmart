/**
 * Yoco Payment Integration
 *
 * Yoco Online Checkout API integration for card and EFT payments.
 * Documentation: https://developer.yoco.com/online/online-payments
 *
 * Pricing:
 * - Card payments: 2.95% + VAT
 * - EFT payments: 1.2% + VAT
 * - No monthly fees
 * - 2 business day payouts
 */

export interface YocoCheckoutRequest {
  amount: number // Amount in cents (e.g., 10000 = R100.00)
  currency: 'ZAR'
  successUrl: string
  cancelUrl: string
  failureUrl: string
  metadata?: {
    orderId: string
    orderNumber: string
    customerEmail?: string
    customerPhone?: string
  }
}

export interface YocoCheckoutResponse {
  id: string
  redirectUrl: string
  status: 'pending' | 'completed' | 'failed'
}

export interface YocoWebhookPayload {
  id: string
  type: 'payment.succeeded' | 'payment.failed' | 'checkout.completed'
  createdDate: string
  payload: {
    id: string
    type: string
    status: string
    mode: 'test' | 'live'
    amount: number
    currency: string
    metadata?: Record<string, string>
    createdDate: string
    chargeId?: string
  }
}

// Environment detection
const isProduction = process.env.NODE_ENV === 'production'
const YOCO_API_URL = 'https://payments.yoco.com/api'

/**
 * Create a Yoco checkout session
 * Returns a redirect URL for the customer to complete payment
 */
export async function createYocoCheckout(
  data: YocoCheckoutRequest
): Promise<YocoCheckoutResponse> {
  const secretKey = process.env.YOCO_SECRET_KEY

  if (!secretKey) {
    throw new Error('YOCO_SECRET_KEY is not configured')
  }

  const response = await fetch(`${YOCO_API_URL}/checkouts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: data.amount,
      currency: data.currency,
      successUrl: data.successUrl,
      cancelUrl: data.cancelUrl,
      failureUrl: data.failureUrl,
      metadata: data.metadata,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    console.error('[Yoco] Checkout creation failed:', error)
    throw new Error(`Yoco checkout failed: ${error.message || response.statusText}`)
  }

  const result = await response.json()

  return {
    id: result.id,
    redirectUrl: result.redirectUrl,
    status: result.status,
  }
}

/**
 * Validate Yoco webhook signature
 * Returns true if the webhook is authentic
 */
export function validateYocoWebhook(
  payload: string,
  signature: string
): boolean {
  const webhookSecret = process.env.YOCO_WEBHOOK_SECRET

  if (!webhookSecret) {
    console.error('[Yoco] YOCO_WEBHOOK_SECRET is not configured')
    return false
  }

  // Yoco uses HMAC-SHA256 for webhook signatures
  const crypto = require('crypto')
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * Parse and validate a Yoco webhook payload
 */
export function parseYocoWebhook(
  body: string,
  signature: string
): YocoWebhookPayload | null {
  // Validate signature
  if (!validateYocoWebhook(body, signature)) {
    console.error('[Yoco] Invalid webhook signature')
    return null
  }

  try {
    return JSON.parse(body) as YocoWebhookPayload
  } catch (error) {
    console.error('[Yoco] Failed to parse webhook payload:', error)
    return null
  }
}

/**
 * Convert Rand amount to cents for Yoco API
 */
export function randToCents(amount: number): number {
  return Math.round(amount * 100)
}

/**
 * Convert cents to Rand for display
 */
export function centsToRand(cents: number): number {
  return cents / 100
}

/**
 * Generate Yoco checkout URLs for an order
 */
export function getYocoUrls(orderId: string): {
  successUrl: string
  cancelUrl: string
  failureUrl: string
} {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

  return {
    successUrl: `${baseUrl}/orders/${orderId}/success?payment=yoco`,
    cancelUrl: `${baseUrl}/checkout?cancelled=true`,
    failureUrl: `${baseUrl}/checkout?payment_failed=true`,
  }
}

/**
 * Check if Yoco is properly configured
 */
export function isYocoConfigured(): boolean {
  return !!(
    process.env.YOCO_SECRET_KEY &&
    process.env.YOCO_PUBLIC_KEY
  )
}

/**
 * Get Yoco public key for client-side use
 */
export function getYocoPublicKey(): string | null {
  return process.env.YOCO_PUBLIC_KEY || null
}
