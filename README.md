Table of Contents

Project Goals

System Overview

Tech Stack

Monorepo Layout

Local Development

Build & Deploy

Configuration

Accessibility & UX

Data Model (Mock)

Feature Map

Conventions

Quality Gates

Troubleshooting

Roadmap

Security & Privacy

Contributing

License

Project Goals

Single pane of glass for the entire signage production workflow:

Intake → CAD → CNC → Sanding → Bending/Welding → (Re)sanding → Painting → Assembly → QC → Delivery.

Human-centered ops: clear task handoffs; older-friendly UI; WCAG 2.2–aligned themes (Light / Dark / High-Contrast).

Evidence & traceability: each step produces structured state updates (timestamps, operator, station, notes).

Paperless files: on-page PDF previews (CDR later via server-side conversion), AI-assisted forms (future).

Cloudless LAN optional: Tailscale-friendly access to an on-prem server; can also be statically hosted.

Deploy frictionless: GitHub Pages static deployment for demo/presentations; later move to a full backend.

System Overview

This repo currently contains a static SvelteKit mockup of the production console.
It showcases expected flows, screens, and interaction patterns. All lists and events use mock data.

When a real backend arrives, SvelteKit endpoints (+server.ts) or an API layer will replace mocks.

Tech Stack

Frontend: SvelteKit
 (static adapter)

Icons: lucide-svelte (and heroicons-svelte preinstalled)

PDF viewing: pdfjs-dist

CI/CD: GitHub Actions → GitHub Pages

Branding: static/brand.css, static/brand/logo.png

Monorepo Layout
.
├─ src/
│  ├─ lib/
│  │  └─ pdf/PdfViewer.svelte          # PDF.js viewer
│  └─ routes/
│     ├─ +layout.svelte                # App shell, sidebar, header, themes
│     ├─ +page.svelte                  # Dashboard (KPIs + active jobs)
│     ├─ launchpad/+page.svelte        # Tiles to core areas
│     ├─ calendar/+page.svelte         # Monthly planner (mock)
│     ├─ orders/+page.svelte           # Orders list (mock)
│     ├─ orders/[id]/+page.svelte      # Order detail (steps, materials, PDF)
│     ├─ files/+page.svelte            # File viewer (PDF)
│     ├─ chat/+page.svelte             # Mock chat (localStorage)
│     ├─ inventory/+page.svelte        # Mock inventory
│     └─ settings/+page.svelte         # Branding + integrations (placeholders)
├─ static/
│  ├─ brand.css                        # Design tokens, theme rules
│  ├─ brand/logo.png                   # Reclame Fabriek logo (PNG)
│  ├─ files/PO-250375_...pdf           # Sample job file
│  └─ .nojekyll                        # Disable Jekyll on GH Pages
├─ .github/workflows/deploy.yml        # GH Pages deploy pipeline
├─ svelte.config.js                    # adapter-static, base paths, 404 fallback
├─ vite.config.js                      # base path for static assets
├─ package.json                        # scripts + dependencies
└─ README.md                           # You are here

Local Development

Requirements: Node.js 20+

npm ci
npm run dev


Open http://localhost:5173.

Build locally (simulate GitHub Pages base path):

# Replace <repo> with your repository name (e.g., reclame_OMS)
BASE_PATH="/<repo>" npm run build
npx serve build
# Visit http://localhost:3000/<repo>/

Build & Deploy
Static Build (SvelteKit)

Adapter: @sveltejs/adapter-static

SPA Fallback: 404.html (required for GH Pages deep-link refreshes)

GitHub Pages

Default branch: main

Workflow: .github/workflows/deploy.yml

Deploy trigger: push to main

The workflow sets BASE_PATH="/${{ github.event.repository.name }}" and publishes build/.

Important: On GitHub Pages your app is served from:
https://<user>.github.io/<repo>/
This is why we use BASE_PATH and the SvelteKit base helper for assets.

Configuration
Environment (build-time)

BASE_PATH (string) – Only for static hosting under a subpath (GitHub Pages).
Example in CI: "/reclame_OMS"

Asset URLs

