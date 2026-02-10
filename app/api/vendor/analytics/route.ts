import { NextRequest, NextResponse } from 'next/server';

// GET /api/vendor/analytics - Get analytics for vendor's stores
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

    // Check if user is a vendor
    if (user.role !== 'VENDOR') {
      return NextResponse.json(
        { error: 'Access denied - Vendor role required' },
        { status: 403 }
      );
    }

    // Get vendor's stores
    const stores = await prisma.store.findMany({
      where: { vendorId: user.id },
      select: { id: true },
    });

    const storeIds = stores.map((store: any) => store.id);

    if (storeIds.length === 0) {
      return NextResponse.json({
        success: true,
        analytics: {
          totalOrders: 0,
          totalRevenue: 0,
          pendingOrders: 0,
          completedOrders: 0,
          totalProducts: 0,
          activeProducts: 0,
          averageOrderValue: 0,
          recentOrders: [],
          topProducts: [],
          salesByDay: [],
        },
      });
    }

    // Get total orders
    const totalOrders = await prisma.order.count({
      where: {
        storeId: { in: storeIds },
        paymentStatus: 'PAID',
      },
    });

    // Get total revenue
    const revenueData = await prisma.order.aggregate({
      where: {
        storeId: { in: storeIds },
        paymentStatus: 'PAID',
      },
      _sum: {
        subtotal: true,
      },
    });

    const totalRevenue = revenueData._sum.subtotal || 0;

    // Get pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        storeId: { in: storeIds },
        status: {
          in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY'],
        },
      },
    });

    // Get completed orders
    const completedOrders = await prisma.order.count({
      where: {
        storeId: { in: storeIds },
        status: 'DELIVERED',
      },
    });

    // Get total products
    const totalProducts = await prisma.product.count({
      where: { storeId: { in: storeIds } },
    });

    // Get active products
    const activeProducts = await prisma.product.count({
      where: {
        storeId: { in: storeIds },
        isActive: true,
      },
    });

    // Calculate average order value
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get recent orders (last 10)
    const recentOrders = await prisma.order.findMany({
      where: {
        storeId: { in: storeIds },
      },
      include: {
        customer: {
          select: {
            name: true,
            phone: true,
          },
        },
        items: {
          select: {
            quantity: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Get top products (by quantity sold)
    const topProductsData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          storeId: { in: storeIds },
          paymentStatus: 'PAID',
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    // Get product details for top products
    const topProducts = await Promise.all(
      topProductsData.map(async (item: any) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
          },
        });

        return {
          ...product,
          quantitySold: item._sum.quantity || 0,
        };
      })
    );

    // Get sales by day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const salesByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        storeId: { in: storeIds },
        paymentStatus: 'PAID',
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      _sum: {
        subtotal: true,
      },
      _count: true,
    });

    // Format sales by day
    const formattedSalesByDay = salesByDay.map((day: any) => ({
      date: day.createdAt.toISOString().split('T')[0],
      revenue: day._sum.subtotal || 0,
      orders: day._count,
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        completedOrders,
        totalProducts,
        activeProducts,
        averageOrderValue,
        recentOrders: recentOrders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total,
          itemCount: order.items.reduce((sum: any, item: any) => sum + item.quantity, 0),
          customerName: order.customer.name || 'Customer',
          createdAt: order.createdAt,
        })),
        topProducts,
        salesByDay: formattedSalesByDay,
      },
    });
  } catch (error) {
    console.error('Vendor analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
