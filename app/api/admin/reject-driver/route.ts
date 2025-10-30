import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/reject-driver - Reject a driver application
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
    const { driverId } = body;

    if (!driverId) {
      return NextResponse.json(
        { error: 'Driver ID is required' },
        { status: 400 }
      );
    }

    // Delete driver profile
    await prisma.driverProfile.delete({
      where: { id: driverId },
    });

    // TODO: Send SMS notification to driver about rejection

    return NextResponse.json({
      success: true,
      message: 'Driver application rejected',
    });
  } catch (error) {
    console.error('Reject driver error:', error);
    return NextResponse.json(
      { error: 'Failed to reject driver' },
      { status: 500 }
    );
  }
}
