// Centralized Notification Service
// Handles SMS, WhatsApp, and Email notifications for order updates

import { sendSMS } from './twilio';
import { sendWhatsApp, formatWhatsAppCurrency } from './whatsapp';
import { formatCurrency } from './utils';

// ==================== SMS TEMPLATES ====================

interface OrderCreatedSMSData {
  orderNumber: string;
  customerName: string;
  total: number;
  storeName: string;
}

interface OrderConfirmedSMSData {
  orderNumber: string;
  customerName: string;
  estimatedTime: number;
  storeName: string;
}

interface DriverAssignedSMSData {
  orderNumber: string;
  driverName: string;
  driverPhone: string;
  estimatedTime: number;
}

interface OrderDeliveredSMSData {
  orderNumber: string;
  customerName: string;
}

interface DriverApprovedSMSData {
  driverName: string;
}

// ==================== SMS NOTIFICATION FUNCTIONS ====================

/**
 * Send order confirmation SMS to customer
 */
export async function notifyCustomerOrderCreated(
  phone: string,
  data: OrderCreatedSMSData
): Promise<boolean> {
  const message = `Hi ${data.customerName}! Your BLAQMART order ${data.orderNumber} has been placed. Total: ${formatCurrency(data.total)}. From: ${data.storeName}. We'll notify you when it's confirmed.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send order received SMS to vendor
 */
export async function notifyVendorNewOrder(
  phone: string,
  data: OrderCreatedSMSData
): Promise<boolean> {
  const message = `New order received! Order ${data.orderNumber} from ${data.customerName}. Total: ${formatCurrency(data.total)}. Please confirm and prepare the order.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send order confirmed SMS to customer
 */
export async function notifyCustomerOrderConfirmed(
  phone: string,
  data: OrderConfirmedSMSData
): Promise<boolean> {
  const message = `Great news! Your order ${data.orderNumber} has been confirmed by ${data.storeName}. Your order will be delivered in approximately ${data.estimatedTime} minutes.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send driver assigned SMS to customer
 */
export async function notifyCustomerDriverAssigned(
  phone: string,
  data: DriverAssignedSMSData
): Promise<boolean> {
  const message = `Your order ${data.orderNumber} is on the way! Driver: ${data.driverName} (${data.driverPhone}). ETA: ${data.estimatedTime} minutes.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send out for delivery SMS to customer
 */
export async function notifyCustomerOutForDelivery(
  phone: string,
  orderNumber: string
): Promise<boolean> {
  const message = `Your BLAQMART order ${orderNumber} is out for delivery! Your driver is on the way. Please be available to receive your order.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send delivery completed SMS to customer
 */
export async function notifyCustomerOrderDelivered(
  phone: string,
  data: OrderDeliveredSMSData
): Promise<boolean> {
  const message = `Hi ${data.customerName}! Your order ${data.orderNumber} has been delivered. Thank you for using BLAQMART! Rate your experience: [link]`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send new delivery SMS to driver
 */
export async function notifyDriverNewDelivery(
  phone: string,
  orderNumber: string,
  storeName: string,
  deliveryAddress: string
): Promise<boolean> {
  const message = `New delivery assigned! Order ${orderNumber} from ${storeName}. Deliver to: ${deliveryAddress}. Check your dashboard for details.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send driver approval SMS
 */
export async function notifyDriverApproved(
  phone: string,
  data: DriverApprovedSMSData
): Promise<boolean> {
  const message = `Congratulations ${data.driverName}! Your BLAQMART driver application has been approved. You can now start accepting deliveries. Log in to your dashboard to get started.`;

  return await sendSMS({ to: phone, message });
}

/**
 * Send order ready for pickup SMS to vendor
 */
export async function notifyVendorOrderReady(
  phone: string,
  orderNumber: string
): Promise<boolean> {
  const message = `Order ${orderNumber} is marked as READY. Waiting for driver assignment.`;

  return await sendSMS({ to: phone, message });
}

// ==================== WHATSAPP NOTIFICATION FUNCTIONS ====================

/**
 * Send order confirmation WhatsApp to customer
 */
export async function notifyCustomerOrderCreatedWhatsApp(
  phone: string,
  data: OrderCreatedSMSData
): Promise<boolean> {
  const message = `🛒 *BLAQMART Order Placed*\n\nHi ${data.customerName}! 👋\n\nYour order *${data.orderNumber}* has been placed.\n\n📦 From: ${data.storeName}\n💰 Total: ${formatWhatsAppCurrency(data.total)}\n\n✅ We'll notify you when it's confirmed!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send new order WhatsApp to vendor
 */
export async function notifyVendorNewOrderWhatsApp(
  phone: string,
  data: OrderCreatedSMSData
): Promise<boolean> {
  const message = `🔔 *New Order Received!*\n\nOrder: *${data.orderNumber}*\n👤 Customer: ${data.customerName}\n💰 Total: ${formatWhatsAppCurrency(data.total)}\n\n⏱️ Please confirm and prepare the order ASAP!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send order confirmed WhatsApp to customer
 */
export async function notifyCustomerOrderConfirmedWhatsApp(
  phone: string,
  data: OrderConfirmedSMSData
): Promise<boolean> {
  const message = `✅ *Order Confirmed!*\n\nGreat news ${data.customerName}! 🎉\n\nYour order *${data.orderNumber}* has been confirmed by ${data.storeName}.\n\n⏱️ Estimated delivery: ${data.estimatedTime} minutes\n\n📍 Track your order in real-time on the app!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send driver assigned WhatsApp to customer
 */
export async function notifyCustomerDriverAssignedWhatsApp(
  phone: string,
  data: DriverAssignedSMSData
): Promise<boolean> {
  const message = `🚗 *Driver Assigned!*\n\nYour order *${data.orderNumber}* is on the way!\n\n👤 Driver: ${data.driverName}\n📱 Phone: ${data.driverPhone}\n⏱️ ETA: ${data.estimatedTime} minutes\n\n📍 Track live location in the app!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send out for delivery WhatsApp to customer
 */
export async function notifyCustomerOutForDeliveryWhatsApp(
  phone: string,
  orderNumber: string
): Promise<boolean> {
  const message = `🚚 *Out for Delivery!*\n\nYour BLAQMART order *${orderNumber}* is out for delivery! 📦\n\nYour driver is on the way. Please be available to receive your order.\n\n📍 Track your driver's location in real-time!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send delivery completed WhatsApp to customer
 */
export async function notifyCustomerOrderDeliveredWhatsApp(
  phone: string,
  data: OrderDeliveredSMSData
): Promise<boolean> {
  const message = `✅ *Delivered Successfully!*\n\nHi ${data.customerName}! 🎉\n\nYour order *${data.orderNumber}* has been delivered.\n\nThank you for using BLAQMART! ❤️\n\n⭐ Please rate your experience in the app!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send new delivery WhatsApp to driver
 */
export async function notifyDriverNewDeliveryWhatsApp(
  phone: string,
  orderNumber: string,
  storeName: string,
  deliveryAddress: string
): Promise<boolean> {
  const message = `🚗 *New Delivery Assigned!*\n\nOrder: *${orderNumber}*\n🏪 Pickup: ${storeName}\n📍 Deliver to: ${deliveryAddress}\n\n✅ Check your dashboard for details!`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send driver approval WhatsApp
 */
export async function notifyDriverApprovedWhatsApp(
  phone: string,
  data: DriverApprovedSMSData
): Promise<boolean> {
  const message = `🎉 *Application Approved!*\n\nCongratulations ${data.driverName}! 👏\n\nYour BLAQMART driver application has been approved! ✅\n\nYou can now start accepting deliveries. Log in to your dashboard to get started! 🚗💨`;

  return await sendWhatsApp({ to: phone, message });
}

/**
 * Send combined SMS + WhatsApp notification
 */
export async function notifyCustomerOrderCreatedMulti(
  phone: string,
  data: OrderCreatedSMSData
): Promise<void> {
  // Send both SMS and WhatsApp in parallel
  await Promise.all([
    notifyCustomerOrderCreated(phone, data).catch(console.error),
    notifyCustomerOrderCreatedWhatsApp(phone, data).catch(console.error),
  ]);
}

export async function notifyCustomerOrderConfirmedMulti(
  phone: string,
  data: OrderConfirmedSMSData
): Promise<void> {
  await Promise.all([
    notifyCustomerOrderConfirmed(phone, data).catch(console.error),
    notifyCustomerOrderConfirmedWhatsApp(phone, data).catch(console.error),
  ]);
}

export async function notifyCustomerDriverAssignedMulti(
  phone: string,
  data: DriverAssignedSMSData
): Promise<void> {
  await Promise.all([
    notifyCustomerDriverAssigned(phone, data).catch(console.error),
    notifyCustomerDriverAssignedWhatsApp(phone, data).catch(console.error),
  ]);
}

export async function notifyCustomerOutForDeliveryMulti(
  phone: string,
  orderNumber: string
): Promise<void> {
  await Promise.all([
    notifyCustomerOutForDelivery(phone, orderNumber).catch(console.error),
    notifyCustomerOutForDeliveryWhatsApp(phone, orderNumber).catch(console.error),
  ]);
}

export async function notifyCustomerOrderDeliveredMulti(
  phone: string,
  data: OrderDeliveredSMSData
): Promise<void> {
  await Promise.all([
    notifyCustomerOrderDelivered(phone, data).catch(console.error),
    notifyCustomerOrderDeliveredWhatsApp(phone, data).catch(console.error),
  ]);
}

// ==================== EMAIL TEMPLATES ====================

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Send email (placeholder for future implementation)
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  // TODO: Implement email service (SendGrid, AWS SES, etc.)
  console.log('[Email Mock]');
  console.log('To:', options.to);
  console.log('Subject:', options.subject);
  console.log('HTML:', options.html.substring(0, 100) + '...');
  return true;
}

/**
 * Generate order confirmation email HTML
 */
export function generateOrderConfirmationEmail(data: {
  orderNumber: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryAddress: string;
  storeName: string;
}): string {
  const itemsHtml = data.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.quantity}x ${item.name}</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
      `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - BLAQMART</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background-color: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0;">BLAQMART</h1>
        <p style="margin: 5px 0 0 0;">Order Confirmation</p>
      </div>

      <div style="background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none;">
        <h2>Thank you, ${data.customerName}!</h2>
        <p>Your order has been confirmed and is being prepared.</p>

        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Details</h3>
          <p><strong>Order Number:</strong> ${data.orderNumber}</p>
          <p><strong>Store:</strong> ${data.storeName}</p>
          <p><strong>Delivery Address:</strong> ${data.deliveryAddress}</p>
        </div>

        <div style="background-color: #fff; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse;">
            ${itemsHtml}
            <tr>
              <td style="padding: 10px; border-top: 2px solid #ddd;"><strong>Subtotal</strong></td>
              <td style="padding: 10px; border-top: 2px solid #ddd; text-align: right;"><strong>${formatCurrency(data.subtotal)}</strong></td>
            </tr>
            <tr>
              <td style="padding: 10px;">Delivery Fee</td>
              <td style="padding: 10px; text-align: right;">${data.deliveryFee === 0 ? 'FREE' : formatCurrency(data.deliveryFee)}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-top: 2px solid #ddd;"><strong>Total</strong></td>
              <td style="padding: 10px; border-top: 2px solid #ddd; text-align: right; color: #16a34a;"><strong>${formatCurrency(data.total)}</strong></td>
            </tr>
          </table>
        </div>

        <div style="background-color: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>What's next?</strong></p>
          <ul style="margin: 10px 0;">
            <li>The vendor will prepare your order</li>
            <li>A driver will be assigned</li>
            <li>You'll receive updates via SMS</li>
            <li>Expected delivery: 3-5 business days</li>
          </ul>
        </div>

        <p style="text-align: center; color: #666; font-size: 14px; margin-top: 30px;">
          Thank you for choosing BLAQMART!<br>
          Drive Protected. Record Everything.
        </p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Send order confirmation email to customer
 */
export async function emailCustomerOrderConfirmation(
  email: string,
  data: {
    orderNumber: string;
    customerName: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: string;
    storeName: string;
  }
): Promise<boolean> {
  const html = generateOrderConfirmationEmail(data);

  return await sendEmail({
    to: email,
    subject: `Order Confirmation - ${data.orderNumber} - BLAQMART`,
    html,
  });
}

// ==================== NOTIFICATION ORCHESTRATION ====================

/**
 * Send all notifications for a new order
 */
export async function notifyOrderCreated(order: {
  orderNumber: string;
  customer: { name: string | null; phone: string };
  store: { name: string; phone: string };
  total: number;
  items: Array<{ product: { name: string }; quantity: number; price: number }>;
  subtotal: number;
  deliveryFee: number;
  deliveryAddress: string;
}): Promise<void> {
  const customerName = order.customer.name || 'Customer';

  // SMS to customer
  await notifyCustomerOrderCreated(order.customer.phone, {
    orderNumber: order.orderNumber,
    customerName,
    total: order.total,
    storeName: order.store.name,
  });

  // SMS to vendor
  await notifyVendorNewOrder(order.store.phone, {
    orderNumber: order.orderNumber,
    customerName,
    total: order.total,
    storeName: order.store.name,
  });

  // Email to customer (if we have email)
  // Note: Currently using phone as email placeholder
  // await emailCustomerOrderConfirmation(...)
}

/**
 * Send all notifications for order confirmation
 */
export async function notifyOrderConfirmed(order: {
  orderNumber: string;
  customer: { name: string | null; phone: string };
  store: { name: string };
  estimatedTime: number;
}): Promise<void> {
  const customerName = order.customer.name || 'Customer';

  await notifyCustomerOrderConfirmed(order.customer.phone, {
    orderNumber: order.orderNumber,
    customerName,
    estimatedTime: order.estimatedTime || 45,
    storeName: order.store.name,
  });
}

/**
 * Send all notifications for driver assignment
 */
export async function notifyDriverAssignment(order: {
  orderNumber: string;
  customer: { name: string | null; phone: string };
  driver: { name: string | null; phone: string };
  store: { name: string };
  deliveryAddress: string;
  estimatedTime: number;
}): Promise<void> {
  const driverName = order.driver.name || 'Driver';

  // Notify customer
  await notifyCustomerDriverAssigned(order.customer.phone, {
    orderNumber: order.orderNumber,
    driverName,
    driverPhone: order.driver.phone,
    estimatedTime: order.estimatedTime || 45,
  });

  // Notify driver
  await notifyDriverNewDelivery(
    order.driver.phone,
    order.orderNumber,
    order.store.name,
    order.deliveryAddress
  );
}

/**
 * Send all notifications for out for delivery
 */
export async function notifyOrderOutForDelivery(order: {
  orderNumber: string;
  customer: { phone: string };
}): Promise<void> {
  await notifyCustomerOutForDelivery(order.customer.phone, order.orderNumber);
}

/**
 * Send all notifications for delivery completed
 */
export async function notifyOrderDelivered(order: {
  orderNumber: string;
  customer: { name: string | null; phone: string };
}): Promise<void> {
  const customerName = order.customer.name || 'Customer';

  await notifyCustomerOrderDelivered(order.customer.phone, {
    orderNumber: order.orderNumber,
    customerName,
  });
}
