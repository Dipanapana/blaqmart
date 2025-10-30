import { NextRequest, NextResponse } from 'next/server';

// POST /api/driver/complete-delivery - Complete a delivery with proof
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

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { phone: authUser.phone },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is a driver
    if (user.role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Access denied - Driver role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId, photoUrl, notes } = body;

    if (!orderId || !photoUrl) {
      return NextResponse.json(
        { error: 'Order ID and photo URL are required' },
        { status: 400 }
      );
    }

    // Get order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if order is assigned to this driver
    if (order.driverId !== user.id) {
      return NextResponse.json(
        { error: 'This order is not assigned to you' },
        { status: 403 }
      );
    }

    // Check if order is out for delivery
    if (order.status !== 'OUT_FOR_DELIVERY') {
      return NextResponse.json(
        { error: 'Order is not out for delivery' },
        { status: 400 }
      );
    }

    // Create delivery proof
    const deliveryProof = await prisma.deliveryProof.create({
      data: {
        orderId,
        photoUrl,
        notes: notes || null,
      },
    });

    // Update order status to delivered
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'DELIVERED',
        completedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
        driver: true,
        deliveryProof: true,
      },
    });

    // Send delivery completed notifications (async, don't wait)
    try {
      const { notifyOrderDelivered } = await import('@/lib/notifications');
      notifyOrderDelivered(updatedOrder).catch(console.error);
    } catch (notifError) {
      console.error('Failed to send delivery completion notifications:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Delivery completed successfully',
      order: updatedOrder,
      deliveryProof,
    });
  } catch (error) {
    console.error('Complete delivery error:', error);
    return NextResponse.json(
      { error: 'Failed to complete delivery' },
      { status: 500 }
    );
  }
}
