# NOTIFICATION SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/notification-service`  
**Port:** 3006  
**Queue Infrastructure:** Redis 7 + BullMQ  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, BullMQ, Redis 7 (ioredis), Nodemailer, CORS  

---

## 1. PURPOSE & ARCHITECTURE
Handles all asynchronous notifications across Email, SMS, and WhatsApp:
- **Asynchronous BullMQ Queues:** Never blocks HTTP response cycles for orders or auth; dispatches jobs via BullMQ Redis workers with exponential backoff retries.
- **Transactional Channels:**
  - Email: Branded HTML receipts for order confirmations and security OTPs.
  - SMS & WhatsApp: Transactional OTP and order dispatch alerts.
- **Zero Zod Dependency:** Lightweight native JavaScript validation.
- **Development Mocking:** Built-in dev transport fallback that logs messages to the console when real SMTP credentials are test placeholders.

---

## 2. PRODUCTION FOLDER STRUCTURE
```text
services/notification-service/
├── src/
│   ├── controllers/
│   │   └── notification.controller.js  # Native JS validation, clean request handling
│   ├── routes/
│   │   └── notification.routes.js      # /email, /order-confirmation, /otp
│   ├── services/
│   │   ├── template.service.js         # Responsive Veyra HTML templates (order, otp)
│   │   └── notification.service.js     # BullMQ queue, worker, Nodemailer transport
│   ├── redis.js                        # Redis connection with maxRetriesPerRequest: null
│   └── server.js                       # Express app, port 3006, worker initializer
├── .env
├── .env.example
├── package.json
└── agent.md                            # This living service document
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth / Context | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Service healthcheck probe |
| `POST` | `/api/v1/notifications/email` | Internal / Service | Send or queue generic transactional email |
| `POST` | `/api/v1/notifications/order-confirmation` | Internal / Service | Queue branded HTML order confirmation email |
| `POST` | `/api/v1/notifications/otp` | Internal / Service | Dispatch transactional OTP for authentication |

---

## 4. STATUS CHECKLIST

- [x] **Done:** Service scaffold and `.env` configured for port 3006.
- [x] **Done:** Redis connection configured for BullMQ (`src/redis.js`).
- [x] **Done:** Branded responsive HTML templates for Order Confirmation and OTP (`src/services/template.service.js`).
- [x] **Done:** Asynchronous BullMQ queue & worker with exponential retry logic (`src/services/notification.service.js`).
- [x] **Done:** Clean native controllers without Zod (`src/controllers/notification.controller.js`).
- [x] **Done:** Express routes and server startup on port `3006`.

---

## 5. CHANGELOG & UPDATES
- **2026-10-06:** Built complete Notification Service with BullMQ queue, Nodemailer transporter, Veyra HTML email templates, zero Zod dependency.
