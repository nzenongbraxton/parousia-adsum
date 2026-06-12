# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ParousiaAdsum is an attendance verification system that uses QR codes, GPS geofencing, IP verification, and SMS to prevent fake check-ins. It has two separate applications in one repo:

1. **Laravel backend** (root) — Laravel 13 + Inertia.js + React 18 (Breeze scaffold). Serves auth, profile management, and will house the API.
2. **TanStack Start frontend** (`frontend/`) — React 19 + TanStack Router/Start + shadcn/ui + Cloudflare Workers. The public-facing kiosk and admin dashboard. This is a separate app with its own `package.json`, build pipeline, and deployment target.

These two apps are **not wired together yet** — the Laravel Inertia pages and the TanStack Start frontend are independent.

## Commands

### Laravel backend (run from repo root)

```bash
composer dev          # Starts server, queue, log tail, and Vite concurrently
composer test         # Clears config cache then runs phpunit
php artisan serve     # Laravel dev server only
php artisan test --filter=RegistrationTest  # Run a single test class
./vendor/bin/pint     # Code style fixer (Laravel Pint)
```

### TanStack Start frontend (run from `frontend/`)

```bash
npm run dev           # Vite dev server
npm run build         # Production build
npm run lint          # ESLint
npm run format        # Prettier
```

The root `package.json` is for the Laravel/Inertia side (Vite + React 18). The `frontend/package.json` is for the standalone TanStack Start app (Vite + React 19). Don't confuse the two — they have different React versions and different build toolchains.

## Architecture

### Laravel side

Standard Laravel Breeze (React + TypeScript variant) with Inertia.js:
- Routes: `routes/web.php` (pages), `routes/auth.php` (Breeze auth flows)
- Pages resolve from `resources/js/Pages/{name}.tsx` via Inertia
- Shared Inertia props (auth user) defined in `app/Http/Middleware/HandleInertiaRequests.php`
- TypeScript path alias: `@/*` → `resources/js/*`
- DB defaults to SQLite; tests use in-memory SQLite
- Uses Ziggy for route name → URL resolution in JS

### Frontend side (`frontend/`)

TanStack Start with file-based routing, built by Lovable:
- Routes in `frontend/src/routes/` — file names map to URL paths
- Root route (`/`) = kiosk check-in page with rotating QR code
- `/admin` layout with child routes: `/admin/` (analytics), `/admin/staff`, `/admin/geofence`
- UI components: shadcn/ui (new-york style) in `frontend/src/components/ui/`, custom domain components in `frontend/src/components/cyber/`
- TypeScript path alias: `@/*` → `frontend/src/*`
- Deploys to Cloudflare Workers (see `frontend/wrangler.jsonc`)
- Vite config wraps `@lovable.dev/vite-tanstack-config` — do not add plugins that it already includes (see comment in `frontend/vite.config.ts`)
- Route tree is auto-generated at `frontend/src/routeTree.gen.ts` — do not edit manually

### Reference materials

- `ref/system-design.docx` — system design document
- `ref/directory-structure.yaml` — planned route structure
- `frontend/guide/LaravelAttendanceSystemDesign.docx` — attendance system design guide

## Conventions

- Indent size: 2 spaces for all files (`.editorconfig`)
- PHP style: Laravel Pint (PSR-12 based)
- Frontend style: Prettier + ESLint (config in `frontend/`)
- Root `.npmrc`: `ignore-scripts=true`, `audit=true`

## AI Context & Development Rules

This repository maintains a highly structured AI context directory under `.ai/` to ensure architectural integrity. Whenever you are executing tasks in this codebase, you **MUST** first load and adhere to the corresponding instructions:

- **Strict Code Rules:** Refer to [.ai/rules/laravel-strict.md](file:///.ai/rules/laravel-strict.md) for type safety, Action patterns, and Inertia data mapping conventions.
- **React/Inertia Boilerplate:** Refer to [.ai/templates/inertia-page.md](file:///.ai/templates/inertia-page.md) when building new frontend views.
- **MySQL 8 Optimizations:** Refer to [.ai/agents/db-architect.md](file:///.ai/agents/db-architect.md) when proposing schema changes, spatial queries, or buffer configurations.
- **Infrastructure Context:** Refer to [.ai/docs/architecture.md](file:///.ai/docs/architecture.md) for the single-tenant Hetzner VPS environment layout.
- **Architectural History:** Refer to [.ai/memory/adr.md](file:///.ai/memory/adr.md) for logging and respecting previous design decisions.
- **Workflow References:** Refer to [.ai/workflows/tenant-setup.md](file:///.ai/workflows/tenant-setup.md) for provisioning checklists.

