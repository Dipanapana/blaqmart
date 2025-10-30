import { NextRequest, NextResponse } from 'next/server';

// POST /api/admin/toggle-driver-status - Toggle driver active/inactive status
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
    const { driverId, isActive } = body;

    if (!driverId || isActive === undefined) {
      return NextResponse.json(
        { error: 'Driver ID and active status are required' },
        { status: 400 }
      );
    }

    // Update driver status
    const driverProfile = await prisma.driverProfile.update({
      where: { id: driverId },
      data: {
        isActive,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Driver ${isActive ? 'activated' : 'deactivated'} successfully`,
      driverProfile,
    });
  } catch (error) {
    console.error('Toggle driver status error:', error);
    return NextResponse.json(
      { error: 'Failed to update driver status' },
      { status: 500 }
    );
  }
}
