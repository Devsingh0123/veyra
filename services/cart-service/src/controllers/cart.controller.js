import { cartService } from '../services/cart.service.js';

export const cartController = {
  async getCart(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.query.userId;
      const sessionId = req.headers['x-session-id'] || req.query.sessionId;

      if (userId) {
        const cart = await cartService.getUserCart(userId);
        return res.status(200).json({ success: true, data: cart });
      }

      if (sessionId) {
        const cart = await cartService.getGuestCart(sessionId);
        return res.status(200).json({ success: true, data: cart });
      }

      return res.status(400).json({ success: false, error: 'Provide x-user-id or x-session-id header' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async addItem(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const sessionId = req.headers['x-session-id'] || req.body.sessionId;
      const { variantId, quantity = 1 } = req.body;

      if (!variantId) {
        return res.status(400).json({ success: false, error: 'variantId is required' });
      }

      if (userId) {
        const cart = await cartService.addToUserCart(userId, { variantId, quantity: parseInt(quantity, 10) || 1 });
        return res.status(200).json({ success: true, message: 'Item added to cart', data: cart });
      }

      if (sessionId) {
        const cart = await cartService.addToGuestCart(sessionId, { variantId, quantity: parseInt(quantity, 10) || 1 });
        return res.status(200).json({ success: true, message: 'Item added to guest bag', data: cart });
      }

      return res.status(400).json({ success: false, error: 'Provide x-user-id or x-session-id' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async updateItem(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const sessionId = req.headers['x-session-id'] || req.body.sessionId;
      const { variantId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined) {
        return res.status(400).json({ success: false, error: 'quantity is required' });
      }

      const qty = parseInt(quantity, 10);

      if (userId) {
        const cart = await cartService.updateUserCart(userId, variantId, qty);
        return res.status(200).json({ success: true, message: 'Cart updated', data: cart });
      }

      if (sessionId) {
        const cart = await cartService.updateGuestCart(sessionId, variantId, qty);
        return res.status(200).json({ success: true, message: 'Bag updated', data: cart });
      }

      return res.status(400).json({ success: false, error: 'Provide x-user-id or x-session-id' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async removeItem(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.query.userId;
      const sessionId = req.headers['x-session-id'] || req.query.sessionId;
      const { variantId } = req.params;

      if (userId) {
        const cart = await cartService.removeFromUserCart(userId, variantId);
        return res.status(200).json({ success: true, message: 'Item removed', data: cart });
      }

      if (sessionId) {
        const cart = await cartService.removeFromGuestCart(sessionId, variantId);
        return res.status(200).json({ success: true, message: 'Item removed', data: cart });
      }

      return res.status(400).json({ success: false, error: 'Provide x-user-id or x-session-id' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async merge(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const { sessionId } = req.body;

      if (!userId || !sessionId) {
        return res.status(400).json({ success: false, error: 'userId and sessionId are required to merge carts' });
      }

      const cart = await cartService.mergeCarts(userId, sessionId);
      return res.status(200).json({ success: true, message: 'Carts merged successfully', data: cart });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async clear(req, res) {
    try {
      const userId = req.headers['x-user-id'] || req.body.userId;
      const sessionId = req.headers['x-session-id'] || req.body.sessionId;

      if (userId) {
        await cartService.clearUserCart(userId);
      } else if (sessionId) {
        await cartService.clearGuestCart(sessionId);
      }

      return res.status(200).json({ success: true, message: 'Cart cleared' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  }
};
