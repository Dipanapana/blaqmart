import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/reviews - Get pending reviews
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

    // Get pending product reviews
    const productReviews = await prisma.productReview.findMany({
      where: { isApproved: false },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        product: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get pending store reviews
    const storeReviews = await prisma.storeReview.findMany({
      where: { isApproved: false },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        store: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      productReviews: productReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customerName: review.customer.name || 'Anonymous',
        customerPhone: review.customer.phone,
        productName: review.product.name,
        createdAt: review.createdAt,
      })),
      storeReviews: storeReviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customerName: review.customer.name || 'Anonymous',
        customerPhone: review.customer.phone,
        storeName: review.store.name,
        createdAt: review.createdAt,
      })),
    });
  } catch (error) {
    console.error('Get pending reviews error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/reviews - Approve or reject a review
export async function PATCH(request: NextRequest) {
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

    const { reviewId, type, action } = await request.json();

    // Validate input
    if (!reviewId || !type || !action) {
      return NextResponse.json(
        { error: 'reviewId, type, and action are required' },
        { status: 400 }
      );
    }

    if (!['product', 'store'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid review type' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    // Update review based on type and action
    if (type === 'product') {
      if (action === 'approve') {
        await prisma.productReview.update({
          where: { id: reviewId },
          data: { isApproved: true },
        });
      } else {
        // Delete if rejected
        await prisma.productReview.delete({
          where: { id: reviewId },
        });
      }
    } else if (type === 'store') {
      if (action === 'approve') {
        await prisma.storeReview.update({
          where: { id: reviewId },
          data: { isApproved: true },
        });
      } else {
        // Delete if rejected
        await prisma.storeReview.delete({
          where: { id: reviewId },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Review ${action}ed successfully`,
    });
  } catch (error) {
    console.error('Moderate review error:', error);
    return NextResponse.json(
      { error: 'Failed to moderate review' },
      { status: 500 }
    );
  }
}
