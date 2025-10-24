# Reclame Fabriek — SvelteKit Mockup (Static, GH Pages)

Fully static mockup of the production workflow console. No backend.
Includes Dashboard, Calendar, Orders, Files (PDF viewer), Chat, Inventory, and Settings.
WCAG themes (Light / Dark / High Contrast).

## Run locally
```bash
npm ci
npm run dev
```

## Build
```bash
# for local build:
npm run build

# for GitHub Pages:
# set base path to repo name (e.g., '/reclame-fabriek-mockup')
BASE_PATH="/<your-repo-name>" npm run build
```

## Deploy to GitHub Pages (Actions)
1. Push to `main` branch.
2. Actions workflow builds with `BASE_PATH='/${{ github.event.repository.name }}'`.
3. Pages will serve from the `gh-pages` environment.
