import { Order } from '../types';

export const SELLER_EMAIL = 'neetuyadav30@gmail.com';
export const SELLER_PHONE = '+91 9971921200';
export const BRAND_NAME = 'Adrit Creations';

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface DualEmailResult {
  sellerSuccess: boolean;
  buyerSuccess: boolean;
  sellerMessageId?: string;
  buyerMessageId?: string;
  sellerError?: string;
  buyerError?: string;
}

/**
 * Robust UTF-8 Base64 encoder (handles emojis, Indian rupee symbols ₹, accents, quotes)
 */
function utf8ToBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64URL encoder required by Gmail API (RFC 4648 §5)
 */
function base64UrlEncode(str: string): string {
  const b64 = utf8ToBase64(str);
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Encodes RFC-2822 email message safely for Gmail API
 */
function encodeRawEmail(
  to: string,
  subject: string,
  bodyHtml: string,
  fromEmail?: string
): string {
  const headers = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${utf8ToBase64(subject)}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
  ];

  // In Gmail API, From header should only be included if it's confirmed or valid.
  // Otherwise Gmail automatically defaults to the authenticated user's address.
  if (fromEmail) {
    headers.push(`From: ${BRAND_NAME} <${fromEmail}>`);
  }

  const rawMessage = headers.join('\r\n') + '\r\n\r\n' + bodyHtml;
  return base64UrlEncode(rawMessage);
}

/**
 * Formats a colorful, appetizing HTML order email for Sunita (seller) or for the Customer (buyer)
 */
