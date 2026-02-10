import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/drivers/[id]/ratings - Get ratings for a driver
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { id: driverId } = await context.params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get ratings for this driver
    const ratings = await prisma.driverRating.findMany({
      where: {
        driverId,
      },
      include: {
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average rating
    const averageRating = ratings.length > 0
      ? ratings.reduce((sum: any, rating: any) => sum + rating.rating, 0) / ratings.length
      : 0;

    return NextResponse.json({
      success: true,
      ratings: ratings.map((rating: any) => ({
        id: rating.id,
        rating: rating.rating,
        comment: rating.comment,
        customerName: rating.customer.name || 'Anonymous',
        createdAt: rating.createdAt,
      })),
      averageRating,
      totalRatings: ratings.length,
    });
  } catch (error) {
    console.error('Get driver ratings error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ratings' },
      { status: 500 }
    );
  }
}

// POST /api/drivers/[id]/ratings - Submit a driver rating
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');
    const { id: driverId } = await context.params;

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

    const { orderId, rating, comment } = await request.json();

    // Validate input
    if (!orderId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid input - orderId and rating (1-5) required' },
        { status: 400 }
      );
    }

    // Verify the order exists and belongs to the user
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.customerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only rate drivers who delivered your orders' },
        { status: 403 }
      );
    }

    if (order.driverId !== driverId) {
      return NextResponse.json(
        { error: 'This driver did not deliver this order' },
        { status: 400 }
      );
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'You can only rate drivers after delivery' },
        { status: 400 }
      );
    }

    // Check if rating already exists
    const existingRating = await prisma.driverRating.findUnique({
      where: {
        orderId,
      },
    });

    if (existingRating) {
      return NextResponse.json(
        { error: 'You have already rated this driver for this delivery' },
        { status: 400 }
      );
    }

    // Create the rating
    const driverRating = await prisma.driverRating.create({
      data: {
        driverId,
        customerId: user.id,
        orderId,
        rating,
        comment: comment || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Driver rating submitted successfully',
      rating: {
        id: driverRating.id,
        rating: driverRating.rating,
        comment: driverRating.comment,
      },
    });
  } catch (error) {
    console.error('Submit driver rating error:', error);
    return NextResponse.json(
      { error: 'Failed to submit rating' },
      { status: 500 }
    );
  }
}
