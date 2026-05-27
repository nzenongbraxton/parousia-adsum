# CLI Slash Commands for Custom Workflows

This document logs custom slash commands and artisan/bash utilities designed for provisioning, deploying, and managing the **ParousiaAdsum** infrastructure.

---

## 1. Local Development Slash Commands

These are shortcuts for managing local development containers and code state.

### `/dev:up`
Starts the local development stack with high performance and watch tasks.
- **Command:** `composer dev`
- **Actions:**
  1. Boot Laravel local web server.
  2. Run Vite asset compilation watch loop.
  3. Start a Redis-backed queue worker.
  4. Tail the application log output.

### `/dev:lint`
Runs code formatting, type checking, and tests in one sequence.
- **Command:** `composer dev:lint`
- **Actions:**
  1. Clean the config caches.
  2. Formats backend code using `./vendor/bin/pint`.
  3. Runs TypeScript type-checker in the `resources/js` backend stack.
  4. Executes unit and integration suites with `composer test`.

---

## 2. Server Provisioning Commands

These commands provision single-tenant servers on Hetzner Cloud.

### `/tenant:provision {tenant_subdomain} {region}`
Spins up a new Hetzner VPS and provisions the tech stack.
- **Command:** `php artisan tenant:provision {tenant_subdomain} --region={region}`
- **Behind the scenes:**
  1. Requests a new EPYC VPS on Hetzner Cloud API.
  2. Provisions Ubuntu, PHP 8.3/8.4, Nginx, Redis, and MySQL 8.
  3. Secures SSH, closes open ports with UFW, and configures Let's Encrypt.
  4. Generates unique secure credential keys for the new tenant.

### `/tenant:deprovision {tenant_subdomain}`
Decommissions a tenant completely.
- **Command:** `php artisan tenant:deprovision {tenant_subdomain}`
- **Behind the scenes:**
  1. Performs a final encrypted `mysqldump` and exports files to long-term cold Storage Box.
  2. Destroys the Hetzner VPS instance.
  3. Updates DNS records to terminate domain pointing.

---

## 3. Remote Deployment Commands

Zero-downtime deployment execution wrappers.

### `/deploy {tenant_subdomain} {branch}`
Deploys a specific branch to a tenant's production server.
- **Command:** `bash scripts/deploy.sh {tenant_subdomain} {branch}`
- **Arguments:**
  - `tenant_subdomain`: The target client sub-domain identifier.
  - `branch`: The Git branch (default: `main`).
- **Pipeline executed:**
  1. Compiles Inertia React assets locally or in the runner.
  2. Syncs files via custom RSync script to `/var/www/{tenant_subdomain}/releases/{timestamp}`.
  3. Runs Laravel migrations under the new release.
  4. Points the `/var/www/{tenant_subdomain}/current` symlink to the new timestamp folder.
  5. Recycles PHP-FPM and Laravel Horizon daemons.
