<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://banners.beyondco.de/ParousiaAdsum.png?theme=dark&package_manager=Laravel&package_name=13&pattern=architect&style=style_1&description=ParousiaAdsum+Verification+System&md=1&showWatermark=1&fontSize=100px&images=clipboard-check">
    <img src="https://banners.beyondco.de/ParousiaAdsum.png?theme=light&package_manager=Laravel&package_name=13&pattern=architect&style=style_1&description=ParousiaAdsum+Verification+System&md=1&showWatermark=1&fontSize=100px&images=clipboard-check" alt="ParousiaAdsum">
  </picture>
</p>

# ParousiaAdsum

**ParousiaAdsum** — an attendance verification system that prevents fake check-ins through multi-factor verification: QR codes, GPS geofencing, IP verification, and SMS confirmation.

Built on Laravel 13 with Inertia.js, React 18, and Tailwind CSS.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | PHP 8.3+, Laravel 13 |
| Frontend | React 18, Inertia.js, TypeScript |
| Styling | Tailwind CSS 3, shadcn/ui |
| Database | SQLite (development), MySQL 8 (production) |
| Cache | Redis |
| Dev tools | Vite, Laravel Pint, PHPUnit |

## Architecture

ParousiaAdsum follows a strict **Action Pattern** architecture:

- **Routes** in `routes/web.php` map to Inertia page components in `resources/js/Pages/`.
- **Controllers** are thin — they validate requests, delegate to Action classes, and return Inertia responses.
- **Actions** (`app/Actions/`) contain all business logic as single-purpose final readonly classes.
- **DTOs** carry validated data between layers — never pass `$request->all()` to business logic.
- **Form Request** classes handle all input validation.

The deployment model is **single-tenant Hetzner VPS** with isolated MySQL 8 databases per client. See `.ai/docs/architecture.md` for details.

## Prerequisites

- PHP 8.3+
- Composer
- Node.js 20+
- SQLite (development) or MySQL 8 (production)

## Setup

```bash
# Clone and install
composer install
cp .env.example .env
php artisan key:generate

# Database (SQLite)
php artisan migrate

# Frontend assets
npm install --ignore-scripts
npm run build
```

> Root `.npmrc` sets `ignore-scripts=true` — use `--ignore-scripts` when installing npm dependencies.

## Development

Start the full dev environment:
```bash
composer dev
```

This runs the Laravel server, queue worker, log tail, and Vite dev server concurrently.

### Individual commands

| Command | Description |
|---------|-------------|
| `php artisan serve` | Laravel dev server only |
| `php artisan test` | Run all tests |
| `php artisan test --filter=Tests\Feature\ProfileTest` | Run a single test class |
| `./vendor/bin/pint` | Format PHP code (PSR-12) |
| `php artisan make:request StoreAttendanceRequest` | Create a Form Request |
| `php artisan make:migration create_attendance_records_table` | Create a migration |

Testing uses in-memory SQLite — no external services required.

### Routes

| URL | Page | Middleware |
|-----|------|------------|
| `/` | Kiosk check-in | None |
| `/admin` | Admin dashboard | `auth`, `verified` |
| `/admin/staff` | Staff management | `auth`, `verified` |
| `/admin/geofence` | Geofence configuration | `auth`, `verified` |

## AI Context

This repository maintains structured AI guidance under `.ai/`:

- **`.ai/rules/laravel-strict.md`** — coding standards, type safety, Action/DTO patterns
- **`.ai/templates/inertia-page.md`** — boilerplate for new Inertia views
- **`.ai/docs/architecture.md`** — Hetzner VPS deployment topology
- **`.ai/memory/adr.md`** — architectural decision records
- **`.ai/workflows/tenant-setup.md`** — provisioning checklists

## License

[MIT](LICENSE)
