import { NextRequest, NextResponse } from 'next/server';

// GET /api/vendor/payouts - Get vendor's payouts
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

    if (!user || user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied - Vendor only' },
        { status: 403 }
      );
    }

    const payouts = await prisma.vendorPayout.findMany({
      where: {
        vendorId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate statistics
    const totalPaid = payouts
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: any, p: any) => sum + p.netAmount, 0);

    const totalPending = payouts
      .filter((p: any) => p.status === 'PENDING' || p.status === 'PROCESSING')
      .reduce((sum: any, p: any) => sum + p.netAmount, 0);

    return NextResponse.json({
      success: true,
      statistics: {
        totalPaid,
        totalPending,
        totalPayouts: payouts.length,
      },
      payouts: payouts.map((payout: any) => ({
        id: payout.id,
        amount: payout.amount,
        netAmount: payout.netAmount,
        platformFee: payout.platformFee,
        status: payout.status,
        periodStart: payout.periodStart,
        periodEnd: payout.periodEnd,
        orderCount: payout.orderCount,
        totalSales: payout.totalSales,
        paymentMethod: payout.paymentMethod,
        paidAt: payout.paidAt,
        createdAt: payout.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get vendor payouts error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payouts' },
      { status: 500 }
    );
  }
}
