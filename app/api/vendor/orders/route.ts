import { NextRequest, NextResponse } from 'next/server';

// GET /api/vendor/orders - Get all orders for vendor's stores
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

    // Check if user is a vendor
    if (user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied - Vendor role required' },
        { status: 403 }
      );
    }

    // Get vendor's stores
    const stores = await prisma.store.findMany({
      where: { vendorId: user.id },
      select: { id: true },
    });

    const storeIds = stores.map((store: any) => store.id);

    if (storeIds.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    // Get orders for vendor's stores
    const orders = await prisma.order.findMany({
      where: {
        storeId: {
          in: storeIds,
        },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Vendor orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
