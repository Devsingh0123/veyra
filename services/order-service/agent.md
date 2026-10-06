# ORDER SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/order-service`  
**Port:** 3004  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  
**Status:** PENDING (Phase 5, 7, 9, 10, 11) ⏳  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM, Puppeteer, Zod, Pino  

---

## 1. PURPOSE & ARCHITECTURE
Handles the entire lifecycle of an order:
- **Indian Statutory GST Engine:** Calculates CGST, SGST, IGST, and derives taxable base values from MRP-inclusive prices.
- **Strict Finite State Machine (FSM):** Enforces legal state transitions (`PENDING` -> `PAYMENT_PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `OUT_FOR_DELIVERY` -> `DELIVERED`).
- **Immutable Historical Snapshots:** Orders, items, tax values, and addresses are saved as immutable records that never link dynamically to changing catalog data.
- **Consecutive FY Invoice Serials:** Section 46 CGST compliant numbering (`VEY/26-27/000491`) and Puppeteer PDF generator.
- **Logistics & Shipments:** AWB generation, Delhivery/Shiprocket carrier abstraction, tracking webhooks.
- **Returns & Credit Notes:** 7-day return request filing, warehouse inspection, statutory GST Credit Notes.

---

## 2. PLANNED FOLDER STRUCTURE
```text
services/order-service/
├── prisma/
│   └── schema.prisma                 # Order, OrderItem, OrderHistory, TaxInvoice, Shipment, ReturnRequest, CreditNote
├── src/
│   ├── config/                       # Env, database, logger, checkout rules
│   ├── modules/
│   │   ├── checkout/                 # GST calculator, coupon engine, COD risk evaluator
│   │   ├── orders/                   # Order creation, FSM state machine, snapshot storage
│   │   ├── invoicing/                # Consecutive FY serials & PDF invoice generation
│   │   ├── logistics/                # Carrier abstraction & AWB management
│   │   └── returns/                  # Return requests & statutory GST credit notes
│   ├── app.js
│   └── server.js
├── .env.example
├── package.json
└── agent.md                          # This living service document
```

---

## 3. STATUS CHECKLIST

- [x] **Done:** Service scaffold created with `/health` endpoint.
- [ ] **Pending:** Define `prisma/schema.prisma` for `orders` schema.
- [ ] **Pending:** Implement Indian GST tax calculation engine (CGST/SGST/IGST).
- [ ] **Pending:** Implement Order FSM transition validation matrix.
- [ ] **Pending:** Implement Immutable item snapshot generator.
- [ ] **Pending:** Implement Section 46 CGST consecutive FY invoice serial counter & PDF generator.
- [ ] **Pending:** Implement Carrier logistics adapter.
- [ ] **Pending:** Mount `/api/v1/orders/*` route on API Gateway.

---

## 4. CHANGELOG & UPDATES
- **2026-10-06:** Initial agent specification created covering checkout, FSM, invoicing, and logistics.
