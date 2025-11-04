import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// PATCH /api/admin/payouts/[id] - Update payout status
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');
    const { id: payoutId } = await context.params;

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

    const { status, paymentMethod, paymentReference } = await request.json();

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      );
    }

    const updateData: any = { status };

    if (paymentMethod) updateData.paymentMethod = paymentMethod;
    if (paymentReference) updateData.paymentReference = paymentReference;

    if (status === 'PAID') {
      updateData.paidAt = new Date();
    }

    const payout = await prisma.vendorPayout.update({
      where: { id: payoutId },
      data: updateData,
      include: {
        vendor: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Payout updated successfully',
      payout: {
        id: payout.id,
        vendorName: payout.vendor.name,
        status: payout.status,
        netAmount: payout.netAmount,
        paidAt: payout.paidAt,
      },
    });
  } catch (error) {
    console.error('Update payout error:', error);
    return NextResponse.json(
      { error: 'Failed to update payout' },
      { status: 500 }
    );
  }
}
