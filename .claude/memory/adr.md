# Architectural Decision Records (ADR)

This document tracks major architectural decisions for **ParousiaAdsum**, recording their context, rationale, and consequences.

---

## [ADR-001] Single-Tenant Deployment Isolation Model
* **Status:** Approved
* **Date:** 2026-05-27
* **Author:** Lead Software Architect

### Context
We are constructing an attendance tracking software system featuring QR code scans, SMS validation, and GPS verification. Tenants (schools, enterprises, events) demand strict data privacy, zero crossover contamination risk, and maximum predictability of system latency during high check-in cycles (e.g., peak start times).

### Decision
We will deploy the application using a **Single-Tenant VPS Isolation Model** on Hetzner Cloud. Each client is provisioned with a dedicated virtual server hosting their own isolated Laravel web application instance, a separate Redis caching layer, and a dedicated MySQL 8 database.

### Consequences
- **Pros:**
  - Absolute data isolation (complies with high regulatory requirements).
  - High performance predictability; no noisy neighbor performance degradation.
  - Flexibility in geographical data residency placement on Hetzner.
- **Cons:**
  - Increased infrastructure orchestration overhead.
  - Higher server footprint and costs compared to a single large multi-tenant shared database.
  - Requires robust CI/CD automation to coordinate code updates across multiple servers.

---

## [ADR-002] Monolith Architecture using React & Inertia.js
* **Status:** Approved
* **Date:** 2026-05-27
* **Author:** Lead Software Architect

### Context
We need to develop an admin dashboard and dynamic client-facing forms rapidly. Standard SPA frontend apps separated from standard REST APIs increase complexity (two repositories, double deployment pipelines, CORS management, state replication, manual authentication sharing).

### Decision
We will build the primary administrative panels and app views using a monolithic **Laravel 12 + React + Inertia.js** framework stack. 

### Consequences
- **Pros:**
  - Keeps routing, authorization, and data validation contained within the Laravel backend.
  - Inertia serves as the bridge, passing data directly via component props without writing manual JSON API controller endpoints.
  - Leverages the full power of standard React frontend components and NPM ecosystem with Tailwind CSS.
- **Cons:**
  - Higher initial server rendering RAM footprint.
  - Tight coupling of frontend views to backend controller data representations.
  - Not suitable for highly offline-first applications (which are addressed by the standalone frontend app at `frontend/` deploying to Cloudflare Workers).

---

## [ADR-003] Strict Separation of Domain Logic (Action Pattern)
* **Status:** Approved
* **Date:** 2026-05-27
* **Author:** Lead Software Architect

### Context
Laravel controller bloat is a standard codebase degradation risk. Complex validation, geofencing checks, SMS notification triggers, and DB inserts inside controllers make testing harder and lead to redundant duplicate logic.

### Decision
We enforce a strict **Action Pattern** (`app/Actions/`). Controllers must be limited to standard HTTP transport layer tasks. All specific business domain capabilities must be extracted into single-purpose final readonly Action classes.

### Consequences
- **Pros:**
  - Highly reusable domain business logic.
  - Extremely easy to unit test Actions in isolation.
  - Enforces single responsibility principle (SRP).
- **Cons:**
  - Small increase in class files count.
  - Developer overhead of defining DTOs and Actions for trivial database writes.
