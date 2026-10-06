import { authService } from '../services/auth.service.js';

const COOKIE_NAME = 'veyra_refresh_token';

function setRefreshCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/api/v1/auth'
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    path: '/api/v1/auth'
  });
}

export const authController = {
  async register(req, res) {
    try {
      const { email, password, fullName, phone } = req.body;

      if (!email || !password || !fullName) {
        return res.status(400).json({ success: false, error: 'Email, password, and fullName are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ success: false, error: 'Password must be at least 8 characters long' });
      }

      const { user, accessToken, refreshToken } = await authService.register({
        email,
        password,
        fullName,
        phone
      });

      setRefreshCookie(res, refreshToken);

      return res.status(201).json({
        success: true,
        message: 'Account registered successfully',
        data: { user, accessToken }
      });
    } catch (err) {
      const status = err.message.includes('already registered') ? 409 : 400;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required' });
      }

      const { user, accessToken, refreshToken } = await authService.login({ email, password });

      setRefreshCookie(res, refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken }
      });
    } catch (err) {
      const status = err.message.includes('Invalid email or password') ? 401 : 400;
      return res.status(status).json({ success: false, error: err.message });
    }
  },

  async google(req, res) {
    try {
      const { idToken } = req.body;
      if (!idToken) {
        return res.status(400).json({ success: false, error: 'Google idToken is required' });
      }

      const { user, accessToken, refreshToken } = await authService.googleLogin({ idToken });

      setRefreshCookie(res, refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Google login successful',
        data: { user, accessToken }
      });
    } catch (err) {
      return res.status(401).json({ success: false, error: err.message });
    }
  },

  async refresh(req, res) {
    try {
      const rawToken = req.cookies[COOKIE_NAME] || req.body?.refreshToken;
      if (!rawToken) {
        return res.status(401).json({ success: false, error: 'Refresh token required' });
      }

      const { accessToken, refreshToken } = await authService.refreshToken(rawToken);

      setRefreshCookie(res, refreshToken);

      return res.status(200).json({
        success: true,
        message: 'Token refreshed',
        data: { accessToken }
      });
    } catch (err) {
      clearRefreshCookie(res);
      return res.status(401).json({ success: false, error: err.message });
    }
  },

  async logout(req, res) {
    try {
      const rawToken = req.cookies[COOKIE_NAME] || req.body?.refreshToken;
      await authService.logout(rawToken);
      clearRefreshCookie(res);

      return res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      return res.status(500).json({ success: false, error: err.message });
    }
  },

  async getMe(req, res) {
    try {
      const user = await authService.getProfile(req.user.id);
      return res.status(200).json({ success: true, data: { user } });
    } catch (err) {
      return res.status(404).json({ success: false, error: err.message });
    }
  },

  async updateMe(req, res) {
    try {
      const { fullName, phone } = req.body;
      const user = await authService.updateProfile(req.user.id, { fullName, phone });
      return res.status(200).json({ success: true, message: 'Profile updated', data: { user } });
    } catch (err) {
      const status = err.message.includes('already in use') ? 409 : 400;
      return res.status(status).json({ success: false, error: err.message });
    }
  }
};
