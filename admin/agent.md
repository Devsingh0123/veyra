# ADMIN OPERATIONS SPA — AGENT SPECIFICATION & PROGRESS TRACKER

**App Name:** `@veyra/admin`  
**Port:** 5174  
**Status:** SCAFFOLDED (Phase 12) ⏳  
**Tech Stack:** React 18, Vite, Tailwind CSS, TanStack Query, Lucide Icons  

---

## 1. PURPOSE & ARCHITECTURE
Internal operations console for warehouse staff, catalog managers, and administrators:
- RBAC protected views based on authenticated role.
- Product Catalog management with category builder and S3 presigned image uploads.
- Orders Kanban board (advancing state machine from `CONFIRMED` to `SHIPPED`).
- Returns inspection QC console (approving refunds, reviewing customer photos).
- GST monthly liability reports and RTO monitoring.

---

## 2. STATUS CHECKLIST

- [x] **Done:** React 18 + Vite + Tailwind CSS scaffolding complete.
- [ ] **Pending:** API client with JWT refresh interceptor targeting API Gateway (`:3000`).
- [ ] **Pending:** RBAC dashboard layout & login portal.
- [ ] **Pending:** Catalog SKU and stock matrix manager.
- [ ] **Pending:** Order Kanban board & shipping dispatch triggers.
- [ ] **Pending:** Returns inspection & refund approval console.

---

## 3. CHANGELOG & UPDATES
- **2026-10-06:** Initial agent specification created for Phase 12 admin operations app.
