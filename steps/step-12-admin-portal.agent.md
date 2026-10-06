# STEP 12: ADMIN OPERATIONS WEB APPLICATION

**Status:** PENDING ⏳  
**Domain:** Operations Dashboard, RBAC Access, Catalog SKU Matrix, Order Kanban Board, Returns QC, Audit Logs  
**Target Path:** [`admin`](file:///c:/Users/HP/Desktop/New%20folder/admin)  
**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, TanStack Query  
**Port:** 5174  

---

## 1. OBJECTIVES & ARCHITECTURE
- **RBAC Protected Dashboard:** Strict route guards based on role (`WAREHOUSE_STAFF`, `CATALOG_MANAGER`, `ADMIN`, `SUPER_ADMIN`).
- **Catalog Management:** Create categories, manage brands, upload images (S3 presigned), manage variant SKU pricing and stock levels.
- **Order Operations Kanban:** Visual board tracking orders across `CONFIRMED`, `PROCESSING`, `PACKED`, `SHIPPED`, `DELIVERED`.
- **Returns Inspection Console:** Warehouse team reviews returned item photos, approves refund, or marks rejection with note.
- **Audit Logs & Reports:** Financial summary, GST monthly liability breakdown, RTO rate monitor.

---

## 2. KEY VIEWS & MODULES

1. `/login`: Secure administrative authentication.
2. `/dashboard`: Key performance indicators (GMV, active orders, low-stock warnings, RTO %).
3. `/catalog/products`: Paginated product matrix with quick stock and price inline editors.
4. `/catalog/products/new`: Multi-step product builder with JSONB dynamic attributes.
5. `/orders`: Kanban board & filterable list with invoice download and AWB tracking buttons.
6. `/returns`: Return requests awaiting warehouse QC.

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Configure API client with JWT refresh token interceptor.
- [ ] **Pending:** Build Admin layout (sidebar, topbar with user profile, breadcrumbs).
- [ ] **Pending:** Build Auth guard and login screen.
- [ ] **Pending:** Build Catalog management pages with media presigned uploader.
- [ ] **Pending:** Build Order Kanban and dispatch actions (Generate AWB, Print Invoice).
- [ ] **Pending:** Build Returns inspection view with photo preview and refund trigger.

---

## 4. MODIFICATION & ISOLATION NOTES
- Admin UI communicates strictly through standard backend REST APIs; UI changes have zero impact on backend business logic.
