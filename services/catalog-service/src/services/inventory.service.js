import prisma from '../prisma.js';

export const inventoryService = {
  async getStock(variantId) {
    const inv = await prisma.inventory.findUnique({
      where: { variantId }
    });
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

    return await prisma.$transaction(async (tx) => {
      const inv = await tx.inventory.findUnique({ where: { variantId } });
      if (!inv) throw new Error('Inventory not found');

      const available = inv.stockQuantity - inv.reservedQuantity;
      if (available < qty) throw new Error('Insufficient stock available');

      // Atomic versioned update
      const updated = await tx.inventory.updateMany({
        where: {
          variantId,
          version: inv.version,
          stockQuantity: { gte: inv.reservedQuantity + qty }
        },
        data: {
          reservedQuantity: { increment: qty },
          version: { increment: 1 }
        }
      });

      if (updated.count === 0) throw new Error('Stock update conflict, please retry');

      return await tx.inventoryReservation.create({
        data: {
          reservationToken,
          variantId,
          quantity: qty,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins
        }
      });
    });
  },

  async releaseStock(reservationToken) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { reservationToken }
      });
      if (!reservation || reservation.status !== 'ACTIVE') return null;

      await tx.inventory.update({
        where: { variantId: reservation.variantId },
        data: {
          reservedQuantity: { decrement: reservation.quantity },
          version: { increment: 1 }
        }
      });

      return await tx.inventoryReservation.update({
        where: { reservationToken },
        data: { status: 'RELEASED' }
      });
    });
  },

  async fulfillStock(reservationToken) {
    return await prisma.$transaction(async (tx) => {
      const reservation = await tx.inventoryReservation.findUnique({
        where: { reservationToken }
      });
      if (!reservation || reservation.status !== 'ACTIVE') return null;

      await tx.inventory.update({
        where: { variantId: reservation.variantId },
        data: {
          stockQuantity: { decrement: reservation.quantity },
          reservedQuantity: { decrement: reservation.quantity },
          version: { increment: 1 }
        }
      });

      return await tx.inventoryReservation.update({
        where: { reservationToken },
        data: { status: 'FULFILLED' }
      });
    });
  }
};
