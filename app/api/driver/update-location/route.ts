import { NextRequest, NextResponse } from 'next/server';

// POST /api/driver/update-location - Update driver location during delivery
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

    // Check if user is a driver
    if (user.role !== 'DRIVER') {
      return NextResponse.json(
        { error: 'Access denied - Driver role required' },
        { status: 403 }
      );
    }

    const { orderId, latitude, longitude } = await request.json();

    // Validate input
    if (!orderId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'orderId, latitude, and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinates' },
        { status: 400 }
      );
    }

    // Verify the order exists and is assigned to this driver
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.driverId !== user.id) {
      return NextResponse.json(
        { error: 'This order is not assigned to you' },
        { status: 403 }
      );
    }

    // Only update location for active deliveries
    if (order.status !== 'OUT_FOR_DELIVERY') {
      return NextResponse.json(
        { error: 'Order is not out for delivery' },
        { status: 400 }
      );
    }

    // Update order with current driver location
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        driverLat: latitude,
        driverLng: longitude,
        lastLocationUpdate: new Date(),
      },
    });

    // Save location to history
    await prisma.driverLocationHistory.create({
      data: {
        orderId,
        latitude,
        longitude,
      },
    });

    // Calculate distance to destination (simple Haversine formula)
    const R = 6371; // Earth's radius in km
    const dLat = (order.deliveryLat - latitude) * Math.PI / 180;
    const dLon = (order.deliveryLng - longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(latitude * Math.PI / 180) * Math.cos(order.deliveryLat * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km

    // Estimate time based on distance (assuming average speed of 40 km/h)
    const estimatedMinutes = Math.ceil((distance / 40) * 60);

    // Update estimated time if significantly different
    if (Math.abs(estimatedMinutes - (order.estimatedTime || 0)) > 5) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          estimatedTime: estimatedMinutes,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Location updated successfully',
      distanceToDestination: distance.toFixed(2) + ' km',
      estimatedTime: estimatedMinutes,
    });
  } catch (error) {
    console.error('Update driver location error:', error);
    return NextResponse.json(
      { error: 'Failed to update location' },
      { status: 500 }
    );
  }
}
