import { NextRequest, NextResponse } from 'next/server';

// GET /api/driver/profile - Get driver profile
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
      include: { driverProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.driverProfile) {
      return NextResponse.json(
        { error: 'Driver profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      profile: user.driverProfile,
    });
  } catch (error) {
    console.error('Driver profile fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch driver profile' },
      { status: 500 }
    );
  }
}
