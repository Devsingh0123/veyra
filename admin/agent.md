# ADMIN OPERATIONS SPA — AGENT SPECIFICATION & PROGRESS TRACKER

**App Name:** `@veyra/admin`  
**Port:** `5174`  
**Target API Gateway:** `http://localhost:3000/api/v1`  
**Status:** ARCHITECTURE READY 🚀  
**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, React Router DOM (Zero Zod)  
**Detailed Spec:** See [`ADMIN.md`](file:///c:/Users/HP/Desktop/New%20folder/admin/ADMIN.md) for complete architecture, RBAC matrix, and API contracts.

---

## 1. PURPOSE & ARCHITECTURE
Internal operations console for warehouse staff, catalog managers, and administrators:
- **Strict Role-Based Access Control (RBAC):** `SUPER_ADMIN`, `ADMIN`, `CATALOG_MANAGER`, `WAREHOUSE_STAFF`.
- **Product Catalog Management:** Category trees, brands, multi-variant SKU creation, HSN codes, and GST rates.
- **Inventory & Reservation Matrix:** Total vs reserved stock levels, instant inline quantity updates.
- **Order Lifecycle Management:** State machine advance (`CONFIRMED` -> `PROCESSING` -> `PACKED` -> `SHIPPED`), carrier dispatch, AWB tracking, and Section 46 CGST Tax Invoice printing.
- **Returns Inspection QC Console:** 7-day delivery return verification, photographic proof review, pass/reject QC, and Section 34 CGST Credit Note generation.
- **Direct API Gateway Communication:** All requests pass through the unified Gateway at port `3000`.

---

## 2. PRODUCTION FOLDER STRUCTURE
```text
admin/
├── src/
│   ├── api/
│   │   ├── client.js                 # Centralized fetch wrapper with JWT authorization
│   │   ├── auth.api.js               # Login & profile
│   │   ├── catalog.api.js            # Products, categories, brands
│   │   ├── inventory.api.js          # Stock levels & inline updates
│   │   ├── orders.api.js             # Order list, FSM advancement, Tax Invoice HTML
│   │   ├── logistics.api.js          # AWB assignment, carrier tracking
│   │   └── returns.api.js            # Return QC, inspection approval, Credit Note HTML
│   ├── components/
│   │   ├── common/                   # Badge, Button, Card, Modal, Table
│   │   └── layout/                   # Sidebar, Topbar, AdminLayout
│   ├── context/
│   │   └── AuthContext.jsx           # Global user authentication state
│   ├── pages/
│   │   ├── Login.jsx                 # Administrator login
│   │   ├── Dashboard.jsx             # Key operations KPIs & alerts
│   │   ├── catalog/                  # ProductList, ProductForm
│   │   ├── inventory/                # InventoryList with inline stock editor
│   │   ├── orders/                   # OrderList with FSM controls & invoice print
│   │   └── returns/                  # ReturnList with QC photo review & credit notes
│   ├── App.jsx                       # Route provider & protected guards
│   ├── main.jsx                      # DOM mount
│   └── index.css                     # Tailwind CSS tokens & styling
├── ADMIN.md                          # Master Admin specification & architecture guide
├── package.json
└── agent.md                          # This living tracker document
```

---

## 3. STATUS CHECKLIST

- [x] **Done:** Created master [`ADMIN.md`](file:///c:/Users/HP/Desktop/New%20folder/admin/ADMIN.md) specification with tech stack, RBAC matrix, and module maps.
- [x] **Done:** Cleaned `package.json` to eliminate `Zod` and third-party schema overhead.
- [ ] **Pending:** Implement API client wrapper with token handling ([`src/api/client.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/api/client.js)).
- [ ] **Pending:** Implement `AuthContext` and Login view.
- [ ] **Pending:** Implement modern dark-mode `AdminLayout` (Sidebar + Topbar).
- [ ] **Pending:** Implement Operations Dashboard view with KPI cards.
- [ ] **Pending:** Implement Catalog & SKU management views.
- [ ] **Pending:** Implement Inventory matrix with inline fast adjustments.
- [ ] **Pending:** Implement Orders management view with FSM actions and Tax Invoice printing.
- [ ] **Pending:** Implement Returns inspection console with QC workflow and Credit Note printing.

---

## 4. CHANGELOG & UPDATES
- **2026-10-06:** Created dedicated master `ADMIN.md` specification and cleaned dependencies (removed Zod).
