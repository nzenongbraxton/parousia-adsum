# AGENTS.md — ParousiaAdsum

ParousiaAdsum an attendance verification system using QR codes, GPS geofencing, IP verification, and SMS to prevent fake check-ins. Laravel 13 monolith with Inertia.js + React 18.

## Quick-start

```bash
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install --ignore-scripts && npm run build
```

Root `.npmrc` sets `ignore-scripts=true` — `npm install` will NOT run postinstall scripts without the flag.

## Commands

```bash
composer dev                   # server + queue + logs + Vite concurrently
composer test                  # clears config cache then phpunit
./vendor/bin/pint              # PHP code style fixer (PSR-12)
php artisan test --filter=Name # single test class
```

`composer test` clears config cache before running — this matters if you add config mid-session.

## Architecture

| Concern | Location |
|---------|----------|
| Routes | `routes/web.php` (pages), `routes/auth.php` (Breeze auth) |
| Inertia pages | `resources/js/Pages/{Name}.tsx` — resolve via `laravel-vite-plugin` |
| Shared Inertia props | `app/Http/Middleware/HandleInertiaRequests.php` |
| TS path alias | `@/*` → `resources/js/*` |
| Ziggy routes | `ziggy-js` import resolves route names to URLs |
| DB default | SQLite (dev); MySQL 8 (production per tenant) |
| Tests | In-memory SQLite via `phpunit.xml` |

Page naming convention: `resources/js/Pages/ParousiaAdsum/Index.tsx` → `Inertia::render('ParousiaAdsum/Index')`.

## Laravel strict rules (must follow)

Load `.ai/rules/laravel-strict.md` for full detail. Key requirements:

- **All PHP files** must begin with `declare(strict_types=1);`.
- **Slim controllers, fat actions**: business logic goes in `app/Actions/` — single-purpose final readonly classes with one public method (`execute` or `__invoke`). Controllers only handle HTTP transport.
- **DTOs**: validated request data maps to strongly-typed readonly DTOs before reaching Actions. Never pass `$request->all()` to business logic.
- **Form Requests**: always use dedicated `php artisan make:request` classes for validation.
- **Never pass Eloquent models to Inertia** — use `.only()` or API Resources.

## Git Workflow (Post-Task Requirement)

Upon successful completion of any programming or engineering task, the agent **MUST** automatically:
1. **Stage all modifications and new files** using `git add .` (including untracked files).
2. **Commit with explicit developer commit messages** using clear, detailed, and highly professional developer commit messages highlighting exact changes, additions, refactorings, and config values.

## Required `.ai/` context

| File | Purpose |
|------|---------|
| `.ai/rules/laravel-strict.md` | Action pattern, type safety, Inertia data mapping |
| `.ai/templates/inertia-page.md` | Boilerplate for new Inertia views |
| `.ai/docs/architecture.md` | Single-tenant Hetzner VPS deployment model |
| `.ai/memory/adr.md` | Architectural decision records |

## Testing details

- Tests use in-memory SQLite (`DB_DATABASE=:memory:` in `phpunit.xml`).
- Feature tests in `tests/Feature/`, unit tests in `tests/Unit/`.
- Run a single test: `php artisan test --filter=RegistrationTest`.
- No external services required — all drivers set to `array`/`sync`/`null` in test env.

## Versions

- PHP 8.3+, Laravel 13, React 18, Tailwind 3, SQLite (dev) / MySQL 8 (prod)
