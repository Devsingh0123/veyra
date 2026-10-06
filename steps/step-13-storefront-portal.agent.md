# STEP 13: CUSTOMER STOREFRONT WEB APPLICATION

**Status:** PENDING ⏳  
**Domain:** Customer Discovery, Mobile-First UX, PDP with Variant Matrix, Slide-Over Cart Drawer, 3-Step Checkout Accordion, Razorpay SDK  
**Target Path:** [`storefront`](file:///c:/Users/HP/Desktop/New%20folder/storefront)  
**Tech Stack:** React 18, Vite, Tailwind CSS, Lucide Icons, TanStack Query, Razorpay Checkout JS  
**Port:** 5173  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Modern Indian Consumer UX:** Mobile-first responsive design, fast performance, crisp typography, and fluid micro-animations.
- **Product Discovery & Category Navigation:** Multi-level navigation, instant search with debounce, filters by price, brand, rating.
- **Rich Product Detail Page (PDP):** Image zoom carousel, variant picker (size/color/purity), live stock availability badge, PIN code serviceability checker.
- **Slide-Over Bag Drawer:** Real-time quantity adjustments, cart summary, coupon field.
- **3-Step Checkout Accordion:**
  1. Address Selection / New Address Form with 6-digit PIN autofill.
  2. Order Summary & Statutory GST Breakdown (CGST/SGST/IGST transparently shown).
  3. Payment Method: Razorpay UPI/Card/Netbanking modal or COD with ₹49 handling fee badge.
- **Customer Account Portal:** Track active orders, download tax invoices, file return requests within 7 days.

---

## 2. KEY VIEWS & MODULES

1. `/`: Homepage with hero banner, category grid, trending deals.
2. `/c/:slug`: Category listing with faceted sidebar filters.
3. `/p/:slug`: Product detail page with dynamic variant selector.
4. `/checkout`: 3-step unified checkout flow.
5. `/account/orders`: Order history, status tracker, and PDF invoice downloads.

---

## 3. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Configure API client with credentials support and guest session header.
- [ ] **Pending:** Build Navigation Header, Category Mega Menu, and Mobile Drawer.
- [ ] **Pending:** Build Product Listing Page (PLP) with filters and sorting.
- [ ] **Pending:** Build Product Detail Page (PDP) with variant switching and PIN checker.
- [ ] **Pending:** Build Persistent Cart Drawer with auto-merge on login.
- [ ] **Pending:** Build Checkout flow and integrate Razorpay Checkout JS modal.
- [ ] **Pending:** Build Account order history and tracking page.

---

## 4. MODIFICATION & ISOLATION NOTES
- Storefront UI components interact with backend exclusively through REST contracts, ensuring high modularity and zero backend leakage.
