import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { parseYocoWebhook, YocoWebhookPayload } from '@/lib/yoco'
import logger from '@/lib/logger'
import { handleApiError, ApiError } from '@/lib/api-error'

/**
 * Yoco Payment Webhook Handler
 *
 * Receives payment notifications from Yoco and updates order status.
 * Webhook URL: https://yourdomain.co.za/api/payments/yoco
 */
export async function POST(request: NextRequest) {
  try {
    // Get the raw body and signature
    const body = await request.text()
    const signature = request.headers.get('x-yoco-signature') || ''

    // Parse and validate the webhook
    const webhook = parseYocoWebhook(body, signature)

    if (!webhook) {
      logger.error('Yoco Webhook', new Error('Invalid signature or payload'))
      throw ApiError.unauthorized('Invalid webhook signature')
    }

    logger.payment(`Webhook received: ${webhook.type}`, 'Yoco', { payloadId: webhook.payload.id })

    // Handle the webhook based on type
    switch (webhook.type) {
      case 'payment.succeeded':
      case 'checkout.completed':
        await handlePaymentSuccess(webhook)
        break

      case 'payment.failed':
        await handlePaymentFailed(webhook)
        break

      default:
        logger.warn('Yoco Webhook', `Unhandled event type: ${webhook.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    return handleApiError(error, 'Yoco Webhook')
  }
}

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(webhook: YocoWebhookPayload) {
  const { payload } = webhook
  const orderId = payload.metadata?.orderId

  if (!orderId) {
    logger.error('Yoco Webhook', new Error('No orderId in metadata'))
    return
  }

  // Update payment record
  const payment = await db.payment.findFirst({
    where: {
      OR: [
        { yocoCheckoutId: payload.id },
        { orderId: orderId },
      ],
    },
    include: { order: true },
  })

  if (!payment) {
    logger.error('Yoco Webhook', new Error('Payment not found'), { orderId })
    return
  }

  // Update payment status
  await db.payment.update({
    where: { id: payment.id },
    data: {
      status: 'PAID',
      yocoChargeId: payload.chargeId,
      paidAt: new Date(),
    },
  })

  // Update order status
  await db.order.update({
    where: { id: orderId },
    data: {
      status: 'CONFIRMED',
      paymentStatus: 'PAID',
      confirmedAt: new Date(),
    },
  })

  // Create status history entry
  await db.orderStatusHistory.create({
    data: {
      orderId: orderId,
      status: 'CONFIRMED',
      note: 'Payment received via Yoco',
    },
  })

  logger.order('Payment confirmed', orderId, { provider: 'Yoco' })

  // TODO: Send confirmation email and SMS
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(webhook: YocoWebhookPayload) {
  const { payload } = webhook
  const orderId = payload.metadata?.orderId

  if (!orderId) {
    logger.error('Yoco Webhook', new Error('No orderId in metadata for failed payment'))
    return
  }

  // Update payment record
  const payment = await db.payment.findFirst({
    where: {
      OR: [
        { yocoCheckoutId: payload.id },
        { orderId: orderId },
      ],
    },
  })

  if (payment) {
    await db.payment.update({
      where: { id: payment.id },
      data: {
        status: 'FAILED',
      },
    })
  }

  // Update order payment status
  await db.order.update({
    where: { id: orderId },
    data: {
      paymentStatus: 'FAILED',
    },
  })

  // Restore stock for failed payment
  const orderItems = await db.orderItem.findMany({
    where: { orderId: orderId },
  })

  for (const item of orderItems) {
    await db.product.update({
      where: { id: item.productId },
      data: {
        stock: { increment: item.quantity },
      },
    })
  }

  logger.order('Payment failed, stock restored', orderId, { provider: 'Yoco' })
}

/**
 * GET endpoint for testing webhook connectivity
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Yoco webhook endpoint is active',
    timestamp: new Date().toISOString(),
  })
}
