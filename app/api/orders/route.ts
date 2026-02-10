import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Generate unique order number
function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 7);
  return `BM-${timestamp}-${random}`.toUpperCase();
}

// POST /api/orders - Create new order
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

    const body = await request.json();
    const { deliveryAddress, customerPhone, notes, items, province } = body;

    // Validate required fields
    if (!deliveryAddress || !customerPhone || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Group items by store
    const itemsByStore: { [storeId: string]: typeof items } = {};

    for (const item of items) {
      // Get product details to find store
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: { store: true },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Product ${product.name} is not available` },
          { status: 400 }
        );
      }

      if (product.stock < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }

      const storeId = product.storeId;
      if (!itemsByStore[storeId]) {
        itemsByStore[storeId] = [];
      }
      itemsByStore[storeId].push({ ...item, product });
    }

    // Create orders (one per store)
    const orders = [];

    for (const [storeId, storeItems] of Object.entries(itemsByStore)) {
      // Calculate totals
      const subtotal = storeItems.reduce(
        (sum: any, item: any) => sum + item.price * item.quantity,
        0
      );

      // Province-based shipping fee for nationwide delivery
      const { calculateShippingFee } = await import('@/lib/shipping');
      const shippingFee = calculateShippingFee(province || null, subtotal);
      const deliveryFee = shippingFee;
      const total = subtotal + deliveryFee;

      // Create order
      const order = await prisma.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerId: user.id,
          customerPhone,
          deliveryAddress,
          deliveryLat: null,
          deliveryLng: null,
          storeId,
          subtotal,
          deliveryFee,
          total,
          province: province || null,
          shippingFee,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          paymentMethod: 'YOCO',
          items: {
            create: storeItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          store: true,
        },
      });

      // Update product stock
      for (const item of storeItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      orders.push(order);
    }

    // For simplicity, return the first order (in production, handle multiple orders)
    const mainOrder = orders[0];

    // Send notifications (async, don't wait)
    try {
      const { notifyOrderCreated } = await import('@/lib/notifications');
      notifyOrderCreated(mainOrder).catch(console.error);
    } catch (notifError) {
      console.error('Failed to send order notifications:', notifError);
    }

    return NextResponse.json({
      success: true,
      order: mainOrder,
      ordersCreated: orders.length,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// GET /api/orders - List user's orders
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

    // Get orders
    const orders = await prisma.order.findMany({
      where: {
        customerId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        store: true,
        driver: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Orders fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
