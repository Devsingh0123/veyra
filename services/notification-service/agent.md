# NOTIFICATION SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/notification-service`  
**Port:** 3006  
**Queue Infrastructure:** Redis 7 + BullMQ  
**Status:** PENDING (Phase 8) ⏳  
**Tech Stack:** Node.js (v20+), Express.js, BullMQ, Redis 7 (ioredis), Nodemailer / Resend, Pino  

---

## 1. PURPOSE & ARCHITECTURE
Handles all asynchronous notifications across Email, SMS, and WhatsApp:
- **Asynchronous Queues:** Never blocks HTTP response cycles for orders or auth; dispatches via BullMQ Redis workers.
- **Transactional Channels:**
  - Email: Branded HTML receipts with attached PDF Tax Invoices.
  - SMS & WhatsApp: Delivery OTPs, tracking links, and order confirmations.
- **Fault Tolerance:** Exponential backoff retries with Dead Letter Queue (DLQ) logging.

---

## 2. PLANNED FOLDER STRUCTURE
```text
services/notification-service/
├── src/
│   ├── config/                       # Env, Redis queue connection, mail transports
│   ├── templates/                    # HTML email templates
│   ├── workers/                      # BullMQ queue consumers (email, sms, whatsapp)
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── agent.md                          # This living service document
```

---

## 3. STATUS CHECKLIST

- [x] **Done:** Service scaffold created with `/health` endpoint.
- [ ] **Pending:** Configure BullMQ queue connections to Redis.
- [ ] **Pending:** Design Veyra responsive HTML email templates.
- [ ] **Pending:** Implement Nodemailer / Resend email worker.
- [ ] **Pending:** Implement SMS / WhatsApp webhook worker.
- [ ] **Pending:** Implement Dead Letter Queue (DLQ) alerting.

---

## 4. CHANGELOG & UPDATES
- **2026-10-06:** Initial agent specification created for Phase 8 implementation.
