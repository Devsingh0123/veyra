# STEP 06: RAZORPAY PAYMENT & WEBHOOK LEDGER

**Status:** PENDING ⏳  
**Domain:** Razorpay Orders API, Payment Intents, Cryptographic HMAC-SHA256 Webhook Verification, Idempotency Ledger, Refunds  
**Target Path:** [`services/payment-service`](file:///c:/Users/HP/Desktop/New%20folder/services/payment-service)  
**Database Schema:** `payments` (PostgreSQL via Prisma ORM)  
**Port:** 3005  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Authoritative Server-to-Server Flow:** Client callbacks are purely UX hints; order confirmation relies exclusively on verified server webhooks.
- **HMAC-SHA256 Cryptographic Verification:** All incoming Razorpay webhooks are validated against the webhook secret using Node.js `crypto`.
- **Prisma Idempotency Ledger:** Each webhook event ID (`event_id`) is stored with a unique constraint in the `payments.webhook_events` table to prevent duplicate double-processing.
- **Refund Management:** Programmatic refunds via Razorpay API with recorded transaction logs.
- **Auto-Reconciliation Cron:** Scheduled job querying Razorpay API every 30 minutes to capture stranded payments.

---

## 2. PRISMA ORM SCHEMA (`services/payment-service/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["payments"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

enum PaymentStatus {
  CREATED
  AUTHORIZED
  CAPTURED
  FAILED
  REFUNDED

  @@schema("payments")
}

model PaymentIntent {
  id                String        @id @default(uuid()) @db.Uuid
  orderId           String        @map("order_id") @db.Uuid
  userId            String        @map("user_id") @db.Uuid
  razorpayOrderId   String        @unique @map("razorpay_order_id") @db.VarChar(100)
  razorpayPaymentId String?       @unique @map("razorpay_payment_id") @db.VarChar(100)
  amountPaise       BigInt        @map("amount_paise") // amount in INR paise (e.g. 10000 = ₹100.00)
  currency          String        @default("INR") @db.VarChar(3)
  status            PaymentStatus @default(CREATED)
  method            String?       @db.VarChar(50) // UPI, CARD, NETBANKING
  createdAt         DateTime      @default(now()) @map("created_at")
  updatedAt         DateTime      @updatedAt @map("updated_at")

  refunds Refund[]

  @@index([orderId])
  @@map("payment_intents")
  @@schema("payments")
}

model WebhookEvent {
  id          String   @id @default(uuid()) @db.Uuid
  eventId     String   @unique @map("event_id") @db.VarChar(100)
  eventType   String   @map("event_type") @db.VarChar(100)
  payload     Json
  isProcessed Boolean  @default(false) @map("is_processed")
  createdAt   DateTime @default(now()) @map("created_at")

  @@map("webhook_events")
  @@schema("payments")
}

model Refund {
  id               String        @id @default(uuid()) @db.Uuid
  paymentIntentId  String        @map("payment_intent_id") @db.Uuid
  razorpayRefundId String        @unique @map("razorpay_refund_id") @db.VarChar(100)
  amountPaise      BigInt        @map("amount_paise")
  reason           String?       @db.Text
  status           PaymentStatus @default(REFUNDED)
  createdAt        DateTime      @default(now()) @map("created_at")

  paymentIntent PaymentIntent @relation(fields: [paymentIntentId], references: [id])

  @@map("refunds")
  @@schema("payments")
}
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/payments/create-intent` | Auth | Create Razorpay order intent for order |
| `POST` | `/api/v1/payments/webhook` | Public (HMAC Header) | Receive & verify Razorpay webhook, idempotent execution |
| `POST` | `/api/v1/payments/refund` | Admin | Issue full or partial refund via Razorpay API |

---

## 4. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Install Prisma and Razorpay SDK in `services/payment-service`.
- [ ] **Pending:** Define `prisma/schema.prisma` and run migration on `payments` schema.
- [ ] **Pending:** Implement Razorpay client wrapper with environment credentials.
- [ ] **Pending:** Implement HMAC signature validator middleware with raw body parser.
- [ ] **Pending:** Implement Webhook handler with Prisma idempotency transaction.
- [ ] **Pending:** Dispatch BullMQ event to `order-service` upon confirmed payment.
- [ ] **Pending:** Implement reconciliation cron worker.

---

## 5. MODIFICATION & ISOLATION NOTES
- If Razorpay changes webhook signatures or another gateway (e.g. Cashfree/PhonePe) is added, only this service is modified.
