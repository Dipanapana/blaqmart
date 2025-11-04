import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/payouts - Get all vendor payouts
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied - Admin only' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const payouts = await prisma.vendorPayout.findMany({
      where,
      include: {
        vendor: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      payouts: payouts.map((payout) => ({
        id: payout.id,
        vendorName: payout.vendor.name || 'Vendor',
        vendorPhone: payout.vendor.phone,
        amount: payout.amount,
        netAmount: payout.netAmount,
        platformFee: payout.platformFee,
        status: payout.status,
        periodStart: payout.periodStart,
        periodEnd: payout.periodEnd,
        orderCount: payout.orderCount,
        totalSales: payout.totalSales,
        paymentMethod: payout.paymentMethod,
        paymentReference: payout.paymentReference,
        paidAt: payout.paidAt,
        createdAt: payout.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}

// POST /api/admin/payouts - Generate payouts for a period
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

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied - Admin only' },
        { status: 403 }
      );
    }

    const { periodStart, periodEnd, platformFeePercent } = await request.json();

    if (!periodStart || !periodEnd) {
      return NextResponse.json(
        { error: 'Period start and end dates are required' },
        { status: 400 }
      );
    }

    const feePercent = platformFeePercent || 10; // Default 10% platform fee

    // Get all vendors with paid orders in the period
    const vendors = await prisma.user.findMany({
      where: {
        role: 'VENDOR',
        stores: {
          some: {
            orders: {
              some: {
                paymentStatus: 'PAID',
                status: 'DELIVERED',
                completedAt: {
                  gte: new Date(periodStart),
                  lte: new Date(periodEnd),
                },
              },
            },
          },
        },
      },
      include: {
        stores: {
          include: {
            orders: {
              where: {
                paymentStatus: 'PAID',
                status: 'DELIVERED',
                completedAt: {
                  gte: new Date(periodStart),
                  lte: new Date(periodEnd),
                },
              },
            },
          },
        },
      },
    });

    const payoutsCreated = [];

    for (const vendor of vendors) {
      // Calculate total sales from all vendor's stores
      let totalSales = 0;
      let orderCount = 0;

      for (const store of vendor.stores) {
        for (const order of store.orders) {
          totalSales += order.total;
          orderCount++;
        }
      }

      if (totalSales > 0) {
        const platformFee = totalSales * (feePercent / 100);
        const netAmount = totalSales - platformFee;

        const payout = await prisma.vendorPayout.create({
          data: {
            vendorId: vendor.id,
            amount: totalSales,
            totalSales,
            platformFee,
            netAmount,
            orderCount,
            periodStart: new Date(periodStart),
            periodEnd: new Date(periodEnd),
            status: 'PENDING',
          },
        });

        payoutsCreated.push(payout);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${payoutsCreated.length} payouts`,
      payouts: payoutsCreated.map((p) => ({
        id: p.id,
        vendorId: p.vendorId,
        netAmount: p.netAmount,
        orderCount: p.orderCount,
      })),
    });
  } catch (error) {
    console.error('Generate payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to generate payouts' },
      { status: 500 }
    );
  }
}
