import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3005),
  SERVICE_NAME: z.string().default('payment-service'),
  DATABASE_URL: z.string().default('postgresql://postgres:postgrespassword@localhost:5432/veyra_dev'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  RAZORPAY_KEY_ID: z.string().default('rzp_test_placeholder'),
  RAZORPAY_KEY_SECRET: z.string().default('placeholder_secret'),
  RAZORPAY_WEBHOOK_SECRET: z.string().default('placeholder_webhook_secret'),
  ORDER_SERVICE_URL: z.string().default('http://localhost:3004'),
  STOREFRONT_URL: z.string().default('http://localhost:5173'),
  ADMIN_URL: z.string().default('http://localhost:5174')
});

export const env = envSchema.parse(process.env);