export function buildOrderEmailHtml(order: Order, isForSeller: boolean = true): string {
  const { customer, items, total, subtotal, deliveryFee, id } = order;
  const itemsRows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #ebd9c8;">
      <td style="padding: 12px 10px; font-family: 'Georgia', serif;">
        <strong style="color: #3b2012; font-size: 15px;">${item.chocolate.name}</strong><br/>
        <span style="color: #7c5c47; font-size: 13px;">Box Packaging: <strong>${item.selectedBox.label}</strong> (${item.selectedBox.count})</span>
        ${item.customGiftNote ? `<br/><span style="display: inline-block; margin-top: 4px; padding: 2px 8px; background: #fff1f2; border: 1px solid #fecdd3; border-radius: 6px; color: #e11d48; font-size: 12px; font-style: italic;">🎁 Handwritten Card: "${item.customGiftNote}"</span>` : ''}
        ${item.ribbonColor ? `<br/><span style="color: #92400e; font-size: 12px;">🎀 Ribbon: ${item.ribbonColor}</span>` : ''}
      </td>
      <td style="padding: 12px 10px; text-align: center; color: #42291a; font-weight: bold; font-size: 14px;">${item.quantity}</td>
      <td style="padding: 12px 10px; text-align: right; color: #b45309; font-weight: bold; font-size: 15px;">₹${item.selectedBox.price * item.quantity}</td>
    </tr>
  `
    )
    .join('');

  if (isForSeller) {
    // SELLER NOTIFICATION EMAIL (for Sunita)
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 24px; background-color: #faf5ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2a1810;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(90, 50, 20, 0.08); border: 1px solid #ebd9c8;">
          
          <!-- Colorful Header Banner -->
          <div style="background: linear-gradient(135deg, #78350f 0%, #b45309 50%, #db2777 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
            <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #fef08a; font-weight: bold;">ADRIT CREATIONS &bull; HOMEMADE CHOCOLATES</p>
            <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 0.5px; color: #ffffff;">NEW ORDER RECEIVED! 🍫</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #fdf2f8;">Handcrafted fresh on order by Sunita Yadav</p>
          </div>

          <div style="padding: 24px;">
            <!-- Action Banner -->
            <div style="background: linear-gradient(135deg, #fef3c7 0%, #ffedd5 100%); border: 1px solid #f59e0b; padding: 16px 20px; border-radius: 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-weight: bold; color: #92400e; font-size: 15px;">
                📞 Sunita: Contact customer to collect payment & confirm batch!
              </p>
              <p style="margin: 6px 0 0 0; color: #b45309; font-size: 13px;">
                Order ID: <strong style="color: #78350f; font-size: 14px;">#${id}</strong> &bull; Total to Collect: <strong style="color: #b45309; font-size: 16px;">₹${total}</strong>
              </p>
            </div>

            <!-- Customer Contact Details -->
            <div style="background: #faf6f0; border: 1px solid #ebd9c8; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
              <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #78350f;">
                Customer & Delivery Information
              </h3>
              <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                <tr>
                  <td style="width: 130px; color: #7c5c47;">Customer Name:</td>
                  <td><strong style="color: #2a160d; font-size: 14px;">${customer.name}</strong></td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Phone Number:</td>
                  <td>
                    <a href="tel:${customer.phone.replace(/[^0-9+]/g, '')}" style="color: #b45309; font-weight: bold; text-decoration: none;">
                      ${customer.phone}
                    </a>
                    &nbsp;
                    <a href="https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}" style="background: #25D366; color: white; padding: 2px 8px; border-radius: 4px; text-decoration: none; font-size: 11px; font-weight: bold;">
                      Chat on WhatsApp
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Customer Email:</td>
                  <td>
                    ${customer.email ? `<a href="mailto:${customer.email}" style="color: #b45309; text-decoration: underline;">${customer.email}</a>` : '<span style="color: #9ca3af;">Not provided</span>'}
                  </td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Delivery Address:</td>
                  <td><strong>${customer.address}</strong>${customer.landmark ? `, Near ${customer.landmark}` : ''}, ${customer.city} - ${customer.pincode}</td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Scheduled Date:</td>
                  <td><strong style="color: #78350f;">${customer.deliveryDate}</strong> (${customer.timeSlot})</td>
                </tr>
                ${customer.specialInstructions ? `
                <tr>
                  <td style="color: #7c5c47;">Special Notes:</td>
                  <td><em style="color: #92400e;">${customer.specialInstructions}</em></td>
                </tr>
                ` : ''}
              </table>
            </div>

            <!-- Items Ordered Table -->
            <h3 style="margin: 0 0 10px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #78350f;">
              Order Summary
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f5ebe0; text-align: left; font-size: 12px; color: #78350f; text-transform: uppercase;">
                  <th style="padding: 8px 10px; border-radius: 8px 0 0 8px;">Chocolate Item</th>
                  <th style="padding: 8px 10px; text-align: center;">Qty</th>
                  <th style="padding: 8px 10px; text-align: right; border-radius: 0 8px 8px 0;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Financial Totals -->
            <div style="background: #fcf9f5; border: 1px solid #ebd9c8; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #7c5c47;">Items Subtotal:</td>
                  <td style="text-align: right; font-weight: bold; color: #2a160d;">₹${subtotal}</td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Delivery Fee:</td>
                  <td style="text-align: right; font-weight: bold; color: ${deliveryFee === 0 ? '#15803d' : '#2a160d'};">
                    ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #ebd9c8;">
                  <td style="padding-top: 8px; font-size: 15px; font-weight: bold; color: #78350f;">Total to Collect:</td>
                  <td style="padding-top: 8px; text-align: right; font-size: 18px; font-weight: bold; color: #b45309;">₹${total}</td>
                </tr>
              </table>
            </div>

            <!-- Reminder -->
            <div style="text-align: center; color: #78350f; font-size: 12px; padding-top: 10px;">
              <p style="margin: 0;">⚡ Reminder: Contact customer to confirm preparation and collect payment via UPI or Cash.</p>
              <p style="margin: 4px 0 0 0; color: #a16207;">Store Owner Phone: ${SELLER_PHONE}</p>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #2a160d; padding: 18px; text-align: center; color: #f5ebe0; font-size: 12px;">
            <p style="margin: 0; font-weight: 500;">Adrit Creations &bull; Homemade Artisanal Chocolates</p>
            <p style="margin: 4px 0 0 0; color: #fde68a;">Powered by Sunita Yadav &bull; ${SELLER_EMAIL}</p>
          </div>

        </div>
      </body>
      </html>
    `;
  } else {
    // BUYER CONFIRMATION RECEIPT (for Customer)
    return `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="margin: 0; padding: 24px; background-color: #faf5ee; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #2a1810;">
        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(90, 50, 20, 0.08); border: 1px solid #ebd9c8;">
          
          <!-- Header Banner -->
          <div style="background: linear-gradient(135deg, ${order.moneyReceived ? '#059669 0%, #0d9488 60%, #2563eb 100%' : '#e11d48 0%, #b45309 60%, #10b981 100%'}); padding: 32px 24px; text-align: center; color: #ffffff;">
            <p style="margin: 0 0 6px 0; font-size: 11px; letter-spacing: 3px; text-transform: uppercase; color: #fef08a; font-weight: bold;">ADRIT CREATIONS &bull; ARTISANAL HOMEMADE CHOCOLATES</p>
            <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 26px; letter-spacing: 0.5px; color: #ffffff;">${order.moneyReceived ? 'PAYMENT RECEIVED & CONFIRMED! 💰✅' : 'ORDER CONFIRMED! 🍫✨'}</h1>
            <p style="margin: 6px 0 0 0; font-size: 13px; color: #fdf2f8;">${order.moneyReceived ? `Thank you, ${customer.name}! Your payment of ₹${total} has been verified.` : `Thank you, ${customer.name}! We're preparing your chocolates with love.`}</p>
          </div>

          <div style="padding: 24px;">
            
            <!-- Welcome Note -->
            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%); border: 1px solid #a7f3d0; padding: 16px 20px; border-radius: 14px; margin-bottom: 22px;">
              <p style="margin: 0; font-weight: bold; color: #065f46; font-size: 15px;">
                ${order.moneyReceived ? `💰 Payment Successfully Received & Verified for Order #${id}!` : `🎉 Your Order #${id} is Received in Mom's Kitchen!`}
              </p>
              <p style="margin: 6px 0 0 0; color: #047857; font-size: 13px; line-height: 1.5;">
                ${order.moneyReceived ? `Sunita Yadav has marked your payment of ₹${total} as received. Your gourmet chocolates are confirmed and prepared with extra care!` : `Sunita will contact you directly on <strong>${customer.phone}</strong> to confirm your fresh preparation and take payment (UPI or Cash).`}
              </p>
            </div>

            <!-- Delivery Summary -->
            <div style="background: #faf6f0; border: 1px solid #ebd9c8; border-radius: 14px; padding: 18px; margin-bottom: 22px;">
              <h3 style="margin: 0 0 12px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #78350f;">
                Delivery Details
              </h3>
              <table style="width: 100%; font-size: 13px; line-height: 1.8;">
                <tr>
                  <td style="width: 120px; color: #7c5c47;">Deliver To:</td>
                  <td><strong>${customer.name}</strong></td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Address:</td>
                  <td>${customer.address}${customer.landmark ? `, Near ${customer.landmark}` : ''}, ${customer.city} - ${customer.pincode}</td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Scheduled Date:</td>
                  <td><strong style="color: #b45309;">${customer.deliveryDate}</strong> (${customer.timeSlot})</td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Contact Phone:</td>
                  <td><strong>${customer.phone}</strong></td>
                </tr>
              </table>
            </div>

            <!-- Items Table -->
            <h3 style="margin: 0 0 10px 0; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #78350f;">
              Your Handcrafted Chocolates
            </h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background: #f5ebe0; text-align: left; font-size: 12px; color: #78350f; text-transform: uppercase;">
                  <th style="padding: 8px 10px; border-radius: 8px 0 0 8px;">Item</th>
                  <th style="padding: 8px 10px; text-align: center;">Qty</th>
                  <th style="padding: 8px 10px; text-align: right; border-radius: 0 8px 8px 0;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <!-- Financial Totals -->
            <div style="background: #fcf9f5; border: 1px solid #ebd9c8; border-radius: 12px; padding: 14px 18px; margin-bottom: 24px;">
              <table style="width: 100%; font-size: 13px;">
                <tr>
                  <td style="color: #7c5c47;">Subtotal:</td>
                  <td style="text-align: right; font-weight: bold; color: #2a160d;">₹${subtotal}</td>
                </tr>
                <tr>
                  <td style="color: #7c5c47;">Delivery:</td>
                  <td style="text-align: right; font-weight: bold; color: ${deliveryFee === 0 ? '#15803d' : '#2a160d'};">
                    ${deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                  </td>
                </tr>
                <tr style="border-top: 1px solid #ebd9c8;">
                  <td style="padding-top: 8px; font-size: 15px; font-weight: bold; color: #78350f;">Total Amount to Pay:</td>
                  <td style="padding-top: 8px; text-align: right; font-size: 18px; font-weight: bold; color: #e11d48;">₹${total}</td>
                </tr>
              </table>
            </div>

            <!-- Direct Contact Links -->
            <div style="background: #fff8f0; border: 1px solid #fde68a; border-radius: 14px; padding: 16px; text-align: center;">
              <p style="margin: 0 0 10px 0; font-size: 13px; font-weight: bold; color: #92400e;">
                Questions or Custom Ribbon Requests?
              </p>
              <div style="display: flex; justify-content: center; gap: 10px; flex-wrap: wrap;">
                <a href="https://wa.me/919971921200?text=Hello%20Sunita%20Aunty,%20this%20is%20${encodeURIComponent(customer.name)}%20regarding%20my%20order%20%23${encodeURIComponent(id)}!" 
                   style="display: inline-block; background: #25D366; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 20px; font-size: 13px; font-weight: bold;">
                  💬 WhatsApp Sunita (${SELLER_PHONE})
                </a>
                <a href="tel:${SELLER_PHONE.replace(/[^0-9+]/g, '')}" 
                   style="display: inline-block; background: #78350f; color: #ffffff; text-decoration: none; padding: 9px 18px; border-radius: 20px; font-size: 13px; font-weight: bold;">
                  📞 Call Kitchen (${SELLER_PHONE})
                </a>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div style="background: #2a160d; padding: 18px; text-align: center; color: #f5ebe0; font-size: 12px;">
            <p style="margin: 0; font-weight: 500;">Adrit Creations &bull; Handcrafted Gourmet Chocolates</p>
            <p style="margin: 4px 0 0 0; color: #fde68a;">Crafted with love by Sunita Yadav &bull; <a href="mailto:${SELLER_EMAIL}" style="color: #fde68a; text-decoration: underline;">${SELLER_EMAIL}</a></p>
          </div>

        </div>
      </body>
      </html>
    `;
  }
}

/**
 * Sends order email directly via Gmail API to a specified recipient
 */
export async function sendOrderViaGmail(
  order: Order,
  accessToken: string,
  recipientEmail: string = SELLER_EMAIL,
  isForSeller: boolean = true,
  senderEmail?: string
): Promise<SendEmailResult> {
  try {
    const subject = isForSeller
      ? `🍫 [NEW ORDER] #${order.id} from ${order.customer.name} (₹${order.total}) - Contact to Collect Payment`
      : order.moneyReceived
      ? `💰 Payment Received & Confirmed! #${order.id} - Adrit Creations Handcrafted Chocolates`
      : `🍫 Order Confirmed! #${order.id} - Adrit Creations Handcrafted Chocolates`;

    const bodyHtml = buildOrderEmailHtml(order, isForSeller);
    const rawEncoded = encodeRawEmail(recipientEmail, subject, bodyHtml, senderEmail);

    const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        raw: rawEncoded,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gmail send API error:', response.status, errText);
      return {
        success: false,
        error: `Gmail API Error (${response.status}): ${errText}`,
      };
    }

    const data = await response.json();
    return {
      success: true,
      messageId: data.id,
    };
  } catch (error: any) {
    console.error('Failed to send email via Gmail:', error);
    return {
      success: false,
      error: error.message || 'Unknown network error while sending via Gmail',
    };
  }
}

