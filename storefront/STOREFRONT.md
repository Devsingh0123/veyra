# VEYRA STOREFRONT — ARCHITECTURAL PLAN & IMPLEMENTATION ROADMAP

**Application:** `@veyra/storefront`  
**Application Type:** Standalone Single Page Application (SPA)  
**Port:** `5173`  
**Backend Target:** API Gateway (`http://localhost:3000/api/v1`)  
**Status:** SPECIFICATION COMPLETE 🚀  

> ### 📌 CURRENT STATUS & NEXT RESUME POINT
> - **Completed So Far:**
>   - [x] **Step 0:** Project Scaffolding & Setup (`package.json`, Vite 6, Tailwind CSS v4, Lucide, Router).
>   - [x] **Step 1:** State & API Gateway Integration (RTK Query, Axios with automated `x-session-id` guest engine, `cartSlice`, `authSlice`, `uiSlice`, Redux `<Provider>` wired).
>   - [x] **Step 2:** Navigation Chrome & Layout Shell (`Header`, `MegaMenu`, `MobileNav`, `Footer`, `StorefrontLayout`).
>   - [x] **Step 3:** Homepage Discovery & Featured Showcases (`HeroBanner`, `FeaturedCategories`, `ProductCard`, `HomeView` mounted at `/`).
> - **Rule:** Build strictly **one small atomic step at a time** — no extra code without user confirmation.
> - **Immediate Next Step on Resume:** **Step 4: Product Discovery & Catalog Listing (`CatalogView` / PLP)** — Build faceted `FilterSidebar`, high-converting product grid, search & category filtering, and mount on `/catalog`.

---

## 1. TECH STACK SPECIFICATION

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Build Tool** | **Vite** | `^6.0.7` | Fast HMR dev server on port `5173`, optimized ESM production bundle |
| **UI Framework** | **React 18** | `^18.3.1` | Concurrent rendering, declarative component tree |
| **Styling** | **Tailwind CSS v4** | `^4.0.0` | Zero-config, CSS-first architecture via `@tailwindcss/vite` |
| **UI Components** | **shadcn UI** | `cva + cn` | Accessible, customizable component primitives (`Button`, `Badge`, `Card`, `Input`, `Separator`) |
| **Routing** | **React Router DOM** | `^7.18.4` | Standard `createBrowserRouter` + `<RouterProvider />` |
| **Global State** | **Redux Toolkit** | `^2.13.0` | Cart management, guest sessions, active modals, client auth |
| **Data Fetching** | **RTK Query + Axios** | Built into RTK / `^1.20.0` | Automated caching, tag invalidation, unified interceptors & `x-session-id` injection |
| **Iconography** | **Lucide React** | `^1.52.0` | Modern, lightweight SVG icon system |
| **Payments** | **Razorpay Checkout** | SDK Script | UPI, Netbanking, Cards & Cash on Delivery (COD) |

---

## 2. PROJECT TOPOLOGY & FOLDER STRUCTURE

```text
storefront/
├── src/
│   ├── components/
│   │   ├── common/                   # Reusable UI primitives (Button, Input, Badge, Modal)
│   │   └── layout/                   # Global layout chrome
│   │       ├── StorefrontLayout.jsx  # Root layout with Header, Footer, and CartDrawer
│   │       ├── Header.jsx            # Sticky navigation header with search & badges
│   │       ├── MegaMenu.jsx          # Category discovery navigation menu
│   │       ├── MobileNav.jsx         # Mobile drawer menu
│   │       └── Footer.jsx            # Trust badges, links, statutory GST compliance note
│   ├── store/                        # Centralized Redux & API state
│   │   ├── axiosInstance.js          # Custom Axios with x-session-id & token injection
│   │   ├── baseApi.js                # Root RTK Query slice with axiosBaseQuery
│   │   ├── store.js                  # Redux configureStore
│   │   └── slices/
│   │       ├── cartSlice.js          # Cart drawer open/close, guest session UUID
│   │       ├── authSlice.js          # Customer login/token management
│   │       └── uiSlice.js            # Modals, mobile menu state
│   ├── features/                     # Feature domain modules
│   │   ├── home/                     # Homepage discovery
│   │   │   └── components/HomeView.jsx
│   │   ├── catalog/                  # Product listing (PLP) & filters
│   │   │   ├── components/ProductCard.jsx
│   │   │   ├── components/FilterSidebar.jsx
│   │   │   ├── components/CatalogView.jsx
│   │   │   └── api/catalogApi.js
│   │   ├── product/                  # Product detail page (PDP) & variant selector
│   │   │   ├── components/ProductDetailView.jsx
│   │   │   ├── components/VariantSelector.jsx
│   │   │   ├── components/PinCodeChecker.jsx
│   │   │   └── api/productApi.js
│   │   ├── cart/                     # Slide-over cart drawer & quantity controls
│   │   │   ├── components/CartDrawer.jsx
│   │   │   ├── components/CartItem.jsx
│   │   │   └── api/cartApi.js
│   │   ├── checkout/                 # 3-step checkout accordion & Razorpay
│   │   │   ├── components/CheckoutView.jsx
│   │   │   ├── components/AddressStep.jsx
│   │   │   ├── components/OrderSummaryStep.jsx
│   │   │   ├── components/PaymentStep.jsx
│   │   │   └── api/checkoutApi.js
│   │   └── account/                  # Customer order tracking & returns
│   │       ├── components/AccountView.jsx
│   │       ├── components/OrderTracker.jsx
│   │       ├── components/ReturnRequestModal.jsx
│   │       └── api/accountApi.js
│   ├── lib/
│   │   └── utils.js                  # Standard cn helper (clsx + tailwind-merge)
│   ├── routes/
│   │   └── index.jsx                 # createBrowserRouter route definitions
│   ├── App.jsx                       # RouterProvider root mount
│   ├── main.jsx                      # React DOM render with Redux Provider
│   └── index.css                     # Tailwind CSS v4 tokens & global styles
├── index.html
├── package.json                      # Isolated package manifest (no workspace hoisting)
├── vite.config.js                    # Vite config with @tailwindcss/vite & @ alias
├── jsconfig.json                     # Path alias definition (@/* -> ./src/*)
├── .gitignore
└── STOREFRONT.md                     # This authoritative roadmap
```

