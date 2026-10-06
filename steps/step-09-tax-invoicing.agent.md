# STEP 09: AUTOMATED TAX INVOICING ENGINE

**Status:** PENDING ⏳  
**Domain:** Statutory Indian Tax Invoicing, Section 46 CGST Compliance, Consecutive FY Serial Numbers, PDF Generation, S3 Storage  
**Target Path:** [`services/order-service`](file:///c:/Users/HP/Desktop/New%20folder/services/order-service)  
**Database Schema:** `orders` (PostgreSQL via Prisma ORM)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Section 46 CGST Compliance:**
  - Unique consecutive numbering per Financial Year (April 1 to March 31): e.g. `VEY/26-27/000491`.
  - Mandatory seller GSTIN, registered warehouse state code, HSN codes, and itemized CGST/SGST/IGST breakdown.
- **Headless PDF Generation:** Render high-definition printable PDF invoices via Puppeteer / PDFKit.
- **Permanent Cloud Storage:** Invoices uploaded to S3 / Cloudflare R2 bucket with immutable signed URLs generated on-demand.

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
  createdAt     DateTime @default(now()) @map("created_at")

  @@map("tax_invoices")
  @@schema("orders")
}
```

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Add `TaxInvoice` model to `order-service/prisma/schema.prisma` and run migration.
- [ ] **Pending:** Implement atomic FY sequence counter in Prisma.
- [ ] **Pending:** Design HTML/CSS compliant Indian Tax Invoice template.
- [ ] **Pending:** Implement PDF generator worker with Puppeteer.
- [ ] **Pending:** Implement S3 invoice document upload and presigned URL access endpoint.
- [ ] **Pending:** Trigger invoice generation on `order.status = CONFIRMED`.

---

## 4. MODIFICATION & ISOLATION NOTES
- Changes to invoice visual styling or legal disclaimers only require editing the HTML template in `src/templates/invoice.html`.
