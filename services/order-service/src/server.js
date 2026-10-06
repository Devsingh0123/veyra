import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { resolve } from 'path';
import orderRoutes from './routes/order.routes.js';
import prisma from './prisma.js';

// Load .env natively
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

const PORT = process.env.PORT || 3004;
const STOREFRONT_URL = process.env.STOREFRONT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';

const app = express();

app.use(cors({
  origin: [STOREFRONT_URL, ADMIN_URL],
  credentials: true
}));

app.use(express.json());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'order-service',
    timestamp: new Date().toISOString()
  });
});

// Domain routes
app.use('/api/v1/orders', orderRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Order Service Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
  console.log(`[Order Service] Running on http://localhost:${PORT}`);
});

process.on('SIGTERM', async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
});

export default app;
