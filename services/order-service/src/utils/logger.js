import pino from 'pino';
import { env } from '../config/env.js';

export const logger = pino({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  formatters: {
    level: (label) => ({ level: label })
  },
  base: {
    service: env.SERVICE_NAME,
    env: env.NODE_ENV
  },
  timestamp: pino.stdTimeFunctions.isoTime
});
