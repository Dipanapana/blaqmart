import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/approve-driver - Approve a driver application
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

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied - Admin role required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { driverId, userId } = body;

    if (!driverId || !userId) {
      return NextResponse.json(
        { error: 'Driver ID and User ID are required' },
        { status: 400 }
      );
    }

    // Approve driver profile
    const driverProfile = await prisma.driverProfile.update({
      where: { id: driverId },
      data: {
        isApproved: true,
        isActive: true,
      },
      include: {
        user: true,
      },
    });

    // Update user role to DRIVER
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: 'DRIVER',
      },
    });

    // Send driver approval notification (async, don't wait)
    try {
      const { notifyDriverApproved } = await import('@/lib/notifications');
      notifyDriverApproved(driverProfile.user.phone, {
        driverName: driverProfile.name,
      }).catch(console.error);
    } catch (notifError) {
      console.error('Failed to send driver approval notification:', notifError);
    }

    return NextResponse.json({
      success: true,
      message: 'Driver approved successfully',
      driverProfile,
    });
  } catch (error) {
    console.error('Approve driver error:', error);
    return NextResponse.json(
      { error: 'Failed to approve driver' },
      { status: 500 }
    );
  }
}
