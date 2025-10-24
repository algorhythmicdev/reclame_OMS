# Reclame Fabriek — SvelteKit Mockup (GH Pages Ready)
Brand UI with logo, icons, accessibility and static deploy.
- Pages: Dashboard (KPIs + jobs), Launchpad, Calendar, Orders (+detail), Files (PDF viewer), Chat, Inventory, Settings.
- Themes: Light / Dark / High-Contrast. Icons: `lucide-svelte` (+ heroicons installed).
- GH Pages: adapter-static + base path, `.nojekyll`, Actions workflow.

## Local
npm ci
npm run dev

## Build
npm run build

## Deploy to GitHub Pages
Push to a repo (main branch). The workflow builds with:
BASE_PATH="/<your-repo-name>"
