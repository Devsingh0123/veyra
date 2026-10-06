import { inventoryService } from '../services/inventory.service.js';

export const inventoryController = {
  async getStock(req, res) {
    try {
      const stock = await inventoryService.getStock(req.params.variantId);
      return res.status(200).json({ success: true, data: stock });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  async reserve(req, res) {
    try {
      const { variantId, quantity, reservationToken } = req.body;
      if (!variantId || !quantity || !reservationToken) {
        return res.status(400).json({ success: false, error: 'variantId, quantity, and reservationToken are required' });
      }

      const reservation = await inventoryService.reserveStock({ variantId, quantity, reservationToken });
      return res.status(201).json({ success: true, message: 'Stock reserved', data: reservation });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  async release(req, res) {
    try {
      const { reservationToken } = req.body;
      if (!reservationToken) {
        return res.status(400).json({ success: false, error: 'reservationToken is required' });
      }

      const result = await inventoryService.releaseStock(reservationToken);
      return res.status(200).json({ success: true, message: 'Reservation released', data: result });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  },

  async fulfill(req, res) {
    try {
      const { reservationToken } = req.body;
      if (!reservationToken) {
        return res.status(400).json({ success: false, error: 'reservationToken is required' });
      }

      const result = await inventoryService.fulfillStock(reservationToken);
      return res.status(200).json({ success: true, message: 'Reservation fulfilled', data: result });
    } catch (err) {
      return res.status(400).json({ success: false, error: err.message });
    }
  }
};
