import { NextRequest, NextResponse } from 'next/server';

// POST /api/driver/register - Register as a driver
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
      include: { driverProfile: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if already registered as driver
    if (user.driverProfile) {
      return NextResponse.json(
        { error: 'You are already registered as a driver' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      name,
      idNumber,
      licenseNumber,
      vehicleType,
      vehicleReg,
      bankName,
      accountNumber,
      branchCode,
    } = body;

    // Validate required fields
    if (
      !name ||
      !idNumber ||
      !licenseNumber ||
      !vehicleType ||
      !vehicleReg ||
      !bankName ||
      !accountNumber ||
      !branchCode
    ) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate ID number format (13 digits)
    if (!/^\d{13}$/.test(idNumber)) {
      return NextResponse.json(
        { error: 'ID number must be 13 digits' },
        { status: 400 }
      );
    }

    // Check if ID number already registered
    const existingDriver = await prisma.driverProfile.findUnique({
      where: { idNumber },
    });

    if (existingDriver) {
      return NextResponse.json(
        { error: 'This ID number is already registered' },
        { status: 400 }
      );
    }

    // Create driver profile
    const driverProfile = await prisma.driverProfile.create({
      data: {
        userId: user.id,
        name,
        idNumber,
        licenseNumber,
        vehicleType,
        vehicleReg,
        bankName,
        accountNumber,
        branchCode,
        isApproved: false, // Requires admin approval
        isActive: true,
      },
    });

    // Update user's name if not set
    if (!user.name) {
      await prisma.user.update({
        where: { id: user.id },
        data: { name },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Driver registration submitted successfully. Awaiting approval.',
      driverProfile,
    });
  } catch (error) {
    console.error('Driver registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register as driver' },
      { status: 500 }
    );
  }
}
