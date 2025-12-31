import { Resend } from 'resend';

// Initialize Resend client lazily to avoid build-time errors
let resend: Resend | null = null;

function getResendClient(): Resend | null {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress?: {
    recipientName: string;
    streetAddress: string;
    city: string;
    province: string;
  };
  schoolName?: string;
  paymentMethod: string;
}

export async function sendOrderConfirmation(order: OrderData) {
  const fromEmail = process.env.EMAIL_FROM || 'Blaqmart Stationery <orders@blaqmart.co.za>';

  // Build email HTML
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
            ${item.name} × ${item.quantity}
          </td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">
            R${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

  const deliveryHtml = order.schoolName
    ? `<p style="margin: 0; color: #666;">
        <strong>School Collection:</strong> ${order.schoolName}
      </p>`
    : `<p style="margin: 0; color: #666;">
        ${order.deliveryAddress?.recipientName}<br/>
        ${order.deliveryAddress?.streetAddress}<br/>
        ${order.deliveryAddress?.city}, ${order.deliveryAddress?.province}
      </p>`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: #22c55e; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px;">✓</span>
          </div>
          <h1 style="margin: 0; color: #1E3A5F; font-size: 24px;">Order Confirmed!</h1>
          <p style="margin: 8px 0 0; color: #666;">Thank you for your order, ${order.customerName}!</p>
        </div>

        <!-- Order Number -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
          <p style="margin: 4px 0 0; color: #1E3A5F; font-size: 20px; font-weight: bold;">${order.orderNumber}</p>
        </div>

        <!-- Items -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 12px 0; border-bottom: 2px solid #1E3A5F; color: #1E3A5F;">Item</th>
              <th style="text-align: right; padding: 12px 0; border-bottom: 2px solid #1E3A5F; color: #1E3A5F;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 12px 0; color: #666;">Subtotal</td>
              <td style="padding: 12px 0; text-align: right;">R${order.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 0; color: #666;">Delivery</td>
              <td style="padding: 12px 0; text-align: right;">${order.deliveryFee === 0 ? '<span style="color: #22c55e;">Free</span>' : `R${order.deliveryFee.toFixed(2)}`}</td>
            </tr>
            <tr>
              <td style="padding: 16px 0; font-size: 18px; font-weight: bold; color: #1E3A5F; border-top: 2px solid #1E3A5F;">Total</td>
              <td style="padding: 16px 0; font-size: 18px; font-weight: bold; color: #1E3A5F; border-top: 2px solid #1E3A5F; text-align: right;">R${order.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- Delivery Info -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 12px; color: #1E3A5F; font-size: 16px;">
            ${order.schoolName ? '📚 Collection Details' : '📦 Delivery Address'}
          </h3>
          ${deliveryHtml}
          <p style="margin: 12px 0 0; color: #1E3A5F; font-weight: 500;">
            Expected: 1-5 business days
          </p>
        </div>

        <!-- Payment Method -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 8px; color: #1E3A5F; font-size: 16px;">💳 Payment</h3>
          <p style="margin: 0; color: #666;">
            ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod === 'yoco' ? 'Card (Yoco)' : order.paymentMethod}
          </p>
        </div>

        <!-- WhatsApp CTA -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://wa.me/27794022296?text=Hi!%20I%20have%20a%20question%20about%20order%20${encodeURIComponent(order.orderNumber)}"
             style="display: inline-block; background: #25D366; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            💬 WhatsApp Support
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #999; font-size: 14px;">
            Blaqmart Stationery<br/>
            Warrenton, Northern Cape
          </p>
          <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
            Questions? WhatsApp us at 079 402 2296
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();

    if (!client) {
      console.warn('Resend not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data, error } = await client.emails.send({
      from: fromEmail,
      to: order.customerEmail,
      subject: `Order Confirmed - ${order.orderNumber}`,
      html,
    });

    if (error) {
      console.error('Email send error:', error);
      throw error;
    }

    console.log('Order confirmation email sent:', data?.id);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Failed to send order confirmation:', error);
    // Don't throw - email failures shouldn't break the order flow
    return { success: false, error };
  }
}

// ============== ORDER STATUS NOTIFICATIONS ==============

interface StatusNotificationData {
  orderNumber: string;
  customerEmail: string;
  customerName: string;
  status: string;
  note?: string;
  items: OrderItem[];
  total: number;
}

const statusMessages: Record<string, { subject: string; heading: string; message: string; icon: string; color: string }> = {
  CONFIRMED: {
    subject: 'Order Confirmed',
    heading: 'Order Confirmed!',
    message: 'Your order has been confirmed and is being processed.',
    icon: '✓',
    color: '#22c55e',
  },
  PREPARING: {
    subject: 'Order Being Prepared',
    heading: 'We\'re Packing Your Order',
    message: 'Great news! We\'re now packing your items. They\'ll be on their way soon.',
    icon: '📦',
    color: '#f59e0b',
  },
  READY: {
    subject: 'Order Ready for Collection',
    heading: 'Ready for Collection!',
    message: 'Your order is ready to be collected. Please bring your order number.',
    icon: '🎒',
    color: '#3b82f6',
  },
  OUT_FOR_DELIVERY: {
    subject: 'Order Out for Delivery',
    heading: 'Your Order is On the Way!',
    message: 'Your order is out for delivery. It should arrive today.',
    icon: '🚚',
    color: '#8b5cf6',
  },
  DELIVERED: {
    subject: 'Order Delivered',
    heading: 'Order Delivered!',
    message: 'Your order has been delivered. We hope you love your stationery!',
    icon: '✓',
    color: '#22c55e',
  },
  CANCELLED: {
    subject: 'Order Cancelled',
    heading: 'Order Cancelled',
    message: 'Your order has been cancelled. If you paid online, your refund will be processed within 3-5 business days.',
    icon: '✕',
    color: '#ef4444',
  },
};

export async function sendStatusNotification(data: StatusNotificationData) {
  const fromEmail = process.env.EMAIL_FROM || 'Blaqmart Stationery <orders@blaqmart.co.za>';

  const statusInfo = statusMessages[data.status];
  if (!statusInfo) {
    console.warn(`No email template for status: ${data.status}`);
    return { success: false, error: 'No template for status' };
  }

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; color: #666;">
            ${item.name} × ${item.quantity}
          </td>
          <td style="padding: 8px 0; border-bottom: 1px solid #eee; text-align: right; color: #666;">
            R${(item.price * item.quantity).toFixed(2)}
          </td>
        </tr>`
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
      <div style="background: white; border-radius: 12px; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 32px;">
          <div style="width: 60px; height: 60px; background: ${statusInfo.color}; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
            <span style="color: white; font-size: 28px;">${statusInfo.icon}</span>
          </div>
          <h1 style="margin: 0; color: #1E3A5F; font-size: 24px;">${statusInfo.heading}</h1>
          <p style="margin: 8px 0 0; color: #666;">Hi ${data.customerName}!</p>
        </div>

        <!-- Order Number -->
        <div style="background: #f8fafc; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
          <p style="margin: 0; color: #666; font-size: 14px;">Order Number</p>
          <p style="margin: 4px 0 0; color: #1E3A5F; font-size: 20px; font-weight: bold;">${data.orderNumber}</p>
        </div>

        <!-- Status Message -->
        <div style="background: ${statusInfo.color}15; border-left: 4px solid ${statusInfo.color}; padding: 16px; margin-bottom: 24px; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #333;">${statusInfo.message}</p>
          ${data.note ? `<p style="margin: 12px 0 0; color: #666; font-size: 14px;"><strong>Note:</strong> ${data.note}</p>` : ''}
        </div>

        <!-- Order Summary -->
        <h3 style="margin: 0 0 12px; color: #1E3A5F; font-size: 16px;">Order Summary</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td style="padding: 12px 0; font-weight: bold; color: #1E3A5F; border-top: 2px solid #1E3A5F;">Total</td>
              <td style="padding: 12px 0; font-weight: bold; color: #1E3A5F; border-top: 2px solid #1E3A5F; text-align: right;">R${data.total.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>

        <!-- WhatsApp CTA -->
        <div style="text-align: center; margin-bottom: 24px;">
          <a href="https://wa.me/27794022296?text=Hi!%20I%20have%20a%20question%20about%20order%20${encodeURIComponent(data.orderNumber)}"
             style="display: inline-block; background: #25D366; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 500;">
            💬 WhatsApp Support
          </a>
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #eee;">
          <p style="margin: 0; color: #999; font-size: 14px;">
            Blaqmart Stationery<br/>
            Warrenton, Northern Cape
          </p>
          <p style="margin: 8px 0 0; color: #999; font-size: 12px;">
            Questions? WhatsApp us at 079 402 2296
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const client = getResendClient();

    if (!client) {
      console.warn('Resend not configured - skipping status email');
      return { success: false, error: 'Email service not configured' };
    }

    const { data: emailData, error } = await client.emails.send({
      from: fromEmail,
      to: data.customerEmail,
      subject: `${statusInfo.subject} - ${data.orderNumber}`,
      html,
    });

    if (error) {
      console.error('Status email send error:', error);
      throw error;
    }

    console.log('Status notification email sent:', emailData?.id);
    return { success: true, id: emailData?.id };
  } catch (error) {
    console.error('Failed to send status notification:', error);
    return { success: false, error };
  }
}
