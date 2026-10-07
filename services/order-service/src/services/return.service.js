import Order from '../models/Order.model.js';
import ReturnRequest from '../models/ReturnRequest.model.js';
import CreditNote from '../models/CreditNote.model.js';
import CreditNoteSequence from '../models/CreditNoteSequence.model.js';
import { fsmService } from './fsm.service.js';
import { invoiceService } from './invoice.service.js';

export const returnService = {
  /**
   * Check if an order is within the statutory 7-day return window
   */
  isWithinReturnWindow(order) {
    if (order.status !== 'DELIVERED') return false;

    const deliveryDate = order.shipment?.deliveredAt || order.updatedAt;
    const diffMs = Date.now() - new Date(deliveryDate).getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    return diffDays <= 7;
  },

  /**
   * Customer files a return request
   */
  async fileReturnRequest({ orderId, userId, reason, comments = '', images = [] }) {
    if (!orderId) throw new Error('orderId is required');
    if (!userId) throw new Error('userId is required');
    if (!reason) throw new Error('Return reason is required');

    const order = await Order.findById(orderId).populate('shipment').populate('returns');

    if (!order) throw new Error('Order not found');

    if (order.userId !== userId) {
      throw new Error('Unauthorized access to this order');
    }

    if (order.status !== 'DELIVERED') {
      throw new Error(`Cannot return order in "${order.status}" status. Order must be DELIVERED.`);
    }

    if (!this.isWithinReturnWindow(order)) {
      throw new Error('Return window expired: returns must be filed within 7 days of delivery.');
    }

    const activeReturn = order.returns?.find(
      r => r.status !== 'REJECTED' && r.status !== 'INSPECTED_REJECTED'
    );
    if (activeReturn) {
      throw new Error(`A return request is already active for this order (Status: ${activeReturn.status}).`);
    }

    // 1. Create Return Request
    const returnReq = await ReturnRequest.create({
      orderId,
      userId,
      reason,
      comments,
      images,
      status: 'REQUESTED',
      refundAmount: order.totalAmount
    });

    // 2. Advance Order status to RETURN_REQUESTED
    fsmService.validateTransition(order.status, 'RETURN_REQUESTED');

    const oldStatus = order.status;
    order.status = 'RETURN_REQUESTED';
    order.history.push({
      fromState: oldStatus,
      toState: 'RETURN_REQUESTED',
      actorRole: 'CUSTOMER',
      note: `Return filed by customer: ${reason}`
    });

    await order.save();
    return returnReq;
  },

  /**
   * Generate next consecutive Credit Note number (CN/26-27/000001)
   */
  async getNextCreditNoteNumber() {
    const fy = invoiceService.getFinancialYear();

    const seq = await CreditNoteSequence.findOneAndUpdate(
      { financialYear: fy },
      { $inc: { currentNumber: 1 } },
      { new: true, upsert: true }
    );

    const paddedNumber = String(seq.currentNumber).padStart(6, '0');
    return {
      creditNoteNumber: `CN/${fy}/${paddedNumber}`,
      financialYear: fy
    };
  },

  /**
   * Advance return request through warehouse QC inspection & trigger refund
   */
  async updateReturnStatus(returnId, nextStatus, { adminNote = '', actorRole = 'ADMIN' } = {}) {
    const returnReq = await ReturnRequest.findById(returnId).populate('creditNote');

    if (!returnReq) throw new Error('Return request not found');

    const order = await Order.findById(returnReq.orderId).populate('invoice');
    if (!order) throw new Error('Order not found');

    let creditNote = returnReq.creditNote;

    // 1. If inspection passed or refunded, generate Statutory GST Credit Note
    if ((nextStatus === 'INSPECTED_PASSED' || nextStatus === 'REFUNDED') && !creditNote) {
      const { creditNoteNumber } = await this.getNextCreditNoteNumber();
      const originalInvoiceNo = order.invoice?.invoiceNumber || `INV-REF-${order.orderNumber}`;

      creditNote = await CreditNote.create({
        returnRequestId: returnId,
        creditNoteNumber,
        originalInvoiceNo,
        totalRefundGst: order.taxAmount,
        totalRefundValue: order.totalAmount
      });
    }

    // 2. Update Return Request record
    returnReq.status = nextStatus;
    if (adminNote) returnReq.adminNote = adminNote;
    await returnReq.save();

    // 3. Sync Order FSM state
    if (nextStatus === 'RECEIVED_AT_WAREHOUSE') {
      if (fsmService.canTransition(order.status, 'RETURN_RECEIVED')) {
        const oldState = order.status;
        order.status = 'RETURN_RECEIVED';
        order.history.push({
          fromState: oldState,
          toState: 'RETURN_RECEIVED',
          actorRole,
          note: adminNote || 'Package received at warehouse inspection hub'
        });
        await order.save();
      }
    } else if (nextStatus === 'INSPECTED_REJECTED') {
      // Return item rejected, revert order to DELIVERED
      const oldState = order.status;
      order.status = 'DELIVERED';
      order.history.push({
        fromState: oldState,
        toState: 'DELIVERED',
        actorRole,
        note: `Return rejected during QC inspection: ${adminNote}`
      });
      await order.save();
    } else if (nextStatus === 'REFUNDED') {
      // Full refund issued
      if (fsmService.canTransition(order.status, 'REFUNDED')) {
        const oldState = order.status;
        order.status = 'REFUNDED';
        order.paymentStatus = 'REFUNDED';
        order.history.push({
          fromState: oldState,
          toState: 'REFUNDED',
          actorRole,
          note: `Full refund approved. GST Credit Note issued: ${creditNote?.creditNoteNumber || 'N/A'}`
        });
        await order.save();
      }
    }

    const updated = await ReturnRequest.findById(returnId).populate('creditNote');
    return updated;
  },

  /**
   * Render Section 34 CGST Compliant HTML Credit Note
   */
  async renderCreditNoteHtml(returnId) {
    const returnReq = await ReturnRequest.findById(returnId).populate('creditNote');

    if (!returnReq) throw new Error('Return request not found');

    let creditNote = returnReq.creditNote;
    if (!creditNote) {
      creditNote = await this.getNextCreditNoteNumber();
    }

    const order = await Order.findById(returnReq.orderId).populate('invoice');
    if (!order) throw new Error('Order not found');

    const invoiceNo = order.invoice?.invoiceNumber || 'INV-ORIGINAL';
    const shipAddr = order.shippingAddress || {};

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Credit Note - ${creditNote.creditNoteNumber}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; margin: 40px; color: #111; font-size: 13px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #b91c1c; padding-bottom: 15px; margin-bottom: 20px; }
          .title { font-size: 22px; font-weight: bold; text-transform: uppercase; }
          .party-box { border: 1px solid #eee; padding: 14px; border-radius: 6px; background: #fafafa; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #fee2e2; border: 1px solid #ddd; padding: 8px; font-weight: 600; text-align: left; }
          td { border: 1px solid #ddd; padding: 8px; }
          .footer { margin-top: 40px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title" style="color: #b91c1c;">VEYRA RETAIL PRIVATE LIMITED</div>
            <div>Registered Warehouse: Sector 18, Udyog Vihar, Gurugram, HR - 122015</div>
            <div><strong>GSTIN:</strong> 07AABCV1234F1Z5 | State Code: 06</div>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; color: #b91c1c;">CREDIT NOTE</h2>
            <div style="font-size: 15px; font-weight: bold; margin-top: 4px;">${creditNote.creditNoteNumber}</div>
            <div>Date: ${new Date().toLocaleDateString('en-IN')}</div>
            <div>Original Tax Invoice: <strong>${invoiceNo}</strong></div>
          </div>
        </div>

        <div class="party-box">
          <h4 style="margin: 0 0 6px 0; text-transform: uppercase; color: #4b5563;">Issued To Customer:</h4>
          <strong>${shipAddr.fullName || shipAddr.name || 'Customer'}</strong><br/>
          Order Number: #${order.orderNumber}<br/>
          Reason for Return: <em>${returnReq.reason}</em> (${returnReq.comments || 'No extra notes'})
        </div>

        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align: right;">Adjusted Taxable Value</th>
              <th style="text-align: right;">GST Reversal</th>
              <th style="text-align: right;">Total Credit Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Goods Returned and Restocked under Section 34 of CGST Act, 2017</td>
              <td style="text-align: right;">-₹${(parseFloat(order.totalAmount.toString()) - parseFloat(order.taxAmount.toString())).toFixed(2)}</td>
              <td style="text-align: right;">-₹${order.taxAmount}</td>
              <td style="text-align: right; font-weight: bold; color: #b91c1c;">-₹${order.totalAmount}</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>This Credit Note is computer-generated and issued in accordance with Section 34 of the CGST Act, 2017.</div>
        </div>
      </body>
      </html>
    `;
  },

  /**
   * Get single return request
   */
  async getReturnById(returnId) {
    const returnReq = await ReturnRequest.findById(returnId).populate('creditNote');

    if (!returnReq) throw new Error('Return request not found');

    const order = await Order.findById(returnReq.orderId).populate('invoice');
    const result = returnReq.toJSON();
    result.order = order;
    return result;
  },

  /**
   * List return requests
   */
  async listReturns({ userId = null, page = 1, limit = 10, status = null }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const query = {};
    if (userId) query.userId = userId;
    if (status) query.status = status;

    const [total, returnsDocs] = await Promise.all([
      ReturnRequest.countDocuments(query),
      ReturnRequest.find(query)
        .skip(skip)
        .limit(limitNum)
        .sort({ createdAt: -1 })
        .populate('creditNote')
    ]);

    const returns = [];
    for (const r of returnsDocs) {
      const order = await Order.findById(r.orderId).select('orderNumber totalAmount status');
      const rObj = r.toJSON();
      rObj.order = order ? { orderNumber: order.orderNumber, totalAmount: order.totalAmount, status: order.status } : null;
      returns.push(rObj);
    }

    return {
      returns,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }
};

export default returnService;
