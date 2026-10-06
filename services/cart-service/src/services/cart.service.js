import redis from '../redis.js';
import prisma from '../prisma.js';

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
  // USER CART (Prisma ORM)
  // ==========================================
  async getUserCart(userId) {
    let cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: true }
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId },
        include: { items: true }
      });
    }

    return cart;
  },

  async addToUserCart(userId, { variantId, quantity = 1 }) {
    let cart = await this.getUserCart(userId);

    const existingItem = cart.items.find(i => i.variantId === variantId);

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          variantId,
          quantity
        }
      });
    }

    return await this.getUserCart(userId);
  },

  async updateUserCart(userId, variantId, quantity) {
    const cart = await this.getUserCart(userId);
    const item = cart.items.find(i => i.variantId === variantId);

    if (!item) return cart;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity }
      });
    }

    return await this.getUserCart(userId);
  },

  async removeFromUserCart(userId, variantId) {
    const cart = await this.getUserCart(userId);
    const item = cart.items.find(i => i.variantId === variantId);

    if (item) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    }

    return await this.getUserCart(userId);
  },

  async clearUserCart(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
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
