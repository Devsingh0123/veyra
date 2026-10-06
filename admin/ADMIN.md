# VEYRA ADMIN PORTAL — ARCHITECTURE & TECHNICAL SPECIFICATION

**Application Name:** `@veyra/admin`  
**Application Type:** Single Page Application (SPA)  
**Port:** `5174`  
**Target API Gateway:** `http://localhost:3000/api/v1`  
**Status:** ARCHITECTURE DESIGNED & READY FOR BUILD 🚀  

---

## 1. TECH STACK

| Layer | Technology | Version | Purpose / Rationale |
|---|---|---|---|
| **Runtime & Core** | React 18 | `^18.3.1` | Concurrent rendering, hooks, fast component updates |
| **Build Tool & Bundler** | Vite | `^6.0.7` | Sub-second HMR, fast production builds |
| **Routing** | React Router DOM | `^6.28.1` | Declarative client-side routing, protected route guards |
| **Styling** | Tailwind CSS + PostCSS | `^3.4.17` | Utility-first responsive styling with curated luxury dark/light palette |
| **Icons** | Lucide React | `^0.474.0` | Clean, modern iconography |
| **HTTP Client** | Native Fetch API | Native ES6+ | Lightweight, zero-dependency REST requests with bearer token injection |
| **Validation** | Native JavaScript | Vanilla JS | Strict user constraint: **Zero `Zod`** dependency. Clean, readable native checks |

---

## 2. COLOR PALETTE & DESIGN SYSTEM

The Admin Portal uses a curated luxury dark-mode operations palette tailored for fast scanning, high contrast, and reduced eye fatigue:

- **Background:** Slate / Charcoal (`#0f172a`, `#1e293b`)
- **Cards / Panels:** Dark Slate (`#1e293b`) with subtle borders (`#334155`)
- **Accent / Primary:** Veyra Gold (`#d4af37`) & Electric Indigo (`#6366f1`)
- **Status Accents:**
  - `CONFIRMED` / `ACTIVE`: Emerald (`#10b981`)
  - `PENDING` / `PROCESSING`: Amber (`#f59e0b`)
  - `SHIPPED`: Blue (`#3b82f6`)
  - `CANCELLED` / `REJECTED`: Rose (`#f43f5e`)
  - `RETURN_REQUESTED`: Purple (`#a855f7`)

---

## 3. ROLE-BASED ACCESS CONTROL (RBAC)

The portal dynamically shows navigation items and protects route transitions based on the user's role obtained from the Auth Service (`:3001` via Gateway `:3000`):

| Role | Access Permissions |
|---|---|
| **`SUPER_ADMIN`** | Unrestricted access across all domains: Users, Catalog, Inventory, Orders, Finances, GST Reports |
| **`ADMIN`** | Catalog management, Inventory controls, Order state advancement, Returns QC, Invoicing |
| **`CATALOG_MANAGER`** | Categories, Brands, Products, Variants, Attributes, Media links |
| **`WAREHOUSE_STAFF`** | Inventory stock intake, Order Packing/Dispatch, AWB generation, Return item inspection QC |

---

## 4. FOLDER STRUCTURE

```text
admin/
├── src/
│   ├── api/
│   │   ├── client.js                 # Centralized fetch wrapper with automatic JWT header & 401 handling
│   │   ├── auth.api.js               # Login, logout, refresh, profile
│   │   ├── catalog.api.js            # Products, categories, brands, variants
│   │   ├── inventory.api.js          # Stock levels, reservations, quick adjustments
│   │   ├── orders.api.js             # Order listing, FSM state updates, invoice HTML
│   │   ├── logistics.api.js          # AWB creation, tracking status
│   │   └── returns.api.js            # Return requests, QC approval/rejection, Credit Notes
│   ├── components/
│   │   ├── common/
│   │   │   ├── Badge.jsx             # Status pill badges
│   │   │   ├── Button.jsx            # Standard button variants
│   │   │   ├── Card.jsx              # Panel wrapper
│   │   │   ├── Modal.jsx             # Reusable dialog modal
│   │   │   └── Table.jsx             # Clean data table
│   │   └── layout/
│   │       ├── Sidebar.jsx           # Nav links with active route indicator & role filtering
│   │       ├── Topbar.jsx            # Breadcrumbs, service health badge, user profile & logout
│   │       └── AdminLayout.jsx       # Layout shell wrapping protected routes
│   ├── context/
│   │   └── AuthContext.jsx           # Global user authentication state and login/logout handlers
│   ├── pages/
│   │   ├── Login.jsx                 # Secure administrator login
│   │   ├── Dashboard.jsx             # GMV, active orders count, low-stock alerts, health status
│   │   ├── catalog/
│   │   │   ├── ProductList.jsx       # Products table with filters, search & stock status
│   │   │   └── ProductForm.jsx       # Product builder (categories, brands, pricing, GST rate)
│   │   ├── inventory/
│   │   │   └── InventoryList.jsx     # Stock quantity, reserved quantity, inline stock editor
│   │   ├── orders/
│   │   │   ├── OrderList.jsx         # Orders table with status filter, invoice & dispatch actions
│   │   │   └── OrderDetail.jsx       # Immutable snapshots, FSM advance controls, AWB tracker
│   │   └── returns/
│   │       ├── ReturnList.jsx        # Returns queue awaiting warehouse inspection
│   │       └── ReturnDetail.jsx      # Customer photos, reason, approve/reject QC, Credit Note view
│   ├── App.jsx                       # Route provider & AuthGuard
│   ├── main.jsx                      # React DOM root mounting
│   └── index.css                     # Tailwind CSS entrypoint
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── ADMIN.md                          # Master Admin architecture and tech stack guide
└── agent.md                          # Living progress tracker
```

