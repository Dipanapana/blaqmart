import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// PayFast configuration
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchant_key: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE || 'jt7NOE43FZPn',
  sandbox: process.env.NODE_ENV !== 'production',
};

// Validate PayFast signature
function validateSignature(data: Record<string, any>, signature: string, passphrase: string = ''): boolean {
  // Remove signature from data
  const { signature: _, ...dataWithoutSignature } = data;

  // Create parameter string
  const paramString = Object.keys(dataWithoutSignature)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(dataWithoutSignature[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Add passphrase if provided
  const stringToSign = passphrase ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}` : paramString;

  // Generate MD5 signature
  const calculatedSignature = crypto.createHash('md5').update(stringToSign).digest('hex');

  return calculatedSignature === signature;
}

// POST /api/payment/notify - PayFast IPN handler
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }

    // Get form data from PayFast
    const formData = await request.formData();
    const data: Record<string, any> = {};

    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    console.log('PayFast IPN received:', data);

    // Validate signature
    const signature = data.signature;
    const isValid = validateSignature(data, signature, PAYFAST_CONFIG.passphrase);

    if (!isValid) {
      console.error('Invalid PayFast signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Validate merchant ID
    if (data.merchant_id !== PAYFAST_CONFIG.merchant_id) {
      console.error('Invalid merchant ID');
      return NextResponse.json({ error: 'Invalid merchant ID' }, { status: 400 });
    }

    // Get order ID from custom field
    const orderId = data.custom_str1;

    if (!orderId) {
      console.error('No order ID in payment notification');
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      console.error('Order not found:', orderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check payment status
    const paymentStatus = data.payment_status;

    if (paymentStatus === 'COMPLETE') {
      // Payment successful - update order with full details for notifications
      const updatedOrder = await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'PAID',
          status: 'CONFIRMED',
          confirmedAt: new Date(),
          estimatedTime: 45,
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

    } else if (paymentStatus === 'FAILED' || paymentStatus === 'CANCELLED') {
      // Payment failed
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'FAILED',
          status: 'CANCELLED',
        },
      });

      // Restore product stock
      const orderWithItems = await prisma.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (orderWithItems) {
        for (const item of orderWithItems.items) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }
      }

      console.log('Payment failed for order:', order.orderNumber);
    }

    // Return 200 to acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment notification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/payment/notify - For testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'PayFast IPN endpoint',
    note: 'POST requests only',
  });
}
