# STEP 14: HARDENING, CI/CD & PRODUCTION GO-LIVE

**Status:** PENDING ⏳  
**Domain:** Nginx TLS 1.3 Reverse Proxy, Security Hardening, GitHub Actions CI/CD, Playwright E2E Tests, Backup & Restore Drills  
**Target Path:** Root orchestration & `.github/workflows`  

---

## 1. OBJECTIVES & ARCHITECTURE
- **Reverse Proxy & TLS 1.3:** Nginx config routing incoming traffic to appropriate services and SPAs with SSL termination.
- **Security Hardening:** Rate limiting on auth endpoints (Redis token bucket), Helmet security headers, CORS origin enforcement, DPDP Act user data anonymization.
- **Continuous Integration (CI):** Automated linting, Prisma schema validation, build verification, and integration tests on push.
- **End-to-End Smoke Tests:** Playwright E2E testing full customer lifecycle: Registration -> Add to Bag -> Checkout -> Payment Webhook -> Order Confirmed.
- **Backup & Disaster Recovery:** PostgreSQL automated pg_dump snapshot cron to secure cloud storage.

---

## 2. STATUS & IMPLEMENTATION ROADMAP

- [ ] **Pending:** Write Nginx production reverse proxy configuration (`nginx/default.conf`).
- [ ] **Pending:** Configure GitHub Actions CI workflow for test execution and Docker image building.
- [ ] **Pending:** Configure production `docker-compose.yml` with healthchecks and restart policies.
- [ ] **Pending:** Write Playwright E2E smoke test suite for core checkout path.
- [ ] **Pending:** Run backup and restore drill for PostgreSQL multi-schema database.

---

## 3. MODIFICATION & ISOLATION NOTES
- Deployment configuration and CI/CD pipelines live in root and `.github/`, isolated from application business logic.
