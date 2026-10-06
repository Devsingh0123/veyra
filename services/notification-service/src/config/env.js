import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3006),
  SERVICE_NAME: z.string().default('notification-service'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional().default(''),
  SMTP_HOST: z.string().default('smtp.mailtrap.io'),
  SMTP_PORT: z.coerce.number().default(2525),
  SMTP_USER: z.string().optional().default(''),
  SMTP_PASS: z.string().optional().default(''),
  EMAIL_FROM: z.string().default('no-reply@veyra.in'),
  SMS_PROVIDER: z.string().default('mock'),
  SMS_API_KEY: z.string().optional().default(''),
  STOREFRONT_URL: z.string().default('http://localhost:5173'),
  ADMIN_URL: z.string().default('http://localhost:5174')
});

export const env = envSchema.parse(process.env);
