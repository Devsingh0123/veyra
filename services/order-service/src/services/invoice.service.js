import Order from '../models/Order.model.js';
import TaxInvoice from '../models/TaxInvoice.model.js';
import InvoiceSequence from '../models/InvoiceSequence.model.js';

export const invoiceService = {
  /**
   * Determine Indian Financial Year (April 1 - March 31)
   * e.g., Oct 2026 -> "26-27", Jan 2027 -> "26-27"
   */
  getFinancialYear(date = new Date()) {
    const month = date.getMonth() + 1; // 1-12
    const fullYear = date.getFullYear(); // e.g. 2026
    const startYear = month >= 4 ? fullYear : fullYear - 1;
    const endYear = startYear + 1;

    const startStr = startYear.toString().slice(-2);
    const endStr = endYear.toString().slice(-2);
    return `${startStr}-${endStr}`;
  },

  /**
   * Generate next atomic consecutive invoice number per FY
   * Format: VEY/26-27/000001
   */
  async getNextInvoiceNumber() {
    const fy = this.getFinancialYear();

    const seq = await InvoiceSequence.findOneAndUpdate(
      { financialYear: fy },
      { $inc: { currentNumber: 1 } },
      { new: true, upsert: true }
    );

    const paddedNumber = String(seq.currentNumber).padStart(6, '0');
    return {
      invoiceNumber: `VEY/${fy}/${paddedNumber}`,
      financialYear: fy
    };
  },

  /**
   * Generate or retrieve Tax Invoice for an order
   */
  async generateInvoice(orderId) {
    // 1. Check existing
    const existing = await TaxInvoice.findOne({ orderId });
    if (existing) return existing;

    // 2. Fetch order
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    const sellerGstin = process.env.SELLER_GSTIN || '07AABCV1234F1Z5';

    // 3. Atomically create TaxInvoice
    const { invoiceNumber, financialYear } = await this.getNextInvoiceNumber();

    const subtotal = parseFloat(order.subtotal.toString());
    const totalTax = parseFloat(order.taxAmount.toString());
    const taxableAmount = Math.max(0, subtotal - totalTax);

    const invoice = await TaxInvoice.create({
      orderId,
      invoiceNumber,
      financialYear,
      invoiceDate: new Date(),
      taxableAmount,
      cgstAmount: order.cgstAmount,
      sgstAmount: order.sgstAmount,
      igstAmount: order.igstAmount,
      totalAmount: order.totalAmount,
      sellerGstin
    });

    return invoice;
  },

  /**
   * Render Section 46 CGST Compliant HTML Tax Invoice
   */
  async renderInvoiceHtml(orderId) {
    const order = await Order.findById(orderId).populate('invoice');

    if (!order) throw new Error('Order not found');

    let invoice = order.invoice;
    if (!invoice) {
      invoice = await this.generateInvoice(orderId);
    }

    const shipAddr = order.shippingAddress || {};
    const billAddr = order.billingAddress || shipAddr;
    const destState = shipAddr.state || 'Delhi';
    const destStateCode = shipAddr.stateCode || '07';

    const itemsRowsHtml = (order.items || [])
      .map((item, idx) => {
        const taxable = (parseFloat(item.totalPrice.toString()) - parseFloat(item.taxAmount.toString())).toFixed(2);
        return `
        <tr>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${idx + 1}</td>
          <td style="border: 1px solid #ddd; padding: 8px;">
            <strong>${item.productTitle}</strong> - ${item.variantTitle}<br/>
            <small style="color: #666;">SKU: ${item.sku}</small>
          </td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.hsnCode}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.quantity}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.unitPrice}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${taxable}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: center;">${item.taxRate}%</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">₹${item.taxAmount}</td>
          <td style="border: 1px solid #ddd; padding: 8px; text-align: right; font-weight: bold;">₹${item.totalPrice}</td>
        </tr>`;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Tax Invoice - ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 40px; color: #111; font-size: 13px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; }
          .parties { display: flex; justify-content: space-between; margin-bottom: 25px; }
          .party-box { width: 48%; border: 1px solid #eee; padding: 14px; border-radius: 6px; background: #fafafa; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #f3f4f6; border: 1px solid #ddd; padding: 8px; font-weight: 600; text-align: left; }
          .totals-table { width: 45%; margin-left: auto; margin-top: 20px; }
          .totals-table td { padding: 6px 12px; }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">VEYRA RETAIL PRIVATE LIMITED</div>
            <div>Registered Warehouse: Sector 18, Udyog Vihar, Gurugram, HR - 122015</div>
            <div><strong>GSTIN:</strong> ${invoice.sellerGstin} | State Code: 06</div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #2563eb;">TAX INVOICE</h2>
            <div style="font-size: 15px; font-weight: bold; margin-top: 4px;">${invoice.invoiceNumber}</div>
            <div>Invoice Date: ${new Date(invoice.invoiceDate).toLocaleDateString('en-IN')}</div>
            <div>Order Ref: #${order.orderNumber}</div>
          </div>
        </div>

        <div class="parties">
          <div class="party-box">
            <h4 style="margin: 0 0 8px 0; text-transform: uppercase; color: #4b5563;">Billed To:</h4>
            <strong>${billAddr.fullName || billAddr.name || 'Customer'}</strong><br/>
            ${billAddr.addressLine1 || billAddr.address || ''}<br/>
            ${billAddr.city || ''}, ${destState} - ${billAddr.pincode || ''}<br/>
            Phone: ${billAddr.phone || 'N/A'}<br/>
            Place of Supply: ${destState} (State Code: ${destStateCode})
          </div>
          <div class="party-box">
            <h4 style="margin: 0 0 8px 0; text-transform: uppercase; color: #4b5563;">Shipped To:</h4>
            <strong>${shipAddr.fullName || shipAddr.name || 'Customer'}</strong><br/>
            ${shipAddr.addressLine1 || shipAddr.address || ''}<br/>
            ${shipAddr.city || ''}, ${destState} - ${shipAddr.pincode || ''}<br/>
            Phone: ${shipAddr.phone || 'N/A'}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%; text-align: center;">#</th>
              <th style="width: 35%;">Item Description</th>
              <th style="width: 10%; text-align: center;">HSN</th>
              <th style="width: 6%; text-align: center;">Qty</th>
              <th style="width: 10%; text-align: right;">Unit Price</th>
              <th style="width: 10%; text-align: right;">Taxable</th>
              <th style="width: 8%; text-align: center;">GST%</th>
              <th style="width: 8%; text-align: right;">Tax</th>
              <th style="width: 10%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Taxable Amount:</td>
            <td style="text-align: right;">₹${invoice.taxableAmount}</td>
          </tr>
          ${parseFloat(invoice.cgstAmount.toString()) > 0 ? `
          <tr>
            <td>CGST:</td>
            <td style="text-align: right;">₹${invoice.cgstAmount}</td>
          </tr>
          <tr>
            <td>SGST:</td>
            <td style="text-align: right;">₹${invoice.sgstAmount}</td>
          </tr>` : `
          <tr>
            <td>IGST:</td>
            <td style="text-align: right;">₹${invoice.igstAmount}</td>
          </tr>`}
          <tr>
            <td>Shipping Charges:</td>
            <td style="text-align: right;">₹${order.shippingFee}</td>
          </tr>
          ${parseFloat(order.codFee.toString()) > 0 ? `
          <tr>
            <td>COD Convenience Fee:</td>
            <td style="text-align: right;">₹${order.codFee}</td>
          </tr>` : ''}
          ${parseFloat(order.discountAmount.toString()) > 0 ? `
          <tr style="color: #16a34a;">
            <td>Discount Applied:</td>
            <td style="text-align: right;">-₹${order.discountAmount}</td>
          </tr>` : ''}
          <tr style="border-top: 2px solid #111; font-size: 15px; font-weight: bold;">
            <td>Total Invoice Value:</td>
            <td style="text-align: right; color: #111;">₹${invoice.totalAmount}</td>
          </tr>
        </table>

        <div class="footer">
          <div>This is a computer-generated tax invoice compliant under Section 46 of the CGST Act, 2017. No signature required.</div>
          <div style="margin-top: 4px;">Whether tax is payable on reverse charge basis: <strong>No</strong></div>
        </div>
      </body>
      </html>
    `;
  }
};

export default invoiceService;
