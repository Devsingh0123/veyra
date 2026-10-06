# API GATEWAY SERVICE — AGENT SPECIFICATION & PROGRESS TRACKER

**Service Name:** `@veyra/api-gateway`  
**Port:** 3000  
**Status:** READY TO RUN 🚀  
**Tech Stack:** Node.js (v20+), Express.js, `express-http-proxy`, CORS, Cookie-Parser  

---

## 1. PURPOSE & ARCHITECTURE
The API Gateway is the single public entry point for all client applications (Storefront `:5173`, Admin `:5174`, Mobile). It provides:
- Reverse proxy routing to private internal microservices using `express-http-proxy`.
- Centralized CORS configuration allowing authorized frontends.
- Cookie forwarding (e.g. `veyra_refresh_token`) between clients and downstream services.
- Gateway health check endpoint (`/health`).
- Error interception and 503 fallback when a downstream service is unreachable.

---

## 2. FOLDER STRUCTURE
```text
services/api-gateway/
├── src/
│   └── server.js        # Minimal, clean Express app with express-http-proxy
├── .env.example
├── .env
├── package.json
└── agent.md             # This living service document
```

---

## 3. PROXY ROUTING TABLE

| Route Prefix | Target Service | Internal Port | Status |
|---|---|---|---|
| `/health` | API Gateway Local | 3000 | ACTIVE ✅ |
| `/api/v1/auth/*` | `@veyra/auth-service` | 3001 | CONFIGURED 🚀 |
| `/api/v1/catalog/*`| `@veyra/catalog-service`| 3002 | CONFIGURED 🚀 |
| `/api/v1/cart/*` | `@veyra/cart-service` | 3003 | CONFIGURED 🚀 |
| `/api/v1/orders/*` | `@veyra/order-service`| 3004 | PENDING (Phase 7) |
| `/api/v1/payments/*`| `@veyra/payment-service`| 3005 | PENDING (Phase 6) |

---

## 4. ENVIRONMENT VARIABLES

```env
PORT=3000
NODE_ENV=development
SERVICE_NAME=api-gateway

# Downstream Service URLs
AUTH_SERVICE_URL=http://localhost:3001
CATALOG_SERVICE_URL=http://localhost:3002
CART_SERVICE_URL=http://localhost:3003
ORDER_SERVICE_URL=http://localhost:3004
PAYMENT_SERVICE_URL=http://localhost:3005
NOTIFICATION_SERVICE_URL=http://localhost:3006

# Allowed Frontend Origins (CORS)
STOREFRONT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

---

## 5. STATUS CHECKLIST

- [x] **Done:** Clean single-file Express server implemented with `express-http-proxy`.
- [x] **Done:** CORS configured for storefront (`:5173`) and admin (`:5174`) with credentials enabled.
- [x] **Done:** Path resolver configured (`proxyReqPathResolver`) to accurately preserve route prefixes.
- [x] **Done:** 503 error handler implemented for downstream outages.
- [x] **Done:** Health check endpoint (`/health`) active.
- [x] **Done:** Enabled `/api/v1/auth/*` proxy pointing to `:3001`.
- [x] **Done:** Enabled `/api/v1/catalog/*` proxy pointing to `:3002`.
- [x] **Done:** Enabled `/api/v1/cart/*` proxy pointing to `:3003`.
- [ ] **Pending:** Install dependencies (`express-http-proxy`).
- [ ] **Pending:** Enable `/api/v1/orders` proxy once Order Service is ready.
- [ ] **Pending:** Enable `/api/v1/payments` proxy once Payment Service is ready.

---

## 6. CHANGELOG & UPDATES
- **2026-10-06:** Enabled `/api/v1/cart/*` proxy routing to Cart Service `:3003`.
- **2026-10-06:** Enabled `/api/v1/catalog/*` proxy routing to Catalog Service `:3002`.
- **2026-10-06:** Simplified architecture from multi-folder proxy factory to concise `express-http-proxy` server setup.
