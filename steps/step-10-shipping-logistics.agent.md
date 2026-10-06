# STEP 10: SHIPPING & LOGISTICS ABSTRACTION

**Status:** DONE ✅  
**Domain:** Carrier Abstraction, AWB Generation, Shipping Manifests, Carrier Adapters, Webhook Tracking Sync  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service) / Logistics  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Logistics Adapter Pattern:** Clean interface decouples carrier API specifics (Delhivery, Shiprocket, BlueDart, MockLogisticsAdapter for dev).
- **Volumetric Weight Calculation:** Billable weight computed as $\max(\text{dead\_weight}, \frac{L \times W \times H}{5000})$.
- **Air Waybill (AWB) Generation:** Automatic assignment upon order manifesting and dispatching.
- **E-Way Bill Compliance:** Mandatory flag for consignments over ₹50,000 inter-state.
- **Real-Time Tracking Webhook:** Ingest carrier tracking updates to transition order states (`SHIPPED`, `OUT_FOR_DELIVERY`, `DELIVERED`, `RTO_INITIATED`).

---

## 2. PRISMA ORM SHIPMENT MODEL (`orders` schema)

```prisma
model Shipment {
  id              String    @id @default(uuid()) @db.Uuid
  orderId         String    @unique @map("order_id") @db.Uuid
  carrier         String    @default("MOCK") @db.VarChar(50)
  awbNumber       String    @unique @map("awb_number") @db.VarChar(100)
  labelUrl        String?   @map("label_url") @db.VarChar(500)
  manifestUrl     String?   @map("manifest_url") @db.VarChar(500)
  billableWeightG Int       @map("billable_weight_g")
  ewayBillNumber  String?   @map("eway_bill_number") @db.VarChar(100)
  currentStatus   String    @default("MANIFESTED") @map("current_status") @db.VarChar(50)
  trackingHistory Json      @default("[]") @map("tracking_history")
  dispatchedAt    DateTime? @map("dispatched_at")
  deliveredAt     DateTime? @map("delivered_at")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([awbNumber])
  @@map("shipments")
  @@schema("orders")
}
```

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [x] **Done:** Add `Shipment` model to Prisma schema (`schema.prisma`).
- [x] **Done:** Implement Carrier abstraction interface and `MockLogisticsAdapter` (`logistics.service.js`).
- [x] **Done:** Implement Volumetric freight calculator ($L \times W \times H / 5000$).
- [x] **Done:** Implement AWB dispatch flow with order FSM transition to `SHIPPED`.
- [x] **Done:** Expose Logistics tracking webhook endpoint (`POST /api/v1/orders/logistics/webhook`).

---

## 4. MODIFICATION & ISOLATION NOTES
- Switching shipping vendors is achieved simply by swapping the active carrier adapter class.
