import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import proxy from 'express-http-proxy';
import { existsSync } from 'fs';
import { resolve } from 'path';

// Load .env natively
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

const PORT = process.env.PORT || 3000;
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || 'http://localhost:3002';
const CART_SERVICE_URL = process.env.CART_SERVICE_URL || 'http://localhost:3003';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3004';
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';

const STOREFRONT_URL = process.env.STOREFRONT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';

const app = express();

// CORS configuration for frontends
app.use(cors({
  origin: [STOREFRONT_URL, ADMIN_URL],
  credentials: true
}));

app.use(cookieParser());

// Gateway healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'api-gateway',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// SERVICE PROXIES (using express-http-proxy)
// ==========================================

// 1. Auth Service (:3001)
app.use('/api/v1/auth', proxy(AUTH_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/v1/auth${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Auth Service is currently unreachable. Please try again shortly.'
      }
    });
  }
}));

// 2. Catalog Service (:3002)
app.use('/api/v1/catalog', proxy(CATALOG_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/v1/catalog${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Catalog Service is currently unreachable. Please try again shortly.'
      }
    });
  }
}));

// 3. Cart Service (:3003)
app.use('/api/v1/cart', proxy(CART_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/v1/cart${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Cart Service is currently unreachable. Please try again shortly.'
      }
    });
  }
}));

// 4. Order Service (:3004)
app.use('/api/v1/orders', proxy(ORDER_SERVICE_URL, {
  proxyReqPathResolver: (req) => `/api/v1/orders${req.url}`,
  proxyErrorHandler: (err, res, next) => {
    res.status(503).json({
      success: false,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Order Service is currently unreachable. Please try again shortly.'
      }
    });
  }
}));

// Future services (ready to enable as each service is completed):
// app.use('/api/v1/payments', proxy(PAYMENT_SERVICE_URL, { proxyReqPathResolver: (req) => `/api/v1/payments${req.url}` }));

// 404 for unrouted requests
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `No service registered for ${req.method} ${req.originalUrl}`
    }
  });
});

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on http://localhost:${PORT}`);
  console.log(`[API Gateway] Proxying /api/v1/auth/* -> ${AUTH_SERVICE_URL}`);
  console.log(`[API Gateway] Proxying /api/v1/catalog/* -> ${CATALOG_SERVICE_URL}`);
  console.log(`[API Gateway] Proxying /api/v1/cart/* -> ${CART_SERVICE_URL}`);
  console.log(`[API Gateway] Proxying /api/v1/orders/* -> ${ORDER_SERVICE_URL}`);
});
