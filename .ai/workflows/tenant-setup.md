# Workflow: Tenant Setup & Client Provisioning

This document outlines the step-by-step procedure to provision and onboard a new tenant (client) onto the dedicated Hetzner Cloud infrastructure.

---

## Pre-requisites
- Hetzner Cloud API Access Token configured in local `.env` or CI variables.
- Domain DNS setup: Managed under Cloudflare, with permissions to add subdomains (`*.parousiaadsum.com` or custom client domains).
- Access to the main repository code deployment keys.

---

## Provisioning Stages

### Stage 1: DNS Setup & Domain Pointing
Before spinning up the virtual server, create the tenant's DNS pointer.
1. Log in to the DNS management console (Cloudflare).
2. Add an `A` record pointing the target subdomain (e.g. `{client}.parousiaadsum.com`) to the IP pool, or reserve a temporary IP from Hetzner.
3. Keep the Cloudflare Proxy (Orange Cloud) disabled initially for Let's Encrypt validation, or keep it enabled if using DNS-01 SSL challenge.

---

### Stage 2: Hetzner Cloud Instance Launch
Use the provisioning slash command `/tenant:provision {tenant_subdomain} {region}` or manually deploy through the Hetzner portal:

1. **Create Server:**
   - **OS Image:** Ubuntu 24.04 LTS (Minimal).
   - **Type:** AMD EPYC CPX21 (3 vCPUs, 4GB RAM, 80GB NVMe SSD).
   - **Volume:** Attach a 20GB persistent NVMe volume for local database storage and backups.
   - **SSH Key:** Import the standard public deploy key for the CI runner and admin developer.
2. **Retrieve IP:** Note the newly generated public IPv4 address.

---

### Stage 3: Automated Stack Configuration (Ansible / Forge)
Invoke the Ansible playbook or run the setup shell wrapper:
```bash
ansible-playbook -i '{server_ip},' playbooks/provision-tenant.yml --extra-vars "domain={client}.parousiaadsum.com"
```

**Actions completed by setup script:**
1. Updates package repositories and installs required utilities (`curl`, `git`, `ufw`, `fail2ban`).
2. Configures Firewall: Only open `22` (SSH), `80` (HTTP), `443` (HTTPS).
3. Installs PHP 8.3/8.4 and necessary extensions (`php-fpm`, `php-mysql`, `php-redis`, `php-xml`, `php-mbstring`).
4. Installs and configures Redis Server.
5. Installs MySQL 8 and creates a dedicated database user with strict permissions:
   ```sql
   CREATE DATABASE parousia_tenant;
   CREATE USER 'tenant_user'@'localhost' IDENTIFIED BY 'SECURE_GENERATED_PASSWORD';
   GRANT ALL PRIVILEGES ON parousia_tenant.* TO 'tenant_user'@'localhost';
   FLUSH PRIVILEGES;
   ```
6. Installs Nginx and writes virtual host directives pointing to `/var/www/{domain}/current/public`.
7. Installs Let's Encrypt certbot and generates a free SSL certificate.

---

### Stage 4: Initial Code Deployment
Once system packages are ready, run the initial Git deployment:

1. Create target folder layout:
   ```bash
   mkdir -p /var/www/{domain}/{releases,shared}
   ```
2. Clone repository to a new release folder, install composer dependencies without dev tools, build frontend assets, and initialize configuration keys:
   ```bash
   composer install --no-dev --optimize-autoloader
   npm ci && npm run build
   php artisan key:generate
   ```
3. Run migrations and seed standard tenant schemas:
   ```bash
   php artisan migrate --force
   php artisan db:seed --class=TenantDefaultSeeder --force
   ```
4. Update Nginx document root symlink pointing to the current release and restart Nginx & PHP-FPM.

---

### Stage 5: Verification & Onboarding hand-off
1. Verify SSL certificate configuration and secure headers (HTTPS redirection, HSTS).
2. Load `{client}.parousiaadsum.com` in the browser and confirm the initial setup page loads successfully.
3. Access database and verify base tables exist.
4. Issue administrative login credentials to the client contact person.
