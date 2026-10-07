import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.model.js';
import RefreshToken from '../models/RefreshToken.model.js';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev_jwt_access_secret_min_32_characters_long_12345';
const JWT_ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

function generateAccessToken(user) {
  return jwt.sign(
    { sub: user.id || user._id, email: user.email, role: user.role },
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

    const query = {
      $or: [
        { email: normalizedEmail },
        ...(phone ? [{ phone }] : [])
      ]
    };

    const existingUser = await User.findOne(query);

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        throw new Error('Email already registered');
      }
      throw new Error('Phone number already registered');
    }

    const passwordHash = await argon2.hash(password);

    const userDoc = await User.create({
      email: normalizedEmail,
      fullName: fullName.trim(),
      phone: phone || null,
      passwordHash,
      role: 'CUSTOMER'
    });

    const user = {
      id: userDoc.id,
      email: userDoc.email,
      fullName: userDoc.fullName,
      phone: userDoc.phone,
      role: userDoc.role,
      createdAt: userDoc.createdAt
    };

    const accessToken = generateAccessToken(user);
    const { rawToken, tokenHash, familyId } = generateRefreshTokenPair();

    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return { user, accessToken, refreshToken: rawToken };
  },

  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

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

    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
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

    const user = await User.findOneAndUpdate(
      { email },
      {
        $set: {
          googleId: payload.sub,
          isVerified: true
        },
        $setOnInsert: {
          fullName: payload.name || 'Google User',
          role: 'CUSTOMER'
        }
      },
      { new: true, upsert: true }
    );

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

    await RefreshToken.create({
      userId: user.id,
      tokenHash,
      familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return { user: safeUser, accessToken, refreshToken: rawToken };
  },

  async refreshToken(rawToken) {
    if (!rawToken) {
      throw new Error('Refresh token required');
    }

    const tokenHash = hashToken(rawToken);
    const tokenRecord = await RefreshToken.findOne({ tokenHash });

    if (!tokenRecord) {
      throw new Error('Invalid refresh token');
    }

    // Replay attack prevention: if token already revoked, revoke whole family
    if (tokenRecord.isRevoked) {
      await RefreshToken.updateMany(
        { familyId: tokenRecord.familyId },
        { $set: { isRevoked: true } }
      );
      throw new Error('Token reuse detected. Session invalidated.');
    }

    if (new Date() > tokenRecord.expiresAt) {
      throw new Error('Refresh token expired');
    }

    // Revoke old token
    await RefreshToken.findByIdAndUpdate(tokenRecord.id, { $set: { isRevoked: true } });

    // Generate new token in same family
    const next = generateRefreshTokenPair();
    await RefreshToken.create({
      userId: tokenRecord.userId,
      tokenHash: next.tokenHash,
      familyId: tokenRecord.familyId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const user = await User.findById(tokenRecord.userId);
    if (!user) {
      throw new Error('User not found');
    }

    const newAccessToken = generateAccessToken(user);

    return {
      accessToken: newAccessToken,
      refreshToken: next.rawToken
    };
  },

  async logout(rawToken) {
    if (!rawToken) return;
    const tokenHash = hashToken(rawToken);
    const tokenRecord = await RefreshToken.findOne({ tokenHash });
    if (tokenRecord) {
      await RefreshToken.updateMany(
        { familyId: tokenRecord.familyId },
        { $set: { isRevoked: true } }
      );
    }
  },

  async getProfile(userId) {
    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    };
  },

  async updateProfile(userId, { fullName, phone }) {
    if (phone) {
      const existing = await User.findOne({
        phone,
        _id: { $ne: userId }
      });
      if (existing) {
        throw new Error('Phone number already in use by another account');
      }
    }

    const updateFields = {};
    if (fullName) updateFields.fullName = fullName.trim();
    if (phone !== undefined) updateFields.phone = phone || null;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedUser) {
      throw new Error('User not found');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    };
  }
};

export default authService;
