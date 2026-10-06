import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

const app = express();

app.use(cors({
  origin: [env.STOREFRONT_URL, env.ADMIN_URL],
  credentials: true
}));
app.use(express.json());

// Standard healthcheck endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: env.SERVICE_NAME,
    timestamp: new Date().toISOString()
  });
});

const server = app.listen(env.PORT, () => {
  logger.info(`Service ${env.SERVICE_NAME} listening on port ${env.PORT}`);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received. Closing HTTP server...');
  server.close(() => {
    logger.info('HTTP server closed.');
    process.exit(0);
  });
});

export default app;
