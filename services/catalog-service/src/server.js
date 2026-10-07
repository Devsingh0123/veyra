import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { resolve } from 'path';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import { connectDB, disconnectDB } from './config/db.js';

// Load .env natively
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

const PORT = process.env.PORT || 3002;
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
    service: 'catalog-service',
    timestamp: new Date().toISOString()
  });
});

// Domain routes
app.use('/api/v1/catalog/categories', categoryRoutes);
app.use('/api/v1/catalog/products', productRoutes);
app.use('/api/v1/catalog/inventory', inventoryRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Catalog Service Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

let server;
try {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`[Catalog Service] Running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('[Catalog Service] Fatal error during startup:', err);
  process.exit(1);
}

process.on('SIGTERM', async () => {
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  }
});

process.on('SIGINT', async () => {
  if (server) {
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  }
});

export default app;
