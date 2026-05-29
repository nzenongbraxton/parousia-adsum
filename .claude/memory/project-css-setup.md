---
name: project-css-setup
description: How the Laravel/Inertia side's CSS design system is wired up — non-obvious because it mirrors the TanStack frontend
metadata:
  type: project
---

The Laravel side (Tailwind v3 via PostCSS) has its full design system in `resources/css/app.css`. It was ported from `frontend/src/styles.css` (Tailwind v4).

**Key facts:**
- `resources/css/app.css` contains all CSS custom properties (`:root` + `.dark`), `@layer base` body background, and `@layer utilities` for `glass`, `glass-strong`, `bg-gradient-primary`, `bg-gradient-trust`.
- `--color-*` aliases (e.g. `--color-primary`, `--color-success`) are defined in `:root` and used inline in JSX via arbitrary CSS like `color-mix(in oklab, var(--color-success) ...)`.
- `tailwind.config.js` maps every CSS variable to a Tailwind color token (`primary`, `muted`, `success`, `warning`, `info`, `destructive`, `sidebar.*`, etc.) so utility classes like `text-muted-foreground`, `bg-primary` resolve correctly.
- `vite.config.js` uses `@vitejs/plugin-react` — **not** `@tailwindcss/vite`. Tailwind is processed via PostCSS.

**Why:** The Tailwind v4 `@theme inline` block in the frontend has no equivalent in v3 — the color mappings must live in `tailwind.config.js` instead.