---

## 5. CORE MODULES & WORKFLOWS

### Module 1: Authentication & Gateway Interceptor (`src/api/client.js`)
- Communicates directly with API Gateway (`http://localhost:3000/api/v1`).
- Stores access token in memory/localStorage.
- Injects `Authorization: Bearer <token>` and `x-user-id` on all outgoing requests.
- Handles `401 Unauthorized` responses by automatically redirecting to `/login`.

### Module 2: Executive Dashboard (`src/pages/Dashboard.jsx`)
- **Metric Cards:**
  - Total Active Products
  - Total Orders Today & Total Revenue (₹)
  - Critical Stock Alerts (Items with $< 10$ available units)
  - Pending Return Inspections
- **Quick Links:** Immediate dispatch shortcuts for orders in `CONFIRMED` / `PROCESSING` state.

### Module 3: Catalog & SKU Matrix (`src/pages/catalog/`)
- Interacts with `@veyra/catalog-service` (`/api/v1/catalog`).
- List view with category filter, search by product name/slug.
- Create/Edit products with HSN code, GST rate (e.g. 5%, 12%, 18%, 28%), and variants (MRP, Selling Price, SKU, dimensions).

### Module 4: Inventory & Hold Monitor (`src/pages/inventory/`)
- Real-time stock display: Total Stock vs Reserved Holds.
- Quick inline adjustment: Increment or decrement available stock without reloading.

### Module 5: Order Lifecycle & Invoicing Console (`src/pages/orders/`)
- Interacts with `@veyra/order-service` (`/api/v1/orders`).
- Filter by status (`PENDING`, `CONFIRMED`, `PROCESSING`, `PACKED`, `SHIPPED`, `DELIVERED`, `CANCELLED`).
- Order Detail view:
  - Immutable historical address & line items display.
  - One-click Section 46 CGST **Tax Invoice** view/print (`GET /api/v1/orders/:id/invoice/html`).
  - One-click **Carrier Dispatch & AWB Generation** (`POST /api/v1/orders/admin/:id/shipment`).
  - FSM status advancement button with legal transition guards.

### Module 6: Returns & Credit Note Console (`src/pages/returns/`)
- Interacts with `@veyra/order-service` (`/api/v1/orders/returns/all`).
- View photographic evidence submitted by customer.
- QC Actions:
  - **Approve Inspection & Issue Refund:** Moves state to `REFUNDED` and automatically generates Section 34 CGST Credit Note (`CN/26-27/000001`).
  - **Reject Inspection:** Records rejection note and reverts order status to `DELIVERED`.
  - View printable HTML Credit Note directly.

---

## 6. API INTEGRATION MATRIX

| Admin UI Feature | Gateway Route | Target Microservice | Method |
|---|---|---|---|
| Admin Login | `/api/v1/auth/login` | `@veyra/auth-service` | `POST` |
| List Products | `/api/v1/catalog/products` | `@veyra/catalog-service` | `GET` |
| Create Product | `/api/v1/catalog/products` | `@veyra/catalog-service` | `POST` |
| Adjust Stock | `/api/v1/catalog/inventory/:variantId` | `@veyra/catalog-service` | `PATCH` |
| List All Orders | `/api/v1/orders/admin/all` | `@veyra/order-service` | `GET` |
| Advance Order FSM | `/api/v1/orders/admin/:id/status` | `@veyra/order-service` | `PATCH` |
| Generate AWB Shipment | `/api/v1/orders/admin/:id/shipment` | `@veyra/order-service` | `POST` |
| Print Tax Invoice | `/api/v1/orders/:id/invoice/html` | `@veyra/order-service` | `GET` |
| List Return Requests | `/api/v1/orders/returns/all` | `@veyra/order-service` | `GET` |
| Process Return QC | `/api/v1/orders/admin/returns/:id/status`| `@veyra/order-service` | `PATCH` |
| Print Credit Note | `/api/v1/orders/returns/:id/credit-note/html` | `@veyra/order-service` | `GET` |

---

## 7. STEP-BY-STEP IMPLEMENTATION CHECKLIST

- [ ] **Step 1:** Establish API Client ([`src/api/client.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/api/client.js)) and Domain API connectors.
- [ ] **Step 2:** Build Authentication Context and Route Guard.
- [ ] **Step 3:** Build modern dark-theme Admin Layout (Sidebar, Topbar with health check, Breadcrumbs).
- [ ] **Step 4:** Build Operations Dashboard with live KPIs.
- [ ] **Step 5:** Build Catalog Management pages (Product list & creation modal).
- [ ] **Step 6:** Build Inventory Management with inline stock updates.
- [ ] **Step 7:** Build Orders Management (List, FSM State advance, Print Tax Invoice, AWB Dispatch).
- [ ] **Step 8:** Build Returns & Credit Note Console (Inspect photos, Approve/Reject QC, Print Credit Note).
