import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Validate phone format (South African)
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid South African phone number format' },
        { status: 400 }
      );
    }

    // Normalize phone to E.164 format
    let normalizedPhone = phone;
    if (phone.startsWith('0')) {
      normalizedPhone = `+27${phone.slice(1)}`;
    }

    // Send OTP via Supabase Auth
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: normalizedPhone,
      options: {
        channel: 'sms',
      },
    });

    if (error) {
      console.error('Supabase OTP error:', error);
      return NextResponse.json(
        { error: error.message || 'Failed to send OTP' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully',
      phone: normalizedPhone,
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
