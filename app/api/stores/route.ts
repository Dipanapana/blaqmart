import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json({
        stores: [],
        message: 'Database not configured',
      });
    }

    // Get stores for this vendor
    const stores = await prisma.store.findMany({
      where: {
        vendor: {
          phone: user.phone || '',
        },
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ stores });
  } catch (error) {
    console.error('Get stores error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stores' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, address, phone, latitude, longitude } = body;

    // Validation
    if (!name || !address || !phone) {
      return NextResponse.json(
        { error: 'Name, address, and phone are required' },
        { status: 400 }
      );
    }

    const { prisma } = await import('@/lib/prisma');

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured yet' },
        { status: 503 }
      );
    }

    // Get or create user in our database
    const dbUser = await prisma.user.upsert({
      where: { phone: user.phone || '' },
      update: { role: 'VENDOR' },
      create: {
        phone: user.phone || '',
        role: 'VENDOR',
      },
    });

    // Create store
    const store = await prisma.store.create({
      data: {
        name,
        address,
        phone,
        latitude: latitude || -27.7069, // Default Warrenton coordinates
        longitude: longitude || 28.2294,
        vendorId: dbUser.id,
        isActive: true,
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    return NextResponse.json(store, { status: 201 });
  } catch (error) {
    console.error('Create store error:', error);
    return NextResponse.json(
      { error: 'Failed to create store' },
      { status: 500 }
    );
  }
}
