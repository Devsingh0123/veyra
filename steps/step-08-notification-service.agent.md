# STEP 08: NOTIFICATION SERVICE & BULLMQ WORKERS

**Status:** PENDING ⏳  
**Domain:** Asynchronous Email, SMS & WhatsApp Delivery, BullMQ Workers, Exponential Retries, Dead Letter Queue (DLQ)  
**Target Path:** [`services/notification-service`](file:///c:/Users/HP/Desktop/New%20folder/services/notification-service)  
**Queue Infrastructure:** Redis 7 + BullMQ  
**Port:** 3006  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Non-Blocking Delivery:** Notifications never block the checkout or payment transaction paths. They are queued asynchronously in Redis.
- **Multi-Channel Dispatch:**
  - Email: Transactional HTML templates (Resend / AWS SES / Nodemailer).
  - SMS & WhatsApp: Transactional OTP and order dispatch alerts (Twilio / MSG91).
- **Fault Tolerance:** Configurable exponential backoff retries with automatic routing to a Dead Letter Queue (DLQ) upon repeated failure.

---

## 2. QUEUES & EVENT SCHEMAS

- `notifications:email` -> Order Confirmation, Tax Invoice PDF attached, Shipping Dispatched, Password Reset OTP.
- `notifications:sms` -> Delivery OTP, Out for delivery alert.
- `notifications:whatsapp` -> Order confirmation with track link.

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Install BullMQ and template rendering library in `services/notification-service`.
- [ ] **Pending:** Implement worker connection to Redis instance.
- [ ] **Pending:** Build responsive HTML email templates (Veyra branded).
- [ ] **Pending:** Implement transport adapters (Mock transport for local dev, SES/Resend for prod).
- [ ] **Pending:** Implement DLQ monitoring and alert logging.
- [ ] **Pending:** Add REST webhook for direct internal microservice dispatch.

---

## 4. MODIFICATION & ISOLATION NOTES
- Changing email templates or adding WhatsApp providers requires zero modifications to `order-service` or `payment-service`.
