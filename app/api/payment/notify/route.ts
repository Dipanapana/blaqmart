import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const YOCO_WEBHOOK_SECRET = process.env.YOCO_WEBHOOK_SECRET || '';

// Verify Yoco webhook signature
function verifyWebhookSignature(
  rawBody: string,
  webhookId: string,
  timestamp: string,
  signatureHeader: string,
  secret: string
): boolean {
  try {
    // Build signed content: webhookId.timestamp.rawBody
    const signedContent = `${webhookId}.${timestamp}.${rawBody}`;

    // Strip 'whsec_' prefix from secret key
    const secretBytes = Buffer.from(
      secret.startsWith('whsec_') ? secret.slice(6) : secret,
      'base64'
    );

    // Compute HMAC-SHA256 and base64 encode
    const computedSignature = crypto
      .createHmac('sha256', secretBytes)
      .update(signedContent)
      .digest('base64');

    // Strip version prefix (e.g., "v1,") from the signature header
    const expectedSignatures = signatureHeader.split(' ');

    for (const sig of expectedSignatures) {
      const sigValue = sig.startsWith('v1,') ? sig.slice(3) : sig;

      // Constant-time comparison to prevent timing attacks
      if (sigValue.length === computedSignature.length) {
        const a = Buffer.from(sigValue);
        const b = Buffer.from(computedSignature);
        if (crypto.timingSafeEqual(a, b)) {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

// POST /api/payment/notify - Yoco Webhook handler
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Read raw body for signature verification
    const rawBody = await request.text();

    // Extract webhook headers
    const webhookId = request.headers.get('webhook-id') || '';
    const timestamp = request.headers.get('webhook-timestamp') || '';
    const signatureHeader = request.headers.get('webhook-signature') || '';

    // Verify signature if webhook secret is configured
    if (YOCO_WEBHOOK_SECRET) {
      const isValid = verifyWebhookSignature(
        rawBody,
        webhookId,
        timestamp,
        signatureHeader,
        YOCO_WEBHOOK_SECRET
      );

      if (!isValid) {
        console.error('Invalid Yoco webhook signature');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }

      // Validate timestamp (within 5 minutes to prevent replay attacks)
      const webhookTimestamp = parseInt(timestamp, 10);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTimestamp - webhookTimestamp) > 300) {
        console.error('Webhook timestamp too old');
        return NextResponse.json({ error: 'Timestamp expired' }, { status: 400 });
      }
    } else {
      console.warn('YOCO_WEBHOOK_SECRET not set — skipping signature verification');
    }

    // Parse webhook body
    const data = JSON.parse(rawBody);

    console.log('Yoco webhook received:', data.type, data.id);

    const eventType = data.type;
    const payload = data.payload;

    if (!payload) {
      console.error('No payload in webhook event');
      return NextResponse.json({ error: 'Missing payload' }, { status: 400 });
    }

    // Get checkoutId from metadata to find the order
    const checkoutId = payload.metadata?.checkoutId;

    if (!checkoutId) {
      console.error('No checkoutId in webhook payload metadata');
      return NextResponse.json({ error: 'Missing checkoutId' }, { status: 400 });
    }

    // Find order by the stored Yoco checkout ID
    // We stored it in trackingNumber during payment initiation
    const order = await prisma.order.findFirst({
      where: { trackingNumber: checkoutId },
    });

    if (!order) {
      console.error('Order not found for checkoutId:', checkoutId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (eventType === 'payment.succeeded') {
      // Payment successful — update order
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          // Clear the temporary checkout ID from trackingNumber
          // so it can be used for actual courier tracking later
          trackingNumber: null,
        },
        include: {
          customer: true,
          store: true,
        },
      });

      console.log('Payment confirmed for order:', order.orderNumber);

      // Send notifications (async, don't wait)
      try {
        const { notifyOrderConfirmed } = await import('@/lib/notifications');
        notifyOrderConfirmed(updatedOrder).catch(console.error);
      } catch (notifError) {
        console.error('Failed to send payment confirmation notifications:', notifError);
      }

    } else if (eventType === 'payment.failed') {
      // Payment failed — update order and restore stock
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
          trackingNumber: null,
        },
      });

      // Restore product stock
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });

      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: { increment: item.quantity },
            },
          });
        }
      }

      console.log('Payment failed for order:', order.orderNumber);
    } else {
      console.log('Unhandled webhook event type:', eventType);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/payment/notify - For testing
export async function GET() {
  return NextResponse.json({
    message: 'Yoco webhook endpoint',
    note: 'POST requests only',
  });
}
