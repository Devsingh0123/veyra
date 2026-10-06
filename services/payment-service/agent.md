# PAYMENT SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/payment-service`  
**Port:** 3005  
**Database Schema:** `payments` (PostgreSQL via Prisma ORM)  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM, Razorpay SDK, Crypto, CORS  

---

## 1. PURPOSE & ARCHITECTURE
Handles payment intents, cryptographic webhook verification, and the financial audit ledger:
- **Authoritative Server Verification:** Validates Razorpay client checkout signatures (`razorpay_order_id|razorpay_payment_id`) and webhooks cryptographically using HMAC-SHA256.
- **Idempotency Ledger:** Webhook IDs are stored with unique constraints in `payments.webhook_events` to safely reject duplicates and replay attacks.
- **Zero Zod Dependency:** Simple, fast, and readable native JavaScript validation.
- **Automated Refunds:** Programmatic Razorpay refunds with database transaction logging in `payments.refunds`.
- **Order Service Synchronization:** Directly communicates captured payment updates to the Order Service (`:3004`).

---

## 2. PRODUCTION FOLDER STRUCTURE
```text
services/payment-service/
├── prisma/
│   └── schema.prisma                 # Multi-schema PostgreSQL (payments: PaymentIntent, WebhookEvent, Refund)
├── src/
│   ├── controllers/
│   │   └── payment.controller.js     # Native JS validation, clean request handling
│   ├── routes/
│   │   └── payment.routes.js         # Intent creation, verify, webhook, refund, status
│   ├── services/
│   │   ├── razorpay.service.js       # Razorpay API client, cryptographic HMAC verification & dev mock mode
│   │   └── payment.service.js        # Intent creation, payment verification, idempotent webhooks, refunds
│   ├── prisma.js                     # PrismaClient singleton instance
│   └── server.js                     # Express app, raw body buffer hook for webhooks, CORS, port 3005
├── .env
├── .env.example
├── package.json
└── agent.md                          # This living service document
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth / Context | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service healthcheck probe |
| `POST` | `/api/v1/payments/create-intent` | Auth / Customer | Create Razorpay order intent for order payment |
| `POST` | `/api/v1/payments/verify` | Auth / Customer | Verify checkout signature and mark payment captured |
| `POST` | `/api/v1/payments/webhook` | Webhook (`x-razorpay-signature`) | Cryptographic HMAC webhook listener with idempotency |
| `POST` | `/api/v1/payments/refund` | Admin | Issue full or partial refund via Razorpay |
| `GET` | `/api/v1/payments/order/:orderId` | Customer / Admin | Get payment intent and refund records by Order ID |

---

## 4. STATUS CHECKLIST

- [x] **Done:** Service scaffold and `.env` configured for `payments` PostgreSQL schema.
- [x] **Done:** Multi-schema `prisma/schema.prisma` defined (`PaymentIntent`, `WebhookEvent`, `Refund`).
- [x] **Done:** Razorpay SDK client with HMAC-SHA256 signature verification and dev fallback.
- [x] **Done:** Payment intent creation and capture service (`src/services/payment.service.js`).
- [x] **Done:** Idempotency ledger for incoming webhooks.
- [x] **Done:** Clean native controllers without Zod (`src/controllers/payment.controller.js`).
- [x] **Done:** Express routes & server entrypoint with raw body preservation on port `3005`.
- [x] **Done:** Gateway proxy route `/api/v1/payments/*` registered in API Gateway.

---

## 5. CHANGELOG & UPDATES
- **2026-10-06:** Built complete Payment Service with Razorpay client, cryptographic HMAC verification, idempotency ledger, zero Zod dependency, and connected to API Gateway.
