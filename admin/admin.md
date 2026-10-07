# VEYRA ADMIN PORTAL — ARCHITECTURAL PLAN & IMPLEMENTATION ROADMAP

**Application:** `@veyra/admin`  
**Application Type:** Standalone Single Page Application (SPA)  
**Port:** `5174`  
**Backend Target:** API Gateway (`http://localhost:3000/api/v1`)  
**Status:** SPECIFICATION COMPLETE 🚀  

> ### 📌 CURRENT STATUS & NEXT RESUME POINT
> - **Completed So Far:**
>   - [x] Standalone Vite 6 + React 18 setup on port `5174` (isolated project).
>   - [x] Tailwind CSS v4 configured via `@tailwindcss/vite` (zero `tailwind.config.js`).
>   - [x] Shadcn UI initialized with Base UI + Nova preset.
>   - [x] `cn` utility configured in [`src/lib/utils.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/lib/utils.js) with `clsx` and `tailwind-merge`.
>   - [x] Baseline [`src/store/axiosInstance.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/store/axiosInstance.js) and [`src/store/store.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/store/store.js).
>   - [x] `<Provider store={store}>` connected in [`src/main.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/main.jsx).
>   - [x] **Step 1: State & API Foundation (RTK Query + Axios) + Browser Routing**:
>     - Installed `react-router-dom` and set up standard browser routing with `createBrowserRouter` in [`src/routes/index.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/routes/index.jsx).
>     - Created [`src/store/baseApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/store/baseApi.js) with `axiosBaseQuery` linked to `axiosInstance`.
>     - Registered `baseApi.reducer` and `baseApi.middleware` in [`src/store/store.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/store/store.js).
>     - Connected `<RouterProvider router={router} />` in [`src/App.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/App.jsx).
>   - [x] **Step 2: Auth State & Endpoints (`authApi` & `authSlice`)**:
>     - Created [`src/features/auth/api/authApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/auth/api/authApi.js) with RTK Query endpoints for `login`, `getProfile`, and `logout`.
>     - Streamlined [`src/store/slices/authSlice.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/store/slices/authSlice.js) with synchronous state (`user`, `token`, `role`, `isAuthenticated`) and selectors.
>     - Synchronized credentials automatically with `localStorage`.
>   - [x] **Step 3: Login Interface (`LoginForm.jsx`)**:
>     - Added Shadcn `card` and `input` primitives in [`src/components/ui/`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/components/ui/).
>     - Built administrative login view in [`src/features/auth/components/LoginForm.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/auth/components/LoginForm.jsx) with 1-click test role presets (Super Admin, Inventory Manager, Order Operator).
>     - Connected to `useLoginMutation` and mounted `/login` in the router.
>   - [x] **Step 4: Layout Shell (`Sidebar`, `Topbar`, `AdminLayout`)**:
>     - Built collapsible [`src/components/layout/Sidebar.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/components/layout/Sidebar.jsx) with role-aware tab navigation and active route styling.
>     - Built [`src/components/layout/Topbar.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/components/layout/Topbar.jsx) with dynamic breadcrumbs, Gateway `:3000` status indicator, role badge, and session logout.
>     - Created [`src/components/layout/AdminLayout.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/components/layout/AdminLayout.jsx) shell wrapper with authentication route guard and `<Outlet />` rendering.
>     - Added [`src/store/slices/uiSlice.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/store/slices/uiSlice.js) wired into `store.js` for sidebar collapse state.
>   - [x] **Step 5: Operations Dashboard (`DashboardView`)**:
>     - Created [`src/features/dashboard/api/dashboardApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/dashboard/api/dashboardApi.js) with RTK Query aggregating GMV, order volume, dispatch queues, and returns.
>     - Built reusable metric component [`src/features/dashboard/components/StatCard.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/dashboard/components/StatCard.jsx).
>     - Built [`src/features/dashboard/components/DashboardView.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/dashboard/components/DashboardView.jsx) with live KPI tiles, recent order stream, and cluster topology mesh telemetry.
>     - Mounted `DashboardView` as index route in [`src/routes/index.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/routes/index.jsx).
>   - [x] **Step 6: Product Catalog & SKU Management (`CatalogView`)**:
>     - Added Shadcn `table.jsx` and `dialog.jsx` primitives in [`src/components/ui/`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/components/ui/).
>     - Created [`src/features/catalog/api/catalogApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/catalog/api/catalogApi.js) with RTK Query endpoints for `getProducts`, `getCategories`, and `createProduct`.
>     - Built [`src/features/catalog/components/ProductModal.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/catalog/components/ProductModal.jsx) with HSN codes (85183000), statutory GST selector (5%, 12%, 18%, 28%), and initial SKU stock.
>     - Built [`src/features/catalog/components/CatalogView.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/catalog/components/CatalogView.jsx) with SKU search, category filter, and in-stock badges.
>     - Mounted `CatalogView` on `/catalog` in [`src/routes/index.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/routes/index.jsx).
>   - [x] **Step 7: Inventory Concurrency Matrix (`InventoryView`)**:
>     - Created [`src/features/inventory/api/inventoryApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/inventory/api/inventoryApi.js) with RTK Query querying stock matrix and adjusting stock balances.
>     - Built [`src/features/inventory/components/StockAdjustModal.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/inventory/components/StockAdjustModal.jsx) supporting Restock (+), Write-Off (-), and Physical Cycle Audit (=) with audit reasons.
>     - Built [`src/features/inventory/components/InventoryView.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/inventory/components/InventoryView.jsx) displaying total on-hand, 15-minute checkout reservation holds, net available to sell, and version lock counters.
>     - Mounted `InventoryView` on `/inventory` in [`src/routes/index.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/routes/index.jsx).
>   - [x] **Step 8: Orders Pipeline & Dispatch Modal (`OrderView`)**:
>     - Created [`src/features/orders/api/ordersApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/orders/api/ordersApi.js) with RTK Query endpoints for `getAllOrders`, `updateOrderStatus`, and `createShipment`.
>     - Built [`src/features/orders/components/DispatchModal.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/orders/components/DispatchModal.jsx) for carrier selection (Delhivery, BlueDart, BlrLocal) and AWB label manifestation.
>     - Built [`src/features/orders/components/OrderView.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/orders/components/OrderView.jsx) with status filter tabs, search, and progressive FSM status advance actions.
>     - Mounted `OrderView` on `/orders` in [`src/routes/index.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/routes/index.jsx).
>   - [x] **Step 9: GST Invoicing & Returns QC (`ReturnView`)**:
>     - Built [`src/features/orders/components/InvoiceModal.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/orders/components/InvoiceModal.jsx) with Section 46 CGST Tax Invoice viewer and print capability.
>     - Created [`src/features/returns/api/returnsApi.js`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/returns/api/returnsApi.js) for reverse logistics and QC claims.
>     - Built [`src/features/returns/components/InspectModal.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/returns/components/InspectModal.jsx) for engineer defect review, customer photo inspection, and disposition decisions.
>     - Built [`src/features/returns/components/CreditNoteModal.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/returns/components/CreditNoteModal.jsx) with Section 34 CGST Credit Note document and GST reversal breakdowns.
>     - Built [`src/features/returns/components/ReturnView.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/features/returns/components/ReturnView.jsx) mounted on `/returns` in [`src/routes/index.jsx`](file:///c:/Users/HP/Desktop/New%20folder/admin/src/routes/index.jsx).
> - **Roadmap Status:** **ALL 9 ATOMIC STEPS COMPLETE & VERIFIED** 🎉
> - **Portal Port:** `5174` (Run `npm run dev` in `admin/` to launch).

---

## 1. TECH STACK SPECIFICATION

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Build Tool** | **Vite** | `^6.0.7` | Instant HMR development server, optimized ESM bundling |
| **UI Framework** | **React 18** | `^18.3.1` | Concurrent rendering, declarative component tree |
| **Styling** | **Tailwind CSS v4** | `^4.0.0` | Zero-config, CSS-first architecture via `@tailwindcss/vite` |
| **Design System** | **Shadcn UI** | Base UI + Nova | Accessible, customizable component primitives |
| **Class Merging** | **clsx + tailwind-merge** | `^2.1.1` / `^3.7.0` | Conflict-free conditional CSS class resolution (`cn`) |
| **Global State** | **Redux Toolkit** | `^2.13.0` | Centralized state management via `configureStore` |
| **Data Fetching** | **RTK Query** | Built into RTK | Automated caching, tag invalidation, auto-generated query/mutation hooks |
| **HTTP Transport** | **Axios** | `^1.20.0` | Custom instance with request/response interceptors & token injection |
| **Iconography** | **Lucide React** | `^1.52.0` | Clean, lightweight SVG icon system |
| **Animations** | **Framer Motion** | `^12.4.7` | Fluid tab shifts, modal springs, and micro-interactions |

---

## 2. PROJECT TOPOLOGY & FOLDER STRUCTURE

```text
admin/
├── src/
│   ├── components/
│   │   ├── ui/                       # Shadcn UI primitives (Button, Card, Dialog, etc.)
│   │   └── layout/                   # Layout shell components
│   │       ├── AdminLayout.jsx       # Main layout wrapper with sidebar & header
│   │       ├── Sidebar.jsx           # Role-based collapsible navigation sidebar
│   │       └── Topbar.jsx            # Header with breadcrumbs, service status, user profile
│   ├── store/                        # Global Redux & API infrastructure
│   │   ├── axiosInstance.js          # Configured Axios instance (JWT, interceptors)
│   │   ├── baseApi.js                # RTK Query root API slice with axiosBaseQuery
│   │   ├── store.js                  # Redux configureStore setup
│   │   └── slices/                   # Client-side UI & session slices
│   │       ├── authSlice.js          # Auth state (user, token, role)
│   │       └── uiSlice.js            # Sidebar toggle, active modal state
│   ├── features/                     # Domain-driven feature modules
│   │   ├── auth/                     # Authentication & role-based login
│   │   │   ├── components/LoginForm.jsx
│   │   │   └── api/authApi.js
│   │   ├── dashboard/                # Real-time metrics & system health
│   │   │   ├── components/DashboardView.jsx
│   │   │   ├── components/StatCard.jsx
│   │   │   └── api/dashboardApi.js
│   │   ├── catalog/                  # Products, variants, HSN & GST rates
│   │   │   ├── components/CatalogView.jsx
│   │   │   ├── components/ProductModal.jsx
│   │   │   └── api/catalogApi.js
│   │   ├── inventory/                # Live stock balance & 15-min reservation matrix
│   │   │   ├── components/InventoryView.jsx
│   │   │   ├── components/StockAdjustModal.jsx
│   │   │   └── api/inventoryApi.js
│   │   ├── orders/                   # Order FSM, AWB logistics & GST Section 46 invoices
│   │   │   ├── components/OrderView.jsx
│   │   │   ├── components/DispatchModal.jsx
│   │   │   ├── components/InvoiceModal.jsx
│   │   │   └── api/ordersApi.js
│   │   └── returns/                  # Reverse logistics, QC inspection & Credit Notes
│   │       ├── components/ReturnView.jsx
│   │       ├── components/InspectModal.jsx
│   │       ├── components/CreditNoteModal.jsx
│   │       └── api/returnsApi.js
│   ├── lib/
│   │   └── utils.js                  # Standard cn helper (clsx + tailwind-merge)
│   ├── App.jsx                       # Root view router / tab switcher
│   ├── main.jsx                      # React DOM mount with Redux Provider
│   └── index.css                     # Tailwind CSS v4 & Shadcn design tokens
├── index.html
├── package.json                      # Isolated package manifest (no workspace hoisting)
├── vite.config.js                    # Vite configuration with @tailwindcss/vite and @ alias
├── jsconfig.json                     # Path alias definition (@/* -> ./src/*)
├── components.json                   # Shadcn UI configuration file
└── PLANNING.md                       # This dedicated plan
```

---

## 3. ATOMIC STEP-BY-STEP ROADMAP (ONE BY ONE)

- [x] **Step 1: State & API Foundation (RTK Query + Axios) + Browser Routing**
  - Set up `src/store/baseApi.js` with `axiosBaseQuery` connecting RTK Query to our configured `axiosInstance`.
  - Register `baseApi.reducer` and `baseApi.middleware` in `src/store/store.js`.
  - Configured `createBrowserRouter` via `react-router-dom` in `src/routes/index.jsx` and mounted via `<RouterProvider />` in `src/App.jsx`.
  - Verified clean build and boot without errors.

- [x] **Step 2: Auth State & Endpoints (`authApi` & `authSlice`)**
  - Defined `authApi` with `login` mutation, `getProfile` query, and `logout` mutation in `src/features/auth/api/authApi.js`.
  - Cleaned `authSlice` to manage `user`, `token`, `role`, and `isAuthenticated` with selectors in `src/store/slices/authSlice.js`.
  - Automatically syncs token with `localStorage` and `axiosInstance`.
  - Verified clean build and bundle.

- [x] **Step 3: Login Interface (`LoginForm.jsx`)**
  - Added Shadcn `input.jsx` and `card.jsx` components in `src/components/ui/`.
  - Built administrative login view with 1-click test role presets in `src/features/auth/components/LoginForm.jsx`.
  - Connected `useLoginMutation`, with automatic redirection, session storage, and loading/error states.
  - Verified clean build and bundle.

- [x] **Step 4: Layout Shell (`Sidebar`, `Topbar`, `AdminLayout`)**
  - Built collapsible `Sidebar.jsx` with role-aware tab navigation, expand/collapse toggling, and active route highlights.
  - Built `Topbar.jsx` with breadcrumbs, live Gateway `:3000` status indicator, role badge, and session logout.
  - Created `AdminLayout.jsx` wrapper with authentication route guard and `<Outlet />` area.
  - Wired `uiSlice.js` into Redux `store.js`.
  - Verified clean build and bundle.

- [x] **Step 5: Operations Dashboard (`DashboardView`)**
  - Created `dashboardApi.js` metrics query in `src/features/dashboard/api/dashboardApi.js` connecting to order service and returns telemetry.
  - Built reusable `StatCard.jsx` metric tiles (GMV, Orders, Dispatches, QC claims).
  - Created `DashboardView.jsx` with recent order telemetry stream, cluster mesh topology, and quick operation links.
  - Verified clean build and bundle.

- [x] **Step 6: Product Catalog & SKU Management (`CatalogView`)**
  - Added Shadcn `table.jsx` and accessible `dialog.jsx` primitives in `src/components/ui/`.
  - Created `catalogApi.js` with `getProducts`, `getCategories`, and `createProduct` mutations.
  - Built `ProductModal.jsx` with statutory HSN codes, GST rate selectors (5%, 12%, 18%, 28%), and SKU pricing.
  - Built `CatalogView.jsx` with search, category filtering, inventory status pills, and wired to `/catalog`.
  - Verified clean build and bundle.

- [x] **Step 7: Inventory Concurrency Matrix (`InventoryView`)**
  - Created `inventoryApi.js` in `src/features/inventory/api/inventoryApi.js` calculating on-hand, reserved, and net available stock.
  - Built `StockAdjustModal.jsx` supporting Restock, Write-off, and Cycle Count operations with audit logging.
  - Built `InventoryView.jsx` with KPI cards, reservation lock counters, and concurrency version indicators.
  - Mounted on `/inventory` in `src/routes/index.jsx`.
  - Verified clean build and bundle.

- [x] **Step 8: Orders Pipeline & Dispatch Modal (`OrderView`)**
  - Created `ordersApi.js` with `getAllOrders`, `updateOrderStatus`, and `createShipment` mutations.
  - Built `DispatchModal.jsx` for carrier selection (Delhivery, BlueDart, BlrLocal) and instant AWB tracking assignment.
  - Built `OrderView.jsx` with progressive FSM transitions (Mark Processing -> Mark Packed -> Dispatch AWB -> Mark Out for Delivery -> Delivered).
  - Mounted on `/orders` in `src/routes/index.jsx`.
  - Verified clean build and bundle.

- [x] **Step 9: GST Invoicing & Returns QC (`ReturnView`)**
  - Created Section 46 CGST Tax Invoice viewer/print modal `InvoiceModal.jsx`.
  - Created `returnsApi.js` connecting reverse logistics and QC disposition endpoints.
  - Built `InspectModal.jsx` for warehouse engineer defect verification and disposition.
  - Built `CreditNoteModal.jsx` with Section 34 CGST Act compliant credit note layout.
  - Built `ReturnView.jsx` mounted on `/returns` in `src/routes/index.jsx`.
  - Verified clean build and bundle across all 9 steps.

---

## 4. ARCHITECTURAL CONSTRAINTS & PRINCIPLES
1. **Completely Standalone SPA**: Zero shared dependencies or monorepo workspace hoisting with Storefront.
2. **API Gateway Entrypoint**: All requests route through `http://localhost:3000/api/v1`.
3. **RTK Query + Axios Harmony**: All queries route through `axiosInstance` for unified interceptors and Bearer token management.
4. **Shadcn UI at Full Potential**: Clean, accessible component primitives without inline ad-hoc utility hacks.

