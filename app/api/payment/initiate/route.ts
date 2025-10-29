import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// PayFast configuration
const PAYFAST_CONFIG = {
  merchant_id: process.env.PAYFAST_MERCHANT_ID || '10000100',
  merchant_key: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
  passphrase: process.env.PAYFAST_PASSPHRASE || 'jt7NOE43FZPn',
  sandbox: process.env.NODE_ENV !== 'production',
};

// Generate PayFast signature
function generateSignature(data: Record<string, any>, passphrase: string = ''): string {
  // Create parameter string
  const paramString = Object.keys(data)
    .sort()
    .map((key) => `${key}=${encodeURIComponent(data[key]).replace(/%20/g, '+')}`)
    .join('&');

  // Add passphrase if provided
  const stringToSign = passphrase ? `${paramString}&passphrase=${encodeURIComponent(passphrase)}` : paramString;

  // Generate MD5 signature
  return crypto.createHash('md5').update(stringToSign).digest('hex');
}

// POST /api/payment/initiate - Create PayFast payment
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

    // Get base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    // Build PayFast payment data
    const paymentData = {
      merchant_id: PAYFAST_CONFIG.merchant_id,
      merchant_key: PAYFAST_CONFIG.merchant_key,
      return_url: `${baseUrl}/payment/success?order_id=${orderId}`,
      cancel_url: `${baseUrl}/payment/cancel?order_id=${orderId}`,
      notify_url: `${baseUrl}/api/payment/notify`,

      // Buyer details
      name_first: order.customer.name?.split(' ')[0] || 'Customer',
      name_last: order.customer.name?.split(' ').slice(1).join(' ') || '',
      email_address: `${order.customer.phone.replace('+', '')}@blaqmart.co.za`, // Generate email from phone
      cell_number: order.customer.phone.replace('+27', '0'),

      // Transaction details
      m_payment_id: order.orderNumber,
      amount: amount.toFixed(2),
      item_name: `BLAQMART Order ${order.orderNumber}`,
      item_description: `${order.items?.length || 0} items from ${order.store.name}`,

      // Custom fields
      custom_str1: orderId,
      custom_str2: order.storeId,
    };

    // Generate signature
    const signature = generateSignature(paymentData, PAYFAST_CONFIG.passphrase);

    // Build PayFast URL
    const payfastUrl = PAYFAST_CONFIG.sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    // Build payment URL with query params
    const params = new URLSearchParams({
      ...paymentData,
      signature,
    });

    const paymentUrl = `${payfastUrl}?${params.toString()}`;

    // Store payment reference in order
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentMethod: 'PAYFAST',
      },
    });

    return NextResponse.json({
      success: true,
      paymentUrl,
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
