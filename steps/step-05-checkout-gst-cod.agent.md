# STEP 05: CHECKOUT, INDIAN GST & COD SCORING ENGINE

**Status:** PENDING ⏳  
**Domain:** Checkout Orchestration, Indian GST Calculation, 6-Digit PIN Code Serviceability, Coupons, COD Risk Rules  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service)  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Indian Statutory GST Calculation:**
  - Seller State (e.g., Haryana / Delhi / Karnataka) vs Delivery State.
  - Intrastate: CGST (rate / 2) + SGST (rate / 2).
  - Interstate: IGST (full rate).
  - Backward derivation for MRP-inclusive pricing: $\text{Taxable} = \frac{\text{MRP}}{1 + \text{Rate}}$.
- **PIN Code Serviceability:** Redis set / bitmap checking 6-digit Indian Postal PIN codes for delivery viability.
- **COD Qualification Rules:**
  - Minimum ₹299, maximum ₹5,000.
  - Verification of past RTO delivery failures (max 2 failures allowed).
  - Non-refundable COD handling surcharge (₹49).
- **Coupon & Promotion Engine:** Single-use vouchers, percentage or fixed discount, minimum cart threshold.

---

## 2. PRISMA ORM MODELS (in `order-service/prisma/schema.prisma`)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["orders"]
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema"]
}

model Coupon {
  id              String       @id @default(uuid()) @db.Uuid
  code            String       @unique @db.VarChar(50)
  discountType    DiscountType @map("discount_type")
  discountValue   Decimal      @map("discount_value") @db.Decimal(10, 2)
  minOrderValue   Decimal      @default(0) @map("min_order_value") @db.Decimal(10, 2)
  maxDiscount     Decimal?     @map("max_discount") @db.Decimal(10, 2)
  usageLimit      Int?         @map("usage_limit")
  usedCount       Int          @default(0) @map("used_count")
  validFrom       DateTime     @map("valid_from")
  validUntil      DateTime     @map("valid_until")
  isActive        Boolean      @default(true) @map("is_active")
  createdAt       DateTime     @default(now()) @map("created_at")

  @@map("coupons")
  @@schema("orders")
}

enum DiscountType {
  PERCENTAGE
  FLAT

  @@schema("orders")
}
```

---

## 3. API ENDPOINTS & CONTRACTS

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/v1/checkout/quote` | Auth | Calculate live checkout breakdown (items, GST CGST/SGST/IGST, freight, COD eligibility) |
| `POST` | `/api/v1/checkout/coupons/apply` | Auth | Validate and apply promo code |
| `GET` | `/api/v1/shipping/pin-check/:pincode` | Public | Validate 6-digit Indian PIN code serviceability |

---

## 4. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Implement pure GST calculation utility with decimal precision (`bignumber.js` or `Prisma.Decimal`).
- [ ] **Pending:** Implement PIN code validation & Redis lookup service.
- [ ] **Pending:** Implement Coupon evaluation engine with Prisma.
- [ ] **Pending:** Implement COD eligibility evaluator.
- [ ] **Pending:** Implement Checkout quote controller and route.

---

## 5. MODIFICATION & ISOLATION NOTES
- Adjusting GST tax tiers or COD limits is completely localized to `src/config/checkout.js`.
