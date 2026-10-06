-- VEYRA MULTI-SCHEMA DATABASE INITIALIZATION SCRIPT
-- Runs on PostgreSQL container initialization

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Isolated domain schemas
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS catalog;
CREATE SCHEMA IF NOT EXISTS cart;
CREATE SCHEMA IF NOT EXISTS orders;
CREATE SCHEMA IF NOT EXISTS payments;

-- Grant permissions (if dedicated service users are used in production)
-- For local dev, public/postgres has administrative access to all schemas
COMMENT ON SCHEMA auth IS 'Identity, sessions, credentials, and RBAC domain';
COMMENT ON SCHEMA catalog IS 'Categories, products, variants, media, and inventory domain';
COMMENT ON SCHEMA cart IS 'Ephemeral guest and persistent authenticated shopping carts';
COMMENT ON SCHEMA orders IS 'Orders, order items snapshot, tax calculation, checkout, and returns';
COMMENT ON SCHEMA payments IS 'Razorpay payment intents, transactions, webhooks, and refunds ledger';
