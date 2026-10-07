import Inventory from '../models/Inventory.model.js';
import InventoryReservation from '../models/InventoryReservation.model.js';

export const inventoryService = {
  async getStock(variantId) {
    const inv = await Inventory.findOne({ variantId });
    if (!inv) throw new Error('Inventory not found');
    return {
      variantId,
      stockQuantity: inv.stockQuantity,
      reservedQuantity: inv.reservedQuantity,
      availableQuantity: Math.max(0, inv.stockQuantity - inv.reservedQuantity)
    };
  },

  async reserveStock({ variantId, quantity, reservationToken }) {
    const qty = parseInt(quantity, 10);
    if (!qty || qty <= 0) throw new Error('Invalid quantity');

    const inv = await Inventory.findOne({ variantId });
    if (!inv) throw new Error('Inventory not found');

    const available = inv.stockQuantity - inv.reservedQuantity;
    if (available < qty) throw new Error('Insufficient stock available');

    // Atomic versioned conditional update
    const updated = await Inventory.findOneAndUpdate(
      {
        variantId,
        version: inv.version,
        $expr: { $gte: [{ $subtract: ['$stockQuantity', '$reservedQuantity'] }, qty] }
      },
      {
        $inc: { reservedQuantity: qty, version: 1 }
      },
      { new: true }
    );

    if (!updated) throw new Error('Stock update conflict, please retry');

    return await InventoryReservation.create({
      reservationToken,
      variantId,
      quantity: qty,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
    });
  },

  async releaseStock(reservationToken) {
    const reservation = await InventoryReservation.findOne({ reservationToken });
    if (!reservation || reservation.status !== 'ACTIVE') return null;

    await Inventory.findOneAndUpdate(
      { variantId: reservation.variantId },
      {
        $inc: { reservedQuantity: -reservation.quantity, version: 1 }
      }
    );

    reservation.status = 'RELEASED';
    await reservation.save();
    return reservation;
  },

  async fulfillStock(reservationToken) {
    const reservation = await InventoryReservation.findOne({ reservationToken });
    if (!reservation || reservation.status !== 'ACTIVE') return null;

    await Inventory.findOneAndUpdate(
      { variantId: reservation.variantId },
      {
        $inc: {
          stockQuantity: -reservation.quantity,
          reservedQuantity: -reservation.quantity,
          version: 1
        }
      }
    );

    reservation.status = 'FULFILLED';
    await reservation.save();
    return reservation;
  }
};

export default inventoryService;
