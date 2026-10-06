# ORDER SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/order-service`  
**Port:** 3004  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  
**Status:** CODE COMPLETE 🚀  
**Tech Stack:** Node.js (v20+), Express.js, Prisma ORM, CORS  

---

## 1. PURPOSE & ARCHITECTURE
Handles the entire lifecycle of an order:
- **Indian Statutory GST Engine:** Calculates CGST, SGST (intrastate 50/50 split), IGST (interstate 100%), and derives taxable base values from MRP-inclusive prices backward.
- **Section 46 CGST Tax Invoicing:** Generates consecutive FY serial numbers (e.g. `VEY/26-27/000001`) with atomic sequence counters and renders printable A4 compliant HTML invoices.
- **Carrier Logistics & AWB Management:** Carrier abstraction interface (Delhivery, Shiprocket, Mock), volumetric weight calculations ($L \times W \times H / 5000$), E-Way bill compliance flags for interstate orders > ₹50,000, and live webhook tracking checkpoints.
- **Strict Finite State Machine (FSM):** Enforces legal lifecycle state transitions (`PENDING` -> `PAYMENT_PENDING` -> `CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED` -> `OUT_FOR_DELIVERY` -> `DELIVERED` / `CANCELLED` / `RTO_INITIATED` -> `REFUNDED`).
- **Immutable Historical Snapshots:** Orders, line items, tax rates, and addresses are saved as immutable records so they never join dynamically to mutating catalog products or user records.
- **Coupon & Promotion Engine:** Enforces minimum order value, maximum discount caps, usage limits, and expiration checks.
- **Cash On Delivery (COD) Rules:** Minimum ₹299, Maximum ₹5,000 threshold for risk mitigation, and flat ₹49 COD fee.
- **Zero Zod Dependency:** Clean, native JavaScript conditionals for fast and straightforward execution.

---

## 2. PRODUCTION FOLDER STRUCTURE
```text
services/order-service/
├── prisma/
│   └── schema.prisma                 # Multi-schema PostgreSQL (orders: Order, OrderItem, OrderHistory, Coupon, TaxInvoice, InvoiceSequence, Shipment)
├── src/
│   ├── controllers/
│   │   └── order.controller.js       # Native JS validation: orders, quotes, invoices, shipments
│   ├── routes/
│   │   └── order.routes.js           # Quote, orders, cancel, admin, invoice, shipment, logistics webhook
│   ├── services/
│   │   ├── gst.service.js            # Indian GST intrastate/interstate & MRP tax extraction
│   │   ├── fsm.service.js            # Strict FSM transition matrix & cancel eligibility
│   │   ├── order.service.js          # Quotation, transactional order placement, order history
│   │   ├── invoice.service.js        # Section 46 CGST consecutive FY numbering & HTML invoice renderer
│   │   └── logistics.service.js      # Carrier abstraction, volumetric weight, AWB generation & tracking webhooks
│   ├── prisma.js                     # PrismaClient singleton instance
│   └── server.js                     # Express app, CORS, /health, /api/v1/orders router
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
| `POST` | `/api/v1/orders/quote` | Public / Customer | Live checkout quote (tax, discounts, shipping, COD rules) |
| `POST` | `/api/v1/orders` | Customer (`x-user-id`) | Place order with immutable item & address snapshots |
| `GET` | `/api/v1/orders` | Customer (`x-user-id`) | Paginated customer orders list |
| `GET` | `/api/v1/orders/:id` | Customer / Admin | Single order details with items and FSM history audit |
| `PATCH`| `/api/v1/orders/:id/cancel` | Customer / Admin | Cancel order before shipment |
| `GET` | `/api/v1/orders/:id/invoice` | Customer / Admin | Get or generate Tax Invoice data |
| `GET` | `/api/v1/orders/:id/invoice/html` | Customer / Admin | View printable Section 46 CGST HTML Tax Invoice |
| `POST` | `/api/v1/orders/admin/:id/shipment` | Admin | Dispatch order and assign AWB carrier label |
| `GET` | `/api/v1/orders/:id/shipment` | Customer / Admin | Get shipment tracking checkpoints |
| `POST` | `/api/v1/orders/logistics/webhook`| Carrier | Ingest carrier tracking webhook updates |
| `GET` | `/api/v1/orders/admin/all` | Admin | Filterable, paginated orders list across all users |
| `PATCH`| `/api/v1/orders/admin/:id/status` | Admin | Advance order FSM state with audit history log |

---

## 4. STATUS CHECKLIST

- [x] **Done:** Multi-schema `prisma/schema.prisma` defined (`Order`, `OrderItem`, `OrderHistory`, `Coupon`, `TaxInvoice`, `InvoiceSequence`, `Shipment`).
- [x] **Done:** Indian statutory GST calculation engine (`src/services/gst.service.js`).
- [x] **Done:** Section 46 CGST Tax Invoice engine with consecutive FY serials and printable HTML template (`src/services/invoice.service.js`).
- [x] **Done:** Shipping and logistics engine with volumetric freight and carrier tracking (`src/services/logistics.service.js`).
- [x] **Done:** Order lifecycle FSM transition matrix (`src/services/fsm.service.js`).
- [x] **Done:** Quotation, snapshot storage, and order management (`src/services/order.service.js`).
- [x] **Done:** Clean native controllers without Zod (`src/controllers/order.controller.js`).
- [x] **Done:** Express routes & server entrypoint on port `3004` (`src/server.js`).
- [x] **Done:** Gateway proxy route `/api/v1/orders/*` enabled in `services/api-gateway`.

---

## 5. CHANGELOG & UPDATES
- **2026-10-06:** Implemented Section 46 CGST Tax Invoicing, consecutive FY sequence generator, and Carrier Logistics engine with volumetric weights and AWB assignment.
