import { orderService } from '../services/order.service.js';
import { invoiceService } from '../services/invoice.service.js';
import { logisticsService } from '../services/logistics.service.js';
import { returnService } from '../services/return.service.js';

export const orderController = {
  /**
   * POST /api/v1/orders/quote
   * Calculate live quote before placing an order
   */
  async getQuote(req, res) {
    try {
      const { items, destinationStateCode, paymentMethod, couponCode } = req.body;

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Items array is required and must not be empty' });
      }

      const quote = await orderService.getQuote({
        items,
        destinationStateCode,
        paymentMethod,
        couponCode
      });

      return res.status(200).json({ success: true, data: quote });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/orders
   * Place an order with immutable snapshots
   */
  async createOrder(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { items, shippingAddress, billingAddress, paymentMethod, couponCode } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required: userId missing' });
      }

      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'Order must contain at least one item' });
      }

      if (!shippingAddress || typeof shippingAddress !== 'object') {
        return res.status(400).json({ success: false, error: 'Valid shipping address is required' });
      }

      const order = await orderService.createOrder({
        userId,
        items,
        shippingAddress,
        billingAddress,
        paymentMethod: paymentMethod || 'PREPAID',
        couponCode
      });

      return res.status(201).json({
        success: true,
        message: 'Order created successfully',
        data: order
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders
   * List customer's orders
   */
  async getMyOrders(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.query.userId;
      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required: userId missing' });
      }

      const { page, limit, status } = req.query;
      const result = await orderService.listUserOrders(userId, { page, limit, status });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/:id
   * Get order details by ID
   */
  async getOrderById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] || req.query.userId;
      const userRole = req.headers['x-user-role'];

      const checkUserId = userRole === 'ADMIN' ? null : userId;
      const order = await orderService.getOrderById(id, checkUserId);

      return res.status(200).json({ success: true, data: order });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  /**
   * PATCH /api/v1/orders/:id/cancel
   * Cancel order
   */
  async cancelOrder(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;
      const userRole = req.headers['x-user-role'];
      const { reason = 'Cancelled by user' } = req.body;

      const checkUserId = userRole === 'ADMIN' ? null : userId;
      const cancelled = await orderService.cancelOrder(id, checkUserId, reason);

      return res.status(200).json({
        success: true,
        message: 'Order cancelled successfully',
        data: cancelled
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * PATCH /api/v1/orders/admin/:id/status
   * Advance order status (Admin / System)
   */
  async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, note } = req.body;
      const actorRole = req.headers['x-user-role'] || 'ADMIN';

      if (!status) {
        return res.status(400).json({ success: false, error: 'Next status is required' });
      }

      const updated = await orderService.updateOrderStatus(id, status, { actorRole, note });

      return res.status(200).json({
        success: true,
        message: `Order status advanced to ${status}`,
        data: updated
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/admin/all
   * List all orders across all users (Admin)
   */
  async listAllOrders(req, res) {
    try {
      const { page, limit, status, search } = req.query;
      const result = await orderService.listAllOrders({ page, limit, status, search });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/:id/invoice
   * Get or generate Tax Invoice JSON data
   */
  async getInvoice(req, res) {
    try {
      const { id } = req.params;
      const invoice = await invoiceService.generateInvoice(id);

      return res.status(200).json({ success: true, data: invoice });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/:id/invoice/html
   * View printable Section 46 CGST HTML Tax Invoice
   */
  async getInvoiceHtml(req, res) {
    try {
      const { id } = req.params;
      const html = await invoiceService.renderInvoiceHtml(id);

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/orders/admin/:id/shipment
   * Dispatch order and assign AWB (Admin)
   */
  async createShipment(req, res) {
    try {
      const { id } = req.params;
      const { carrier, deadWeightGrams, lengthCm, widthCm, heightCm } = req.body;

      const shipment = await logisticsService.createShipment({
        orderId: id,
        carrier,
        deadWeightGrams,
        lengthCm,
        widthCm,
        heightCm
      });

      return res.status(201).json({
        success: true,
        message: 'Order manifested and AWB assigned',
        data: shipment
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/:id/shipment
   * Get shipment tracking checkpoints
   */
  async getShipment(req, res) {
    try {
      const { id } = req.params;
      const shipment = await logisticsService.getShipmentByOrderId(id);

      return res.status(200).json({ success: true, data: shipment });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/orders/logistics/webhook
   * Ingest carrier tracking webhook update
   */
  async handleLogisticsWebhook(req, res) {
    try {
      const { awbNumber, status, location, notes } = req.body;

      if (!awbNumber || !status) {
        return res.status(400).json({ success: false, error: 'awbNumber and status are required' });
      }

      const result = await logisticsService.handleTrackingWebhook({
        awbNumber,
        status,
        location,
        notes
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * POST /api/v1/orders/:id/return
   * Customer files a return request (7-day window)
   */
  async fileReturn(req, res) {
    try {
      const { id } = req.params;
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { reason, comments, images } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, error: 'Authentication required: userId missing' });
      }

      const returnRequest = await returnService.fileReturnRequest({
        orderId: id,
        userId,
        reason,
        comments,
        images
      });

      return res.status(201).json({
        success: true,
        message: 'Return request filed successfully',
        data: returnRequest
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/returns
   * List return requests (Customer or Admin)
   */
  async listReturns(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.query.userId;
      const userRole = req.headers['x-user-role'];
      const { page, limit, status } = req.query;

      const checkUserId = userRole === 'ADMIN' ? null : userId;
      const result = await returnService.listReturns({
        userId: checkUserId,
        page,
        limit,
        status
      });

      return res.status(200).json({ success: true, data: result });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/returns/:returnId
   * Get return request details
   */
  async getReturnById(req, res) {
    try {
      const { returnId } = req.params;
      const returnReq = await returnService.getReturnById(returnId);

      return res.status(200).json({ success: true, data: returnReq });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  /**
   * PATCH /api/v1/orders/admin/returns/:returnId/status
   * Advance return inspection status & issue Credit Note / Refund (Admin)
   */
  async updateReturnStatus(req, res) {
    try {
      const { returnId } = req.params;
      const { status, adminNote } = req.body;
      const actorRole = req.headers['x-user-role'] || 'ADMIN';

      if (!status) {
        return res.status(400).json({ success: false, error: 'Next status is required' });
      }

      const updated = await returnService.updateReturnStatus(returnId, status, {
        adminNote,
        actorRole
      });

      return res.status(200).json({
        success: true,
        message: `Return request transitioned to ${status}`,
        data: updated
      });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  /**
   * GET /api/v1/orders/returns/:returnId/credit-note/html
   * View printable Section 34 CGST Credit Note HTML
   */
  async getCreditNoteHtml(req, res) {
    try {
      const { returnId } = req.params;
      const html = await returnService.renderCreditNoteHtml(returnId);

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
};
