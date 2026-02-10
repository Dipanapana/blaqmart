import { NextRequest, NextResponse } from 'next/server';

const YOCO_SECRET_KEY = process.env.YOCO_SECRET_KEY || '';
const YOCO_API_URL = 'https://payments.yoco.com/api/checkouts';

// POST /api/payment/initiate - Create Yoco Checkout
export async function POST(request: NextRequest) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { orderId, amount } = body;

    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        customer: true,
        store: true,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify customer
    if (order.customer.phone !== authUser.phone) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    if (!YOCO_SECRET_KEY) {
      console.error('YOCO_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Payment gateway not configured' },
        { status: 503 }
      );
    }

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Amount in cents for Yoco (R790 = 79000 cents)
    const amountInCents = Math.round(amount * 100);

    // Create Yoco Checkout session
    const yocoResponse = await fetch(YOCO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${YOCO_SECRET_KEY}`,
      },
      body: JSON.stringify({
        amount: amountInCents,
        currency: 'ZAR',
        successUrl: `${baseUrl}/payment/success?order_id=${orderId}`,
        cancelUrl: `${baseUrl}/payment/cancel?order_id=${orderId}`,
        failureUrl: `${baseUrl}/payment/cancel?order_id=${orderId}`,
        metadata: {
          orderId,
          orderNumber: order.orderNumber,
        },
      }),
    });

    if (!yocoResponse.ok) {
      const errorData = await yocoResponse.text();
      console.error('Yoco API error:', yocoResponse.status, errorData);
      return NextResponse.json(
        { error: 'Failed to create payment session' },
        { status: 502 }
      );
    }

    const yocoData = await yocoResponse.json();

    if (!yocoData.redirectUrl) {
      console.error('No redirectUrl in Yoco response:', yocoData);
      return NextResponse.json(
        { error: 'Invalid payment gateway response' },
        { status: 502 }
      );
    }

    // Store Yoco checkout ID and payment method on the order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: 'YOCO',
        // Store the Yoco checkout ID in a field we can query later for webhook correlation
        trackingNumber: yocoData.id, // Temporarily use trackingNumber to store Yoco checkout ID
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl: yocoData.redirectUrl,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    );
  }
}
