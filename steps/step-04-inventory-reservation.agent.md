# STEP 04: INVENTORY CONCURRENCY & RESERVATION ENGINE

**Status:** PENDING ⏳  
**Domain:** Stock Locking, Concurrency Prevention, 15-Minute Expiry Holds, BullMQ Auto-Release  
**Target Path:** [`services/catalog-service`](file:///c:/Users/HP/Desktop/New%20folder/services/catalog-service) & Worker queue  
**Database Schema:** `catalog` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
Eliminate overselling race conditions when multiple customers buy the last remaining stock:
- **Zero Raw SQL Concurrency Control:** Managed via Prisma Interactive Transactions (`prisma.$transaction`) with version-based atomic updates (`updateMany`).
- **Hold Mechanism:** 15-minute reservation tokens created during order checkout submission.
- **Automated Rollback:** BullMQ delayed job automatically decrements `reservedQuantity` and marks reservation `EXPIRED` if payment is not completed within 15 minutes.
- **Commit on Payment:** When order is confirmed, `stockQuantity` and `reservedQuantity` are both decremented, and reservation status becomes `FULFILLED`.

---

## 2. PRISMA ORM MODELS (in `catalog-service/prisma/schema.prisma`)

```prisma
enum ReservationStatus {
  ACTIVE
  FULFILLED
  RELEASED
  EXPIRED

  @@schema("catalog")
}

model InventoryReservation {
  id               String            @id @default(uuid()) @db.Uuid
  reservationToken String            @unique @map("reservation_token") @db.VarChar(100)
  variantId        String            @map("variant_id") @db.Uuid
  quantity         Int
  status           ReservationStatus @default(ACTIVE)
  expiresAt        DateTime          @map("expires_at")
  createdAt        DateTime          @default(now()) @map("created_at")
  updatedAt        DateTime          @updatedAt @map("updated_at")

  @@index([variantId])
  @@index([expiresAt])
  @@map("inventory_reservations")
  @@schema("catalog")
}
```

---

## 3. CORE ORM WORKFLOWS

### Stock Reservation via Prisma Transaction:
```javascript
export async function reserveStock(prisma, { variantId, quantity, reservationToken, expiryMinutes = 15 }) {
  return await prisma.$transaction(async (tx) => {
    const inv = await tx.inventory.findUnique({ where: { variantId } });
    if (!inv || (inv.stockQuantity - inv.reservedQuantity) < quantity) {
      throw new Error('INSUFFICIENT_STOCK');
    }

    const updated = await tx.inventory.updateMany({
      where: {
        variantId,
        version: inv.version,
        stockQuantity: { gte: inv.reservedQuantity + quantity }
      },
      data: {
        reservedQuantity: { increment: quantity },
        version: { increment: 1 }
      }
    });

    if (updated.count === 0) throw new Error('CONCURRENCY_CONFLICT_RETRY');

    return await tx.inventoryReservation.create({
      data: {
        reservationToken,
        variantId,
        quantity,
        expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000)
      }
    });
  });
}
```

---

## 4. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Add `InventoryReservation` model to `catalog-service/prisma/schema.prisma`.
- [ ] **Pending:** Run Prisma migration for reservation table.
- [ ] **Pending:** Implement `reserveStock`, `releaseStock`, and `fulfillStock` services.
- [ ] **Pending:** Set up BullMQ queue `inventory-reservation-expiry` in catalog service.
- [ ] **Pending:** Implement worker to process expired reservations on schedule.
- [ ] **Pending:** Expose internal service endpoints for reservation creation and release.

---

## 5. MODIFICATION & ISOLATION NOTES
- Adjusting reservation TTL (e.g. from 15 to 10 minutes) only requires changing the constant in this service.
