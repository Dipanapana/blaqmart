import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Dynamic import to avoid build issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      // Return mock data if Prisma not set up
      return NextResponse.json({
        products: [
          {
            id: '1',
            name: 'BM Pro Dashcam 1080P',
            description: 'Full 1080P HD recording with 170-degree ultra-wide angle lens. Night vision, G-sensor crash detection, and loop recording.',
            price: 790.0,
            imageUrl: null,
            stock: 50,
            isActive: true,
            category: 'SECURITY_DASHCAM',
            sku: 'BM-DC-001',
            store: {
              id: '1',
              name: 'BLAQMART Security',
              subscriptionTier: 'ENTERPRISE',
            },
          },
          {
            id: '2',
            name: 'BM Dual Dashcam Front + Rear',
            description: 'Front 1080P + Rear 720P simultaneous recording with 170-degree front and 140-degree rear coverage.',
            price: 1290.0,
            imageUrl: null,
            stock: 30,
            isActive: true,
            category: 'SECURITY_DASHCAM',
            sku: 'BM-DC-002',
            store: {
              id: '1',
              name: 'BLAQMART Security',
              subscriptionTier: 'ENTERPRISE',
            },
          },
          {
            id: '3',
            name: 'BM 4K Ultra Dashcam',
            description: '4K Ultra HD with built-in WiFi, GPS tracking, and premium WDR night vision.',
            price: 1890.0,
            imageUrl: null,
            stock: 20,
            isActive: true,
            category: 'SECURITY_DASHCAM',
            sku: 'BM-DC-003',
            store: {
              id: '1',
              name: 'BLAQMART Security',
              subscriptionTier: 'ENTERPRISE',
            },
          },
        ],
        total: 3,
      });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId');
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      isActive: true,
      // Default: exclude grocery products
      category: { not: 'GROCERY' },
    };

    // Filter by specific category if provided
    if (category) {
      where.category = category;
    }

    if (storeId) {
      where.storeId = storeId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Price range filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Determine sort order
    let orderBy: any = [
      { store: { subscriptionTier: 'desc' } },
      { createdAt: 'desc' },
    ];

    switch (sortBy) {
      case 'price-asc':
        orderBy = [{ price: 'asc' }];
        break;
      case 'price-desc':
        orderBy = [{ price: 'desc' }];
        break;
      case 'name-asc':
        orderBy = [{ name: 'asc' }];
        break;
      case 'name-desc':
        orderBy = [{ name: 'desc' }];
        break;
      case 'popular':
        // For now, sort by newest (can be enhanced with actual popularity metrics)
        orderBy = [{ createdAt: 'desc' }];
        break;
      default:
        // newest (default)
        orderBy = [
          { store: { subscriptionTier: 'desc' } },
          { createdAt: 'desc' },
        ];
    }

    // Fetch products
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          store: {
            select: {
              id: true,
              name: true,
              subscriptionTier: true,
            },
          },
        },
        orderBy,
        take: limit,
        skip: offset,
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Get products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    // TODO: Add authentication check
    // For now, require storeId in body
    const body = await request.json();
    const { name, description, price, imageUrl, images, videoUrl, stock, storeId, category, sku, weight, specs } = body;

    // Validation
    if (!name || !price || !storeId) {
      return NextResponse.json(
        { error: 'Name, price, and storeId are required' },
        { status: 400 }
      );
    }

    if (price <= 0) {
      return NextResponse.json(
        { error: 'Price must be greater than 0' },
        { status: 400 }
      );
    }

    // Dynamic import to avoid build issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured yet' },
        { status: 503 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        name,
        description: description || null,
        price: parseFloat(price),
        imageUrl: imageUrl || null,
        images: images || [],
        videoUrl: videoUrl || null,
        stock: parseInt(stock) || 0,
        storeId,
        category: category || 'GROCERY',
        sku: sku || null,
        weight: weight ? parseFloat(weight) : null,
        specs: specs || null,
        isActive: true,
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            subscriptionTier: true,
          },
        },
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
