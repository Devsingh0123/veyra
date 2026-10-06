import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import prisma from '../prisma.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_min_32_characters_long_12345';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    JWT_ACCESS_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN }
  );
}

function generateRefreshTokenPair() {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const familyId = crypto.randomUUID();
  return { rawToken, tokenHash, familyId };
}

function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export const authService = {
  async register({ email, password, fullName, phone }) {
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedEmail },
          ...(phone ? [{ phone }] : [])
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        throw new Error('Email already registered');
      }
      throw new Error('Phone number already registered');
    }

    const passwordHash = await argon2.hash(password);

    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        fullName: fullName.trim(),
        phone: phone || null,
        passwordHash,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    const accessToken = generateAccessToken(user);
    const { rawToken, tokenHash, familyId } = generateRefreshTokenPair();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return { user, accessToken, refreshToken: rawToken };
  },

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    });

    if (!user || !user.passwordHash) {
      throw new Error('Invalid email or password');
    }

    if (!user.isActive) {
      throw new Error('Account has been deactivated');
    }

    const isValid = await argon2.verify(user.passwordHash, password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const safeUser = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt
    };

    const accessToken = generateAccessToken(safeUser);
    const { rawToken, tokenHash, familyId } = generateRefreshTokenPair();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { user: safeUser, accessToken, refreshToken: rawToken };
  },

  async googleLogin({ idToken }) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID
      });
      payload = ticket.getPayload();
    } catch {
      throw new Error('Invalid Google token');
    }

    if (!payload?.email) {
      throw new Error('Google token missing email');
    }

    const email = payload.email.toLowerCase().trim();

    const user = await prisma.user.upsert({
      where: { email },
      update: {
        googleId: payload.sub,
        isVerified: true
      },
      create: {
        email,
        fullName: payload.name || 'Google User',
        googleId: payload.sub,
        isVerified: true,
        role: 'CUSTOMER'
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    const accessToken = generateAccessToken(user);
    const { rawToken, tokenHash, familyId } = generateRefreshTokenPair();

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return { user, accessToken, refreshToken: rawToken };
  },

  async refreshToken(rawToken) {
    if (!rawToken) {
      throw new Error('Refresh token required');
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true }
    });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Replay attack prevention: if token already revoked, revoke whole family
    if (tokenRecord.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { isRevoked: true }
      });
      throw new Error('Token reuse detected. Session invalidated.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('Refresh token expired');
    }

    // Revoke old token
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true }
    });

    // Generate new token in same family
    const next = generateRefreshTokenPair();
    await prisma.refreshToken.create({
      data: {
        userId: tokenRecord.userId,
        tokenHash: next.tokenHash,
        familyId: tokenRecord.familyId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const newAccessToken = generateAccessToken(tokenRecord.user);

    return {
      accessToken: newAccessToken,
      refreshToken: next.rawToken
    };
  },

  async logout(rawToken) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash }
    });
    if (tokenRecord) {
      await prisma.refreshToken.updateMany({
        where: { familyId: tokenRecord.familyId },
        data: { isRevoked: true }
      });
    }
  },

  async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  async updateProfile(userId, { fullName, phone }) {
    if (phone) {
      const existing = await prisma.user.findFirst({
        where: {
          phone,
          NOT: { id: userId }
        }
      });
      if (existing) {
        throw new Error('Phone number already in use by another account');
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data: {
        ...(fullName && { fullName: fullName.trim() }),
        ...(phone !== undefined && { phone: phone || null })
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });
  }
};
