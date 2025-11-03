/**
 * WhatsApp Messaging Service using Twilio
 *
 * Environment Variables Required:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_NUMBER (e.g., whatsapp:+14155238886)
 */

interface WhatsAppMessage {
  to: string;
  message: string;
  mediaUrl?: string;
}

const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
};

/**
 * Send WhatsApp message using Twilio API
 */
export async function sendWhatsApp({
  to,
  message,
  mediaUrl,
}: WhatsAppMessage): Promise<boolean> {
  const { accountSid, authToken, whatsappNumber } = TWILIO_CONFIG;

  // Check if credentials are configured
  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured, skipping WhatsApp message');
    return false;
  }

  try {
    // Format phone number for WhatsApp (must include whatsapp: prefix)
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('whatsapp:')) {
      // Ensure phone starts with +27 for South Africa
      if (!formattedTo.startsWith('+')) {
        formattedTo = '+27' + formattedTo.replace(/^0/, '');
      }
      formattedTo = `whatsapp:${formattedTo}`;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', whatsappNumber);
    formData.append('Body', message);

    // Add media URL if provided
    if (mediaUrl) {
      formData.append('MediaUrl', mediaUrl);
    }

    // Make request to Twilio
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Twilio WhatsApp API error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('WhatsApp message sent successfully:', data.sid);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

/**
 * Send WhatsApp message with template (for pre-approved templates)
 */
export async function sendWhatsAppTemplate({
  to,
  templateName,
  templateParams,
}: {
  to: string;
  templateName: string;
  templateParams: Record<string, string>;
}): Promise<boolean> {
  const { accountSid, authToken, whatsappNumber } = TWILIO_CONFIG;

  if (!accountSid || !authToken) {
    console.warn('Twilio credentials not configured');
    return false;
  }

  try {
    let formattedTo = to.trim();
    if (!formattedTo.startsWith('whatsapp:')) {
      if (!formattedTo.startsWith('+')) {
        formattedTo = '+27' + formattedTo.replace(/^0/, '');
      }
      formattedTo = `whatsapp:${formattedTo}`;
    }

    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const formData = new URLSearchParams();
    formData.append('To', formattedTo);
    formData.append('From', whatsappNumber);
    formData.append('ContentSid', templateName);

    // Add template parameters
    Object.entries(templateParams).forEach(([key, value], index) => {
      formData.append(`ContentVariables`, JSON.stringify(templateParams));
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Twilio WhatsApp template error:', errorData);
      return false;
    }

    const data = await response.json();
    console.log('WhatsApp template sent successfully:', data.sid);
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp template:', error);
    return false;
  }
}

/**
 * Format currency for WhatsApp messages
 */
export function formatWhatsAppCurrency(amount: number): string {
  return `R ${amount.toFixed(2)}`;
}

/**
 * Test WhatsApp connection
 */
export async function testWhatsAppConnection(testNumber: string): Promise<boolean> {
  return await sendWhatsApp({
    to: testNumber,
    message: '🎉 BLAQMART WhatsApp notifications are now active! You will receive order updates here.',
  });
}
