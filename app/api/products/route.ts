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
            name: 'Fresh Tomatoes',
            description: 'Locally grown ripe tomatoes',
            price: 15.99,
            imageUrl: null,
            stock: 50,
            isActive: true,
            store: {
              id: '1',
              name: 'Green Valley Farm',
              subscriptionTier: 'FREE',
            },
          },
          {
            id: '2',
            name: 'White Bread',
            description: 'Freshly baked white bread',
            price: 12.50,
            imageUrl: null,
            stock: 30,
            isActive: true,
            store: {
              id: '2',
              name: 'Warrenton Bakery',
              subscriptionTier: 'PREMIUM',
            },
          },
          {
            id: '3',
            name: 'Fresh Milk 2L',
            description: 'Full cream fresh milk',
            price: 22.99,
            imageUrl: null,
            stock: 40,
            isActive: true,
            store: {
              id: '1',
              name: 'Green Valley Farm',
              subscriptionTier: 'FREE',
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
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sortBy = searchParams.get('sortBy') || 'newest';
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where clause
    const where: any = {
      isActive: true,
    };

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
    const { name, description, price, imageUrl, stock, storeId } = body;

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
        stock: parseInt(stock) || 0,
        storeId,
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
