# STOREFRONT SPA — AGENT SPECIFICATION & PROGRESS TRACKER

**App Name:** `@veyra/storefront`  
**Port:** 5173  
**Status:** SCAFFOLDED (Phase 13) ⏳  
**Tech Stack:** React 18, Vite, Tailwind CSS, TanStack Query, Lucide Icons, Razorpay Checkout JS  

---

## 1. PURPOSE & ARCHITECTURE
Customer-facing modern mobile-first e-commerce web application:
- Communicates strictly with the backend via the **API Gateway** (`http://localhost:3000/api/v1/...`).
- Discovery, Category navigation, faceted filtering, search with debounce.
- Rich PDP with variant SKU switcher (size, color, weight) and 6-digit Indian PIN delivery check.
- Slide-over Bag Drawer with live quantity changes and guest-to-user auto-merge.
- 3-Step Checkout Accordion (Address, Tax Breakdown, Razorpay/COD).
- Customer Account portal for order tracking and PDF invoice download.

---

## 2. STATUS CHECKLIST

- [x] **Done:** React 18 + Vite + Tailwind CSS scaffolding complete.
- [ ] **Pending:** API client configured targeting API Gateway (`http://localhost:3000`).
- [ ] **Pending:** Homepage, Category PLP, and Product PDP components.
- [ ] **Pending:** Slide-over Cart drawer and state management.
- [ ] **Pending:** 3-step checkout with Razorpay modal integration.
- [ ] **Pending:** Order history & account management.

---

## 3. CHANGELOG & UPDATES
- **2026-10-06:** Initial agent specification created for Phase 13 storefront app.