---

## 3. ATOMIC STEP-BY-STEP ROADMAP (ONE BY ONE)

- [x] **Step 0: Project Scaffolding & Dependencies Setup**
  - Initialize isolated `package.json` with React 18, Vite 6, Tailwind CSS v4, Redux Toolkit, Axios, Lucide React, and React Router.
  - Create `vite.config.js` on port `5173` with `@` path alias.
  - Set up `src/index.css` with Tailwind CSS v4 and `src/lib/utils.js` (`cn` helper).
  - Verify clean boot on port `5173`.

- [x] **Step 1: State & API Gateway Integration (RTK Query + Axios + Guest Session Engine)**
  - Create `src/store/axiosInstance.js` with automated guest session UUID (`x-session-id`) generation/persisting.
  - Set up `src/store/baseApi.js` with `axiosBaseQuery` connecting to API Gateway (`http://localhost:3000/api/v1`).
  - Wire Redux `store.js` and connect `<Provider>` in `main.jsx`.

- [x] **Step 2: Navigation Chrome & Layout Shell (`Header`, `MegaMenu`, `Footer`, `StorefrontLayout`)**
  - Build sticky `Header` with logo, real-time search input, account button, and cart badge indicator.
  - Build category `MegaMenu` and responsive `MobileNav` drawer.
  - Build trust-centered `Footer` with statutory GST compliance note and customer guarantees.
  - Create `StorefrontLayout` wrapper with `<Outlet />`.

- [x] **Step 3: Homepage Discovery & Featured Showcases (`HomeView`)**
  - Build hero promotion banner with fluid call-to-action buttons.
  - Build featured category cards grid.
  - Build trending products showcase with price tags and quick-add actions.
  - Mount on root `/` route.

- [ ] **Step 4: Product Discovery & Catalog Listing (`CatalogView` / PLP)**
  - Create `catalogApi` with search and category filtering queries.
  - Build faceted `FilterSidebar` (price slider/brackets, in-stock toggle, category chips).
  - Build high-converting `ProductCard` with rating badges, MRP discount tags, and stock alert indicators.
  - Mount on `/catalog` and `/c/:slug` routes.

- [ ] **Step 5: Rich Product Detail Page (`ProductDetailView` / PDP)**
  - Create `productApi` to fetch single product details by slug.
  - Build multi-image gallery with zoom/thumbnail carousel.
  - Build `VariantSelector` with live SKU switching and price recalculation.
  - Build 6-digit Indian PIN code delivery serviceability checker.
  - Mount on `/product/:slug` route.

- [ ] **Step 6: Slide-Over Bag Drawer & Cart State (`CartDrawer`)**
  - Create `cartApi` connecting to Cart Service (`:3003`) via API Gateway.
  - Build slide-over `CartDrawer` with quantity increment/decrement, line-item removal, and animated empty states.
  - Build free delivery threshold progress indicator (e.g., "Add ₹499 more for FREE delivery").
  - Connect cart drawer toggle to Redux `cartSlice`.

- [ ] **Step 7: 3-Step Checkout Accordion (`CheckoutView`)**
  - Create `checkoutApi` with quote calculations and tax breakdown.
  - **Step 1:** Address selection with 6-digit PIN code auto-fill.
  - **Step 2:** Order Summary with transparent Section 46 CGST/SGST breakdown.
  - **Step 3:** Payment method selection (Razorpay Online vs COD with ₹49 handling fee).
  - Mount on `/checkout` route.

- [ ] **Step 8: Payment Gateway & Order Confirmation (`PaymentModal` / `OrderSuccessView`)**
  - Integrate dynamic Razorpay Checkout JS modal for UPI/Card/Netbanking payments.
  - Build `OrderSuccessView` displaying order reference (`VYR-2026-XXXX`), estimated delivery date, and order tracking link.
  - Mount on `/order-success` route.

- [ ] **Step 9: Customer Account & Order Tracking Portal (`AccountView`)**
  - Build order history view with live checkpoint telemetry (Placed &rarr; Packed &rarr; Shipped &rarr; Delivered).
  - Build 1-click printable Section 46 Tax Invoice viewer.
  - Build 7-day return request filing modal with photo defect upload and reason dropdown.
  - Mount on `/account` route.

---

## 4. ARCHITECTURAL CONSTRAINTS & PRINCIPLES
1. **Completely Standalone SPA**: Runs independently on port `5173`. Zero code sharing or workspace dependencies with Admin or Storefront.
2. **API Gateway Entrypoint**: All requests route through `http://localhost:3000/api/v1`.
3. **Seamless Guest-to-User Transition**: Guest carts use a persistent UUID in the `x-session-id` header; when a user logs in, the backend merges guest cart items automatically.
4. **Mobile-First UX**: Responsive touch targets, drawer slide-overs, and frictionless Indian checkout flows.
