# STEP 12: ADMIN OPERATIONS WEB APPLICATION

**Status:** COMPLETED 🚀  
**Domain:** Operations Dashboard, RBAC Access, Catalog SKU Matrix, Order Pipeline, Logistics Dispatch, Returns QC, GST Invoicing  
**Target Path:** [`admin`](file:///c:/Users/HP/Desktop/New%20folder/admin)  
**Dedicated Architecture Plan:** [`admin/admin.md`](file:///c:/Users/HP/Desktop/New%20folder/admin/admin.md)  
**Tech Stack:** React 18, Vite, Tailwind CSS v4, Shadcn UI (Base UI + Nova), Redux Toolkit + RTK Query, Axios, Lucide Icons, Framer Motion  
**Port:** 5174  
**Architecture:** Completely Standalone, Decoupled SPA (Zero shared code or dependencies with Storefront)  

---

## 1. OBJECTIVES & ARCHITECTURE
- **RBAC Protected Dashboard:** Strict role-aware navigation supporting `SUPER_ADMIN`, `ADMIN`, `CATALOG_MANAGER`, `WAREHOUSE_STAFF`.
- **Catalog Management:** Create categories, manage brands, variant SKU generation with Indian HSN and statutory GST rates.
- **Inventory Matrix:** Real-time stock vs 15-minute checkout reservation hold tracking with quick adjustment modals.
- **Order Operations & Logistics:** View orders, generate Carrier AWB tracking with volumetric weight calculation, and view/print Section 46 CGST Tax Invoices.
- **Returns & QC Inspection:** Warehouse inspection console for reviewing customer photos, passing/rejecting QC, and generating Section 34 CGST Credit Notes.
- **Data Fetching:** Unified RTK Query with Axios baseQuery adapter routing to API Gateway at `http://localhost:3000/api/v1`.
- **Independent Deployability:** Independent `package.json`, isolated `.npmrc`, zero monorepo workspace hoisting.

---

## 2. ROADMAP & MILESTONES
See the authoritative, step-by-step implementation roadmap in [`admin/admin.md`](file:///c:/Users/HP/Desktop/New%20folder/admin/admin.md).
