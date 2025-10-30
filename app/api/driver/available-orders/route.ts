import { NextRequest, NextResponse } from 'next/server';

// GET /api/driver/available-orders - Get orders ready for delivery (status: READY, no driver assigned)
export async function GET(request: NextRequest) {
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

    // Get orders that are ready for delivery (status: READY) and have no driver assigned
    const orders = await prisma.order.findMany({
      where: {
        status: 'READY',
        driverId: null,
        paymentStatus: 'PAID',
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        customer: true,
      },
      orderBy: {
        createdAt: 'asc', // Oldest first
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Available orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch available orders' },
      { status: 500 }
    );
  }
}
