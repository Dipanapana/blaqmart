import { NextRequest, NextResponse } from 'next/server';

// POST /api/driver/accept-order - Accept a delivery order
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
      include: { driverProfile: true },
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

    // Check if driver is approved
    if (!user.driverProfile?.isApproved) {
      return NextResponse.json(
        { error: 'Driver not approved yet' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
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

    // Check if order is ready for delivery
    if (order.status !== 'READY') {
      return NextResponse.json(
        { error: 'Order is not ready for delivery' },
        { status: 400 }
      );
    }

    // Check if order already has a driver
    if (order.driverId) {
      return NextResponse.json(
        { error: 'Order already assigned to another driver' },
        { status: 400 }
      );
    }

    // Assign driver to order
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        driverId: user.id,
        estimatedTime: 45, // Default 45 minutes
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
      },
    });

    // TODO: Send SMS notification to customer with driver info and ETA

    return NextResponse.json({
      success: true,
      message: 'Order accepted successfully',
      order: updatedOrder,
    });
  } catch (error) {
    console.error('Accept order error:', error);
    return NextResponse.json(
      { error: 'Failed to accept order' },
      { status: 500 }
    );
  }
}
