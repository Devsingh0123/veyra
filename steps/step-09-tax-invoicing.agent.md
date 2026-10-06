# STEP 09: AUTOMATED TAX INVOICING ENGINE

**Status:** DONE ✅  
**Domain:** Statutory Indian Tax Invoicing, Section 46 CGST Compliance, Consecutive FY Serial Numbers, HTML/PDF Rendering  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service)  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Section 46 CGST Compliance:**
  - Unique consecutive numbering per Financial Year (April 1 to March 31): e.g. `VEY/26-27/000491`.
  - Mandatory seller GSTIN, registered warehouse state code, HSN codes, and itemized CGST/SGST/IGST breakdown.
- **Printable Compliant HTML Template:** Renders clean, high-definition A4 printable tax invoice directly in browser.
- **Atomic Sequence Counter:** `invoice_sequences` table in PostgreSQL ensures sequential numbering without collisions.

---

## 2. PRISMA ORM INVOICE MODEL (`orders` schema)

```prisma
model TaxInvoice {
  id            String   @id @default(uuid()) @db.Uuid
  orderId       String   @unique @map("order_id") @db.Uuid
  invoiceNumber String   @unique @map("invoice_number") @db.VarChar(50)
  financialYear String   @map("financial_year") @db.VarChar(10) // e.g. "26-27"
  invoiceDate   DateTime @default(now()) @map("invoice_date")
  taxableAmount Decimal  @map("taxable_amount") @db.Decimal(10, 2)
  cgstAmount    Decimal  @default(0) @map("cgst_amount") @db.Decimal(10, 2)
  sgstAmount    Decimal  @default(0) @map("sgst_amount") @db.Decimal(10, 2)
  igstAmount    Decimal  @default(0) @map("igst_amount") @db.Decimal(10, 2)
  totalAmount   Decimal  @map("total_amount") @db.Decimal(10, 2)
  pdfUrl        String?  @map("pdf_url") @db.VarChar(500)
  sellerGstin   String   @default("07AABCV1234F1Z5") @map("seller_gstin") @db.VarChar(20)
  createdAt     DateTime @default(now()) @map("created_at")

  order Order @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@index([financialYear])
  @@map("tax_invoices")
  @@schema("orders")
}

model InvoiceSequence {
  id            String   @id @default(uuid()) @db.Uuid
  financialYear String   @unique @map("financial_year") @db.VarChar(10)
  currentNumber Int      @default(0) @map("current_number")
  updatedAt     DateTime @updatedAt @map("updated_at")

  @@map("invoice_sequences")
  @@schema("orders")
}
```

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [x] **Done:** Add `TaxInvoice` and `InvoiceSequence` models to `order-service/prisma/schema.prisma`.
- [x] **Done:** Implement atomic FY sequence counter in Prisma (`invoice.service.js`).
- [x] **Done:** Design HTML/CSS compliant Indian Tax Invoice template with Section 46 CGST rules.
- [x] **Done:** Expose invoice data (`GET /:id/invoice`) and printable HTML view (`GET /:id/invoice/html`).

---

## 4. MODIFICATION & ISOLATION NOTES
- Changes to invoice visual styling or legal disclaimers only require editing the HTML template in `src/templates/invoice.html`.