Always use SvelteKit base for static assets:

<script>
  import { base } from '$app/paths';
</script>

<link rel="stylesheet" href="{base}/brand.css" />
<img src="{base}/brand/logo.png" alt="Logo" />
<iframe src="{base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf" />


Internal page links can remain absolute (href="/orders"); SvelteKit rewrites them correctly.

Accessibility & UX

Themes: Light / Dark / High-Contrast

Focus indicators: visible outlines on keyboard navigation

Skip link: “Skip to content” in layout

Readable contrast: color tokens chosen to exceed WCAG AA whenever possible

Touch targets: pill tag buttons with comfortable padding

Data Model (Mock)

Replace with real API contracts later. For now, simple arrays:

type Order = {
  id: string;             // e.g., "PO-250375"
  client: string;         // e.g., "ABTB BIJEN"
  title: string;          // e.g., "4500mm Long Frame"
  status: string;         // e.g., "Sanding"
  due: string;            // ISO date
  materials?: { part: string; material: string; thickness: string; color: string }[];
  steps?: { name: string; done: boolean }[];
  file?: string;          // pdf path with {base}
};

Feature Map

Dashboard: KPIs, active jobs, stock snippets, notifications

Calendar: mock workload planning, delivery scheduling

Orders: list + detail with process steps, materials breakdown, source PDF

Files: in-page PDF viewer (pdfjs-dist)

Chat: team comms mock using localStorage

Inventory: demo list with LOW/OK thresholds

Settings: branding and connectors placeholders (Telegram, n8n, OpenRouter)

Conventions
Branching

main — stable, deploys to Pages

feat/<name> — features

fix/<name> — hotfixes

docs/<name> — documentation

Commits (Conventional)

feat:, fix:, docs:, style:, refactor:, chore:, ci:

Example: fix: GH Pages 404 fallback + base path

PR Checklist

 Build passes locally (BASE_PATH="/<repo>" npm run build)

 No hardcoded absolute asset paths (/brand/..., /files/...)

 Navigation & refresh work under /reclame_OMS/...

 README updated if behavior changes

Quality Gates

Static build check in CI (default with deploy)

Lighthouse (manual for now): verify color contrast & keyboard nav

Type safety: prefer TS for new modules (can be introduced gradually)

Troubleshooting
❌ 404 on GitHub Pages (refreshing subpages)

Cause: No SPA fallback on static hosting.
Fix: adapter-static with fallback: '404.html' in svelte.config.js.

❌ CSS/JS don’t load in production (blank page)

Cause: Built as if served from root (/).
Fix: Ensure both:

kit.paths.base uses BASE_PATH when not dev

vite.base uses BASE_PATH too

❌ Logo/PDF not found

Cause: Asset URLs not prefixed with {base}.
Fix: Use {base}/brand/logo.png, {base}/files/...pdf.

✅ Quick verification (local)
rm -rf node_modules build
npm ci
BASE_PATH="/reclame_OMS" npm run build
npx serve build
# visit http://localhost:3000/reclame_OMS/ then navigate and refresh on subpages

Roadmap

Backend: REST/GraphQL or tRPC gateway; auth (OIDC)

Stations app: kiosk mode screens per workstation with offline queues

Inventory: supplier/vendor linkage, barcodes/QR, lot tracking, spoilage

Scheduling: Gantt/resource lanes; drag-and-drop rescheduling

CDR support: server-side conversion (CDR→PDF/SVG) for previews

AI Assist: extract order specs from PDFs, fill forms, detect missing fields

Notifications: Telegram/Matrix/N8N integrators; voice-to-action flow

i18n: LV/NL/EN interfaces

Security & Privacy

No customer secrets in repo.

Add .env for secrets when backend lands; never commit it.

For on-prem, prefer Tailscale for secure remote access.

Contributing

Create a feature branch: git checkout -b feat/<name>

Keep PRs small & reviewable

Follow the PR checklist

Update this README for any user-visible change

License

© Reclame Fabriek. All rights reserved.
If you need a formal OSS license, propose one via PR (MIT/Apache-2.0 recommended for samples).