/**
 * Sends order notification to Sunita (seller) AND sends confirmation to buyer through Gmail!
 */
export async function sendDualOrderEmails(
  order: Order,
  accessToken: string,
  authenticatedSenderEmail?: string
): Promise<DualEmailResult> {
  let sellerSuccess = false;
  let buyerSuccess = false;
  let sellerMessageId: string | undefined;
  let buyerMessageId: string | undefined;
  let sellerError: string | undefined;
  let buyerError: string | undefined;

  // 1. Send notification to Sunita (seller)
  try {
    const sellerRes = await sendOrderViaGmail(order, accessToken, SELLER_EMAIL, true, authenticatedSenderEmail);
    if (sellerRes.success) {
      sellerSuccess = true;
      sellerMessageId = sellerRes.messageId;
    } else {
      sellerError = sellerRes.error;
    }
  } catch (err: any) {
    sellerError = err.message;
  }

  // 2. If buyer provided an email address, send confirmation to buyer
  if (order.customer.email && order.customer.email.trim() && order.customer.email.includes('@')) {
    try {
      const buyerRes = await sendOrderViaGmail(order, accessToken, order.customer.email.trim(), false, authenticatedSenderEmail);
      if (buyerRes.success) {
        buyerSuccess = true;
        buyerMessageId = buyerRes.messageId;
      } else {
        buyerError = buyerRes.error;
      }
    } catch (err: any) {
      buyerError = err.message;
    }
  }

  return {
    sellerSuccess,
    buyerSuccess,
    sellerMessageId,
    buyerMessageId,
    sellerError,
    buyerError,
  };
}

