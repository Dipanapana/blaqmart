// Twilio SMS Service
// Configuration and utilities for sending SMS via Twilio

interface TwilioConfig {
  accountSid: string;
  authToken: string;
  phoneNumber: string;
}

const TWILIO_CONFIG: TwilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID || '',
  authToken: process.env.TWILIO_AUTH_TOKEN || '',
  phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
};

interface SMSOptions {
  to: string;
  message: string;
}

/**
 * Send SMS using Twilio API
 */
export async function sendSMS({ to, message }: SMSOptions): Promise<boolean> {
  // Check if Twilio is configured
  if (!TWILIO_CONFIG.accountSid || !TWILIO_CONFIG.authToken || !TWILIO_CONFIG.phoneNumber) {
    console.warn('Twilio not configured. SMS not sent.');
    console.log(`[SMS Mock] To: ${to}, Message: ${message}`);
    return false;
  }

  try {
    // Format phone number for South Africa
    const formattedTo = to.startsWith('+') ? to : `+${to}`;

    // Twilio API endpoint
    const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_CONFIG.accountSid}/Messages.json`;

    // Create form data
    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', TWILIO_CONFIG.phoneNumber);
    formData.append('Body', message);

    // Make request to Twilio
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${TWILIO_CONFIG.accountSid}:${TWILIO_CONFIG.authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Twilio SMS error:', error);
      return false;
    }

    const data = await response.json();
    console.log('SMS sent successfully:', data.sid);
    return true;
  } catch (error) {
    console.error('Failed to send SMS:', error);
    return false;
  }
}

/**
 * Send SMS to multiple recipients
 */
export async function sendBulkSMS(recipients: string[], message: string): Promise<number> {
  let successCount = 0;

  for (const recipient of recipients) {
    const success = await sendSMS({ to: recipient, message });
    if (success) {
      successCount++;
    }
    // Add small delay between messages to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return successCount;
}

/**
 * Validate South African phone number
 */
export function validatePhoneNumber(phone: string): boolean {
  // South African format: +27XXXXXXXXX (11 digits total)
  const regex = /^\+27\d{9}$/;
  return regex.test(phone);
}

/**
 * Format phone number to South African format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');

  // If starts with 0, replace with 27
  if (cleaned.startsWith('0')) {
    cleaned = '27' + cleaned.substring(1);
  }

  // Add + prefix
  return `+${cleaned}`;
}
