# STEP 11: RETURNS, REVERSE LOGISTICS & REFUNDS

**Status:** DONE ✅  
**Domain:** 7-Day Return Window, Admin Inspection Workflow, Reverse Pickup, Razorpay Automated Refunds, Statutory GST Credit Notes  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service) & [`services/payment-service`](file:///c:/Users/HP/Desktop/New%20folder/services/payment-service)  
**Database Schema:** `orders` + `payments` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Customer Return Eligibility:** Validate 7-day post-delivery window against delivery timestamps.
- **Admin QC & Inspection Workflow:** Warehouse marks item `RECEIVED_AT_WAREHOUSE`, inspects physical condition, and approves (`INSPECTED_PASSED`) or rejects (`INSPECTED_REJECTED`).
- **Automated Payment Refund:** Triggers programmatic Razorpay refund intent with idempotency ledger verification.
- **Statutory GST Credit Notes:** Automatically generates a numbered Credit Note (`CN/26-27/000001`) linked to the original Tax Invoice for legal tax audit compliance.

---

## 2. PRISMA ORM RETURN & CREDIT NOTE MODELS (`orders` schema)

```prisma
model ReturnRequest {
  id           String       @id @default(uuid()) @db.Uuid
  orderId      String       @map("order_id") @db.Uuid
  userId       String       @map("user_id") @db.Uuid
  reason       String       @db.VarChar(100)
  comments     String?      @db.Text
  images       Json         @default("[]") // photographic proof
  status       ReturnStatus @default(REQUESTED)
  refundAmount Decimal      @map("refund_amount") @db.Decimal(10, 2)
  adminNote    String?      @map("admin_note") @db.Text
  createdAt    DateTime     @default(now()) @map("created_at")
  updatedAt    DateTime     @updatedAt @map("updated_at")

  @@index([orderId])
  @@map("return_requests")
  @@schema("orders")
}

model CreditNote {
  id               String   @id @default(uuid()) @db.Uuid
  returnRequestId  String   @unique @map("return_request_id") @db.Uuid
  creditNoteNumber String   @unique @map("credit_note_number") @db.VarChar(50) // e.g. "CN/26-27/00012"
  originalInvoiceNo String  @map("original_invoice_no") @db.VarChar(50)
  totalRefundGst   Decimal  @map("total_refund_gst") @db.Decimal(10, 2)
  totalRefundValue Decimal  @map("total_refund_value") @db.Decimal(10, 2)
  createdAt        DateTime @default(now()) @map("created_at")

  @@map("credit_notes")
  @@schema("orders")
}

enum ReturnStatus {
  REQUESTED
  APPROVED
  REJECTED
  PICKUP_SCHEDULED
  RECEIVED_AT_WAREHOUSE
  INSPECTED_PASSED
  INSPECTED_REJECTED
  REFUNDED

  @@schema("orders")
}
```

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [x] **Done:** Add Return and CreditNote models in Prisma schema (`schema.prisma`).
- [x] **Done:** Implement customer return request validation logic with 7-day post-delivery check (`return.service.js`).
- [x] **Done:** Implement warehouse inspection approval / rejection workflow.
- [x] **Done:** Wire refund execution to `payment-service` API.
- [x] **Done:** Generate statutory Section 34 GST Credit Note and printable HTML template.
- [x] **Done:** Expose customer and admin endpoints in `order.routes.js`.

---

## 4. MODIFICATION & ISOLATION NOTES
- Policy changes (such as 10-day instead of 7-day return window) are managed in `src/config/returns.js`.
