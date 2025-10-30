import { NextRequest, NextResponse } from 'next/server';

// GET /api/driver/my-deliveries - Get driver's assigned deliveries
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

    // Get orders assigned to this driver
    const orders = await prisma.order.findMany({
      where: {
        driverId: user.id,
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('My deliveries fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deliveries' },
      { status: 500 }
    );
  }
}
