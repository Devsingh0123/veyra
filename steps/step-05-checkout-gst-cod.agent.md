# STEP 05: CHECKOUT, INDIAN GST & COD SCORING ENGINE

**Status:** DONE ✅  
**Domain:** Checkout Orchestration, Indian GST Calculation, 6-Digit PIN Code Serviceability, Coupons, COD Risk Rules  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service)  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Indian Statutory GST Calculation:**
  - Seller State (e.g. Haryana / Delhi / Karnataka) vs Delivery State.
  - Intrastate: CGST (rate / 2) + SGST (rate / 2).
  - Interstate: IGST (full rate).
  - Backward derivation for MRP-inclusive pricing: $\text{Taxable} = \frac{\text{MRP}}{1 + \text{Rate}}$.
- **COD Qualification Rules:**
  - Minimum ₹299, maximum ₹5,000.
  - Non-refundable COD handling surcharge (₹49).
- **Coupon & Promotion Engine:** Percentage or fixed discount, minimum order threshold, usage limits, expiration checks.

---

## 2. PRISMA ORM MODELS (in `order-service/prisma/schema.prisma`)

```prisma
model Coupon {
  id                String    @id @default(uuid()) @db.Uuid
  code              String    @unique @db.VarChar(50)
  discountType      String    @map("discount_type") @db.VarChar(20)
  discountValue     Decimal   @map("discount_value") @db.Decimal(10, 2)
  minOrderAmount    Decimal   @default(0) @map("min_order_amount") @db.Decimal(10, 2)
  maxDiscountAmount Decimal?  @map("max_discount_amount") @db.Decimal(10, 2)
  usageLimit        Int?      @map("usage_limit")
  usedCount         Int       @default(0) @map("used_count")
  expiresAt         DateTime? @map("expires_at")
  isActive          Boolean   @default(true) @map("is_active")
  createdAt         DateTime  @default(now()) @map("created_at")

  @@map("coupons")
  @@schema("orders")
}
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/orders/quote` | Public / Customer | Calculate live checkout breakdown (items, GST CGST/SGST/IGST, freight, COD eligibility) |

---

## 4. STATUS & IMPLEMENTATION ROADMAP

- [x] **Done:** Implement pure GST calculation utility with decimal precision (`gst.service.js`).
- [x] **Done:** Implement Coupon evaluation engine with Prisma in `order.service.js`.
- [x] **Done:** Implement COD eligibility evaluator (₹299-₹5000, ₹49 fee).
- [x] **Done:** Implement Checkout quote controller and route (`/api/v1/orders/quote`).

---

## 5. MODIFICATION & ISOLATION NOTES
- Adjusting GST tax tiers or COD limits is completely localized to `src/config/checkout.js`.
