import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// GET /api/orders/[id]/track - Get real-time delivery tracking information
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { prisma } = await import('@/lib/prisma');
    const { createClient } = await import('@/lib/supabase/server');
    const { id: orderId } = await context.params;

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

    // Get order with all tracking information
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        store: {
          select: {
            name: true,
            address: true,
            latitude: true,
            longitude: true,
          },
        },
        driver: {
          select: {
            name: true,
            phone: true,
          },
        },
        locationHistory: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 100, // Last 100 location points
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Verify the user owns this order
    if (order.customerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied - You can only track your own orders' },
        { status: 403 }
      );
    }

    // Only provide tracking for orders that are being delivered
    if (!['CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'].includes(order.status)) {
      return NextResponse.json(
        { error: 'Tracking not available for this order status' },
        { status: 400 }
      );
    }

    // Calculate distance if driver location is available
    let distanceToDelivery = null;
    if (order.driverLat && order.driverLng) {
      const R = 6371; // Earth's radius in km
      const dLat = (order.deliveryLat - order.driverLat) * Math.PI / 180;
      const dLon = (order.deliveryLng - order.driverLng) * Math.PI / 180;
      const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(order.driverLat * Math.PI / 180) * Math.cos(order.deliveryLat * Math.PI / 180) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      distanceToDelivery = R * c; // Distance in km
    }

    return NextResponse.json({
      success: true,
      tracking: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        estimatedTime: order.estimatedTime,

        // Store location (pickup point)
        storeLocation: {
          name: order.store.name,
          address: order.store.address,
          latitude: order.store.latitude,
          longitude: order.store.longitude,
        },

        // Delivery location
        deliveryLocation: {
          address: order.deliveryAddress,
          latitude: order.deliveryLat,
          longitude: order.deliveryLng,
        },

        // Driver information
        driver: order.driver ? {
          name: order.driver.name || 'Driver',
          phone: order.driver.phone,
          currentLocation: order.driverLat && order.driverLng ? {
            latitude: order.driverLat,
            longitude: order.driverLng,
            lastUpdate: order.lastLocationUpdate,
          } : null,
        } : null,

        // Tracking metrics
        metrics: {
          distanceToDelivery: distanceToDelivery ? distanceToDelivery.toFixed(2) + ' km' : null,
          estimatedArrival: order.estimatedTime ? `${order.estimatedTime} minutes` : null,
        },

        // Location history for route visualization
        route: order.locationHistory.map((loc) => ({
          latitude: loc.latitude,
          longitude: loc.longitude,
          timestamp: loc.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get order tracking error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracking information' },
      { status: 500 }
    );
  }
}
