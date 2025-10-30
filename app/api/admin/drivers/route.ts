import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/drivers - Get all driver profiles
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

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied - Admin role required' },
        { status: 403 }
      );
    }

    // Get all driver profiles
    const drivers = await prisma.driverProfile.findMany({
      include: {
        user: {
          select: {
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
      drivers,
    });
  } catch (error) {
    console.error('Drivers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch drivers' },
      { status: 500 }
    );
  }
}
