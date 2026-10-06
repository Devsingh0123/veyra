import prisma from '../prisma.js';
import { fsmService } from './fsm.service.js';

/**
 * Carrier Adapter Interface
 */
class MockLogisticsAdapter {
  constructor(name = 'MOCK') {
    this.name = name;
  }

  async generateAwb({ orderId, billableWeightG, destinationPincode }) {
    const awbNumber = `AWB-VYR-${Date.now().toString().slice(-8)}-${Math.floor(100 + Math.random() * 900)}`;
    return {
      carrier: this.name,
      awbNumber,
      labelUrl: `https://labels.veyra.in/pdf/${awbNumber}.pdf`,
      manifestUrl: `https://manifests.veyra.in/manifest_${orderId.slice(0, 8)}.pdf`
    };
  }
}

export const logisticsService = {
  getAdapter(carrierName = 'MOCK') {
    // In future, dynamically return new DelhiveryAdapter() or ShiprocketAdapter()
    return new MockLogisticsAdapter(carrierName.toUpperCase());
  },

  /**
   * Calculate Billable Weight (Indian Logistics standard: volumetric divisor 5000)
   * Weight returned in grams
   */
  calculateBillableWeight(deadWeightGrams, lengthCm = 0, widthCm = 0, heightCm = 0) {
    const deadWeight = parseInt(deadWeightGrams || 500, 10);
    const volumetricKg = (parseFloat(lengthCm || 0) * parseFloat(widthCm || 0) * parseFloat(heightCm || 0)) / 5000;
    const volumetricGrams = Math.round(volumetricKg * 1000);

    return Math.max(deadWeight, volumetricGrams);
  },

  /**
   * Check if E-Way bill is legally required (Interstate > ₹50,000)
   */
  isEwayBillMandatory(order) {
    const totalAmount = parseFloat(order.totalAmount.toString());
    const isInterstate = parseFloat(order.igstAmount.toString()) > 0;
    return isInterstate && totalAmount >= 50000;
  },

  /**
   * Dispatch and create shipment for confirmed order
   */
  async createShipment({
    orderId,
    carrier = 'MOCK',
    deadWeightGrams = 500,
    lengthCm = 20,
    widthCm = 15,
    heightCm = 10
  }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shipment: true }
    });

    if (!order) throw new Error('Order not found');
    if (order.shipment) return order.shipment;

    // Check if order is eligible for packing
    if (order.status !== 'CONFIRMED' && order.status !== 'PROCESSING') {
      throw new Error(`Cannot ship order in "${order.status}" status`);
    }

    const billableWeightG = this.calculateBillableWeight(deadWeightGrams, lengthCm, widthCm, heightCm);
    const isEwayReq = this.isEwayBillMandatory(order);
    const ewayBillNumber = isEwayReq ? `EWB-${Date.now().toString().slice(-10)}` : null;

    const shipAddr = order.shippingAddress || {};
    const adapter = this.getAdapter(carrier);
    const carrierResult = await adapter.generateAwb({
      orderId,
      billableWeightG,
      destinationPincode: shipAddr.pincode
    });

    const initialCheckpoint = {
      status: 'MANIFESTED',
      location: 'Gurugram Hub, HR',
      timestamp: new Date().toISOString(),
      notes: 'Shipment label created and manifested'
    };

    return await prisma.$transaction(async (tx) => {
      // 1. Create Shipment record
      const shipment = await tx.shipment.create({
        data: {
          orderId,
          carrier: carrierResult.carrier,
          awbNumber: carrierResult.awbNumber,
          labelUrl: carrierResult.labelUrl,
          manifestUrl: carrierResult.manifestUrl,
          billableWeightG,
          ewayBillNumber,
          currentStatus: 'MANIFESTED',
          trackingHistory: [initialCheckpoint],
          dispatchedAt: new Date()
        }
      });

      // 2. Advance Order status to PACKED then SHIPPED
      fsmService.validateTransition(order.status, 'PACKED');
      fsmService.validateTransition('PACKED', 'SHIPPED');

      await tx.order.update({
        where: { id: orderId },
        data: { status: 'SHIPPED' }
      });

      await tx.orderHistory.create({
        data: {
          orderId,
          fromState: order.status,
          toState: 'SHIPPED',
          actorRole: 'LOGISTICS',
          note: `Dispatched via ${carrierResult.carrier} (AWB: ${carrierResult.awbNumber})`
        }
      });

      return shipment;
    });
  },

  /**
   * Real-time tracking webhook ingestion
   */
  async handleTrackingWebhook({ awbNumber, status, location = '', notes = '' }) {
    const shipment = await prisma.shipment.findUnique({
      where: { awbNumber },
      include: { order: true }
    });

    if (!shipment) {
      throw new Error(`Shipment with AWB ${awbNumber} not found`);
    }

    const newCheckpoint = {
      status,
      location,
      timestamp: new Date().toISOString(),
      notes
    };

    const currentHistory = Array.isArray(shipment.trackingHistory) ? shipment.trackingHistory : [];
    const updatedHistory = [...currentHistory, newCheckpoint];

    let targetOrderStatus = null;
    const normalizedStatus = status.toUpperCase();

    if (normalizedStatus.includes('DELIVERED')) {
      targetOrderStatus = 'DELIVERED';
    } else if (normalizedStatus.includes('OUT_FOR_DELIVERY') || normalizedStatus.includes('OUT FOR DELIVERY')) {
      targetOrderStatus = 'OUT_FOR_DELIVERY';
    } else if (normalizedStatus.includes('RTO') || normalizedStatus.includes('RETURN')) {
      targetOrderStatus = 'RTO_INITIATED';
    }

    await prisma.$transaction(async (tx) => {
      const updateData = {
        currentStatus: normalizedStatus,
        trackingHistory: updatedHistory
      };

      if (targetOrderStatus === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }

      await tx.shipment.update({
        where: { id: shipment.id },
        data: updateData
      });

      // Advance order FSM if applicable
      if (targetOrderStatus && targetOrderStatus !== shipment.order.status) {
        if (fsmService.canTransition(shipment.order.status, targetOrderStatus)) {
          const orderUpdateData = { status: targetOrderStatus };
          if (targetOrderStatus === 'DELIVERED' && shipment.order.paymentMethod === 'COD') {
            orderUpdateData.paymentStatus = 'PAID';
          }

          await tx.order.update({
            where: { id: shipment.orderId },
            data: orderUpdateData
          });

          await tx.orderHistory.create({
            data: {
              orderId: shipment.orderId,
              fromState: shipment.order.status,
              toState: targetOrderStatus,
              actorRole: 'CARRIER_WEBHOOK',
              note: `Carrier reported: ${notes || normalizedStatus} (${location})`
            }
          });
        }
      }
    });

    return { success: true, awbNumber, status: normalizedStatus };
  },

  /**
   * Get shipment by order ID
   */
  async getShipmentByOrderId(orderId) {
    const shipment = await prisma.shipment.findUnique({
      where: { orderId }
    });

    if (!shipment) {
      throw new Error('Shipment record not found for this order');
    }

    return shipment;
  }
};
