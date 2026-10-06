/**
 * Responsive Veyra Branded HTML Email Templates
 */

export const templateService = {
  renderOrderConfirmation({ orderNumber, totalAmount, customerName = 'Customer', items = [] }) {
    const itemsListHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <strong>${item.productTitle || item.name}</strong><br/>
            <span style="font-size: 13px; color: #666;">Qty: ${item.quantity} × ₹${item.unitPrice}</span>
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #f0f0f0; text-align: right; font-weight: bold;">
            ₹${item.totalPrice || item.quantity * item.unitPrice}
          </td>
        </tr>`
      )
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Order Confirmed - Veyra</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 24px;">
        <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <div style="background: #111827; padding: 28px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px; letter-spacing: 1px;">VEYRA</h1>
            <p style="color: #9ca3af; margin: 6px 0 0 0; font-size: 14px;">Your Order is Confirmed!</p>
          </div>
          <div style="padding: 28px;">
            <p style="font-size: 16px; color: #374151; margin-top: 0;">Hi ${customerName},</p>
            <p style="font-size: 15px; color: #4b5563; line-height: 1.5;">
              Thank you for shopping with Veyra. We have received your order <strong>#${orderNumber}</strong> and our team is preparing it for dispatch.
            </p>
            
            <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
              <thead>
                <tr>
                  <th style="text-align: left; font-size: 13px; color: #9ca3af; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Items</th>
                  <th style="text-align: right; font-size: 13px; color: #9ca3af; text-transform: uppercase; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsListHtml}
              </tbody>
            </table>

            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: right; margin-bottom: 24px;">
              <span style="font-size: 15px; color: #6b7280;">Total Paid: </span>
              <strong style="font-size: 20px; color: #111827;">₹${totalAmount}</strong>
            </div>

            <p style="font-size: 14px; color: #6b7280; text-align: center; margin-bottom: 0;">
              Need help? Reach us at <a href="mailto:support@veyra.in" style="color: #2563eb; text-decoration: none;">support@veyra.in</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  },

  renderOtpEmail({ otp, purpose = 'Verification' }) {
    return `
      <!DOCTYPE html>
      <html>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7f9fa; padding: 24px;">
        <div style="max-width: 480px; margin: 0 auto; background: #fff; padding: 32px; border-radius: 12px; text-align: center;">
          <h2 style="color: #111827; margin: 0;">Veyra Security</h2>
          <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">One-Time Password for ${purpose}</p>
          <div style="margin: 28px 0; background: #f3f4f6; padding: 18px; border-radius: 8px; letter-spacing: 6px; font-size: 32px; font-weight: bold; color: #111827;">
            ${otp}
          </div>
          <p style="font-size: 13px; color: #9ca3af; margin: 0;">This OTP is valid for 10 minutes. Please do not share this with anyone.</p>
        </div>
      </body>
      </html>
    `;
  }
};
