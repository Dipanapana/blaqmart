import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Dynamic import to avoid build issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      // Return mock data if Prisma not set up
      return NextResponse.json({
        id: id,
        name: 'Sample Product',
        description: 'This is a sample product',
        price: 19.99,
        imageUrl: null,
        stock: 25,
        isActive: true,
        store: {
          id: '1',
          name: 'Sample Store',
          address: '123 Main St, Warrenton',
          phone: '0812345678',
        },
      });
    }

    // Fetch product
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            address: true,
            phone: true,
            subscriptionTier: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // TODO: Add authentication and authorization check
    // Verify that user owns the store for this product

    // Dynamic import to avoid build issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured yet' },
        { status: 503 }
      );
    }

    // Update product
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.imageUrl !== undefined && { imageUrl: body.imageUrl }),
        ...(body.stock !== undefined && { stock: parseInt(body.stock) }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
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

    return NextResponse.json(product);
  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // TODO: Add authentication and authorization check

    // Dynamic import to avoid build issues
    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured yet' },
        { status: 503 }
      );
    }

    // Soft delete - set isActive to false
    await prisma.product.update({
      where: { id },
      data: { isActive: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
