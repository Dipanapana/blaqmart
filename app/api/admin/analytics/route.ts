import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/analytics - Get platform-wide analytics
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

    // Get platform metrics
    const totalUsers = await prisma.user.count();
    const totalVendors = await prisma.user.count({ where: { role: 'VENDOR' } });
    const totalDrivers = await prisma.user.count({ where: { role: 'DRIVER' } });
    const totalCustomers = await prisma.user.count({ where: { role: 'CUSTOMER' } });

    const totalStores = await prisma.store.count();
    const activeStores = await prisma.store.count({ where: { isActive: true } });

    const totalProducts = await prisma.product.count();
    const activeProducts = await prisma.product.count({ where: { isActive: true } });

    const totalOrders = await prisma.order.count();
    const paidOrders = await prisma.order.count({ where: { paymentStatus: 'PAID' } });

    const deliveredOrders = await prisma.order.count({ where: { status: 'DELIVERED' } });
    const pendingOrders = await prisma.order.count({
      where: { status: { in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'OUT_FOR_DELIVERY'] } },
    });

    // Get revenue data
    const revenueData = await prisma.order.aggregate({
      where: { paymentStatus: 'PAID' },
      _sum: { total: true },
    });

    const platformRevenue = revenueData._sum.total || 0;

    // Get pending driver applications
    const pendingDrivers = await prisma.driverProfile.count({
      where: { isApproved: false },
    });

    // Get active drivers
    const activeDrivers = await prisma.driverProfile.count({
      where: { isApproved: true, isActive: true },
    });

    // Get orders by status
    const ordersByStatus = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    // Get recent orders
    const recentOrders = await prisma.order.findMany({
      include: {
        customer: { select: { name: true, phone: true } },
        store: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Get top stores by revenue
    const topStoresData = await prisma.order.groupBy({
      by: ['storeId'],
      where: { paymentStatus: 'PAID' },
      _sum: { subtotal: true },
      _count: true,
      orderBy: { _sum: { subtotal: 'desc' } },
      take: 5,
    });

    const topStores = await Promise.all(
      topStoresData.map(async (item: any) => {
        const store = await prisma.store.findUnique({
          where: { id: item.storeId },
          select: { id: true, name: true, address: true },
        });

        return {
          ...store,
          revenue: item._sum.subtotal || 0,
          orders: item._count,
        };
      })
    );

    // Get sales by day (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesByDay = await prisma.order.groupBy({
      by: ['createdAt'],
      where: {
        paymentStatus: 'PAID',
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { total: true },
      _count: true,
    });

    const formattedSalesByDay = salesByDay.map((day: any) => ({
      date: day.createdAt.toISOString().split('T')[0],
      revenue: day._sum.total || 0,
      orders: day._count,
    }));

    return NextResponse.json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          vendors: totalVendors,
          drivers: totalDrivers,
          customers: totalCustomers,
        },
        stores: {
          total: totalStores,
          active: activeStores,
        },
        products: {
          total: totalProducts,
          active: activeProducts,
        },
        orders: {
          total: totalOrders,
          paid: paidOrders,
          delivered: deliveredOrders,
          pending: pendingOrders,
        },
        revenue: {
          total: platformRevenue,
          averageOrderValue: paidOrders > 0 ? platformRevenue / paidOrders : 0,
        },
        drivers: {
          pending: pendingDrivers,
          active: activeDrivers,
        },
        ordersByStatus,
        recentOrders: recentOrders.map((order: any) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.paymentStatus,
          total: order.total,
          customerName: order.customer.name || 'Customer',
          storeName: order.store.name,
          createdAt: order.createdAt,
        })),
        topStores,
        salesByDay: formattedSalesByDay,
      },
    });
  } catch (error) {
    console.error('Admin analytics fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