/**
 * Generates direct Web Gmail Compose URL (opens Gmail with recipient, subject, body pre-filled)
 */
export function generateGmailWebUrl(order: Order, recipientEmail: string = SELLER_EMAIL): string {
  const subject = `[Adrit Creations Order #${order.id}] ${order.customer.name} (₹${order.total})`;
  const itemsText = order.items
    .map((i) => `• ${i.chocolate.name} (${i.selectedBox.label}) x ${i.quantity} = ₹${i.selectedBox.price * i.quantity}`)
    .join('\n');
  const body = 
    `Hello Sunita,\n\n` +
    `I have placed an order for Adrit Creations homemade chocolates!\n\n` +
    `Order ID: #${order.id}\n` +
    `Customer: ${order.customer.name}\n` +
    `Phone: ${order.customer.phone}\n` +
    `Email: ${order.customer.email || 'N/A'}\n` +
    `Delivery Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}\n` +
    `Scheduled Date: ${order.customer.deliveryDate} (${order.customer.timeSlot})\n\n` +
    `Items:\n${itemsText}\n\n` +
    `Subtotal: ₹${order.subtotal}\n` +
    `Delivery Fee: ${order.deliveryFee === 0 ? 'FREE' : `₹${order.deliveryFee}`}\n` +
    `Total Amount to Collect: ₹${order.total}\n\n` +
    `Please confirm preparation and contact me via Phone / WhatsApp (${order.customer.phone}) to take payment.\n\n` +
    `Thank you,\n${order.customer.name}`;

  return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Generates a pre-filled mailto link for seller
 */
export function generateMailtoUrl(order: Order, recipientEmail: string = SELLER_EMAIL): string {
  const subject = encodeURIComponent(`[Adrit Creations Order #${order.id}] ${order.customer.name} (₹${order.total})`);
  const body = encodeURIComponent(
    `Hello Sunita,\n\n` +
      `Here is my order for Adrit Creations chocolates:\n\n` +
      `Order ID: #${order.id}\n` +
      `Customer: ${order.customer.name}\n` +
      `Phone: ${order.customer.phone}\n` +
      `Email: ${order.customer.email || 'N/A'}\n` +
      `Delivery Address: ${order.customer.address}, ${order.customer.city} - ${order.customer.pincode}\n` +
      `Scheduled Date: ${order.customer.deliveryDate} (${order.customer.timeSlot})\n\n` +
      `Items:\n` +
      order.items.map((i) => `- ${i.chocolate.name} (${i.selectedBox.label}) x ${i.quantity} = ₹${i.selectedBox.price * i.quantity}`).join('\n') +
      `\n\nTotal to Pay: ₹${order.total}\n` +
      `Please contact me to take payment and confirm delivery.`
  );
  return `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
}

/**
 * Generates WhatsApp URL
 */
export function generateWhatsAppUrl(order: Order, phone: string = '919971921200'): string {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const text = encodeURIComponent(
    `Hello Sunita Aunty! 🍫\n\n` +
      `I placed an order on Adrit Creations:\n` +
      `Order ID: #${order.id}\n` +
      `Name: ${order.customer.name}\n` +
      `Phone: ${order.customer.phone}\n` +
      `Address: ${order.customer.address}, ${order.customer.city} (${order.customer.pincode})\n\n` +
      `Items:\n` +
      order.items.map((i) => `• ${i.chocolate.name} (${i.selectedBox.label}) x ${i.quantity}`).join('\n') +
      `\n\nTotal: ₹${order.total}\n` +
      `Please let me know how to pay (UPI / Cash). Thank you!`
  );
  return `https://wa.me/${cleanPhone}?text=${text}`;
}
