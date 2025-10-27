import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { phone, token } = await request.json();

    if (!phone || !token) {
      return NextResponse.json(
        { error: 'Phone and token are required' },
        { status: 400 }
      );
    }

    // Normalize phone
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = `+27${phone.slice(1)}`;
    }

    // Verify OTP with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      phone: normalizedPhone,
      token,
      type: 'sms',
    });

    if (error) {
      console.error('OTP verification error:', error);
      return NextResponse.json(
        { error: error.message || 'Invalid OTP' },
        { status: 400 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 400 }
      );
    }

    // Create or update user in our database
    // Note: This will be enabled once Prisma is set up
    try {
      const { prisma } = await import('@/lib/prisma');
      if (prisma) {
        const user = await prisma.user.upsert({
          where: { phone: normalizedPhone },
          update: {
            // Update last login timestamp if needed
          },
          create: {
            phone: normalizedPhone,
            role: 'CUSTOMER',
          },
        });

        return NextResponse.json({
          success: true,
          session: data.session,
          user: {
            id: user.id,
            phone: user.phone,
            name: user.name,
            role: user.role,
          },
        });
      }
    } catch (dbError) {
      console.error('Database error (Prisma not set up yet):', dbError);
      // Continue even if DB fails - auth is successful
    }

    return NextResponse.json({
      success: true,
      session: data.session,
      user: {
        id: data.user.id,
        phone: normalizedPhone,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
