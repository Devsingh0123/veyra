import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3004),
  SERVICE_NAME: z.string().default('order-service'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgrespassword@localhost:5432/veyra_dev'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  CATALOG_SERVICE_URL: z.string().default('http://localhost:3002'),
  CART_SERVICE_URL: z.string().default('http://localhost:3003'),
  PAYMENT_SERVICE_URL: z.string().default('http://localhost:3005'),
  STOREFRONT_URL: z.string().default('http://localhost:5173'),
  ADMIN_URL: z.string().default('http://localhost:5174')
});

export const env = envSchema.parse(process.env);
