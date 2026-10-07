import redis from '../redis.js';
import Cart from '../models/Cart.model.js';

const GUEST_CART_TTL = 14 * 24 * 60 * 60; // 14 days in seconds

function guestKey(sessionId) {
  return `cart:guest:${sessionId}`;
}

export const cartService = {
  // ==========================================
  // GUEST CART (Redis)
  // ==========================================
  async getGuestCart(sessionId) {
    const raw = await redis.get(guestKey(sessionId));
    return raw ? JSON.parse(raw) : { items: [] };
  },

  async addToGuestCart(sessionId, { variantId, quantity = 1 }) {
    const cart = await this.getGuestCart(sessionId);
    const existingIndex = cart.items.findIndex(i => i.variantId === variantId);

    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ variantId, quantity });
    }

    await redis.setex(guestKey(sessionId), GUEST_CART_TTL, JSON.stringify(cart));
    return cart;
  },

  async updateGuestCart(sessionId, variantId, quantity) {
    const cart = await this.getGuestCart(sessionId);

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.variantId !== variantId);
    } else {
      const item = cart.items.find(i => i.variantId === variantId);
      if (item) item.quantity = quantity;
    }

    await redis.setex(guestKey(sessionId), GUEST_CART_TTL, JSON.stringify(cart));
    return cart;
  },

  async removeFromGuestCart(sessionId, variantId) {
    const cart = await this.getGuestCart(sessionId);
    cart.items = cart.items.filter(i => i.variantId !== variantId);
    await redis.setex(guestKey(sessionId), GUEST_CART_TTL, JSON.stringify(cart));
    return cart;
  },

  async clearGuestCart(sessionId) {
    await redis.del(guestKey(sessionId));
    return { items: [] };
  },

  // ==========================================
  // USER CART (MongoDB via Mongoose)
  // ==========================================
  async getUserCart(userId) {
    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = await Cart.create({
        userId,
        items: []
      });
    }

    return cart;
  },

  async addToUserCart(userId, { variantId, quantity = 1 }) {
    let cart = await this.getUserCart(userId);

    const existingItem = cart.items.find(i => i.variantId === variantId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        variantId,
        quantity
      });
    }

    await cart.save();
    return cart;
  },

  async updateUserCart(userId, variantId, quantity) {
    const cart = await this.getUserCart(userId);
    const item = cart.items.find(i => i.variantId === variantId || i.id === variantId);

    if (!item) return cart;

    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.variantId !== variantId && i.id !== variantId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();
    return cart;
  },

  async removeFromUserCart(userId, variantId) {
    const cart = await this.getUserCart(userId);
    cart.items = cart.items.filter(i => i.variantId !== variantId && i.id !== variantId);
    await cart.save();
    return cart;
  },

  async clearUserCart(userId) {
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } });
    return { items: [] };
  },

  // ==========================================
  // AUTO-MERGE (Guest -> User on login)
  // ==========================================
  async mergeCarts(userId, sessionId) {
    if (!sessionId) return await this.getUserCart(userId);

    const guestCart = await this.getGuestCart(sessionId);
    if (!guestCart.items || guestCart.items.length === 0) {
      return await this.getUserCart(userId);
    }

    for (const item of guestCart.items) {
      await this.addToUserCart(userId, item);
    }

    // Wipe guest cart from Redis after successful merge
    await this.clearGuestCart(sessionId);

    return await this.getUserCart(userId);
  }
};

export default cartService;
