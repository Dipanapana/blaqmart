import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/products/[id]/reviews - Get reviews for a product
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { id: productId } = await context.params;

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // Get approved reviews for this product
    const reviews = await prisma.productReview.findMany({
      where: {
        productId,
        isApproved: true,
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
    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: any, review: any) => sum + review.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      success: true,
      reviews: reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customerName: review.customer.name || 'Anonymous',
        createdAt: review.createdAt,
      })),
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/reviews - Submit a review
export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');
    const { id: productId } = await context.params;

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
      include: {
        items: {
          where: { productId },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.customerId !== user.id) {
      return NextResponse.json(
        { error: 'You can only review products you purchased' },
        { status: 403 }
      );
    }

    if (order.status !== 'DELIVERED') {
      return NextResponse.json(
        { error: 'You can only review products after delivery' },
        { status: 400 }
      );
    }

    // Check if product was in this order
    if (order.items.length === 0) {
      return NextResponse.json(
        { error: 'This product was not in the order' },
        { status: 400 }
      );
    }

    // Check if review already exists
    const existingReview = await prisma.productReview.findUnique({
      where: {
        orderId_productId: {
          orderId,
          productId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this product' },
        { status: 400 }
      );
    }

    // Create the review
    const review = await prisma.productReview.create({
      data: {
        productId,
        customerId: user.id,
        orderId,
        rating,
        comment: comment || null,
        isApproved: false, // Requires admin approval
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully. It will be visible after admin approval.',
      review: {
        id: review.id,
        rating: review.rating,
        comment: review.comment,
      },
    });
  } catch (error) {
    console.error('Submit product review error:', error);
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    );
  }
}
