import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { existsSync } from 'fs';
import { resolve } from 'path';
import authRoutes from './routes/auth.routes.js';
import { connectDB, disconnectDB } from './config/db.js';

// Load .env natively
const envPath = resolve(process.cwd(), '.env');
if (existsSync(envPath) && typeof process.loadEnvFile === 'function') {
  process.loadEnvFile(envPath);
}

const PORT = process.env.PORT || 3001;
const STOREFRONT_URL = process.env.STOREFRONT_URL || 'http://localhost:5173';
const ADMIN_URL = process.env.ADMIN_URL || 'http://localhost:5174';

const app = express();

app.use(cors({
  origin: [STOREFRONT_URL, ADMIN_URL],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Healthcheck
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'auth-service',
    timestamp: new Date().toISOString()
  });
});

// Auth Routes
app.use('/api/v1/auth', authRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('Auth Service Error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
});

// Connect to MongoDB before accepting traffic
let server;
try {
  await connectDB();
  server = app.listen(PORT, () => {
    console.log(`[Auth Service] Running on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error('[Auth Service] Fatal error during startup:', err);
  process.exit(1);
}

// Graceful shutdown
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
