# PAYMENT SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/payment-service`  
**Port:** 3005  
**Database Schema:** `payments` (PostgreSQL via Prisma ORM)  
**Status:** PENDING (Phase 6) ⏳  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM, Razorpay SDK, Crypto, Zod, Pino  

---

## 1. PURPOSE & ARCHITECTURE
Handles Razorpay integration, secure webhook ingestion, and financial transaction recording:
- **Server Authoritative Truth:** Orders only transition to `CONFIRMED` upon verified `payment.captured` webhooks.
- **HMAC-SHA256 Verification:** Cryptographically validates every incoming webhook against the Razorpay webhook secret.
- **Idempotency Ledger:** Webhook IDs are recorded in `payments.webhook_events` to reject duplicate deliveries safely.
- **Automated Refunds:** Programmatic Razorpay API refunds with audit logs.
- **30-Minute Auto-Reconciliation Cron:** Detects stranded captures without confirmed orders and initiates auto-refunds.

---

## 2. PLANNED FOLDER STRUCTURE
```text
services/payment-service/
├── prisma/
│   └── schema.prisma                 # PaymentIntent, WebhookEvent, Refund
├── src/
│   ├── config/                       # Env, database, Razorpay client, logger
│   ├── modules/
│   │   ├── intents/                  # Order intent creation
│   │   ├── webhooks/                 # HMAC verification & idempotency ledger
│   │   ├── refunds/                  # Automated refunds
│   │   └── reconciliation/           # 30-min cron job
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── agent.md                          # This living service document
```

---

## 3. STATUS CHECKLIST

- [x] **Done:** Service scaffold created with `/health` endpoint.
- [ ] **Pending:** Define `prisma/schema.prisma` for `payments` schema.
- [ ] **Pending:** Implement Razorpay order creation endpoint.
- [ ] **Pending:** Implement HMAC-SHA256 raw body signature verification middleware.
- [ ] **Pending:** Implement Idempotent webhook event processor with Prisma.
- [ ] **Pending:** Implement Automated refund triggering service.
- [ ] **Pending:** Implement Reconciliation cron worker.
- [ ] **Pending:** Mount `/api/v1/payments/*` route on API Gateway.

---

## 4. CHANGELOG & UPDATES
- **2026-10-06:** Initial agent specification created for Phase 6 implementation.
