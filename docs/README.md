# Reclame OMS Documentation

**Version:** 1.0.0  
**Last Updated:** November 11, 2025  
**Tech Stack:** SvelteKit 2.x, PostgreSQL 16, TypeScript 5.x

---

## 📖 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Implementation Guides](#implementation-guides)
5. [API Documentation](#api-documentation)
6. [Deployment](#deployment)
7. [Contributing](#contributing)

---

## Overview

Reclame OMS (Order Management System) is a comprehensive manufacturing and order management platform designed for signage production companies. It features:

- **Dynamic Profile System** - Configurable manufacturing profiles (P1, P3, P5, P7st, P8)
- **Materials & Inventory Management** - Complete catalog integration (PLEXIGLAS, PVC, Aluminum, RAL, PANTONE, ORACAL)
- **Draft Order System** - Multi-profile order creation with file uploads
- **Production Workflow** - End-to-end manufacturing tracking
- **FAQ & Documentation** - Searchable knowledge base
- **Multi-language Support** - EN, RU, LV

---

## Quick Start

### Prerequisites

**Required:**
- Node.js 20+
- PostgreSQL 16+
- npm or pnpm 8+

**Optional:**
- Tailscale (for secure remote access)
- Docker (for containerized deployment)

### Installation

```bash
# 1. Clone repository
git clone <repository-url>
cd reclame-oms

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env
# Edit .env with your database credentials

# 4. Initialize database
npm run db:setup
npm run db:migrate
npm run db:seed

# 5. Start development server
npm run dev
```

### First Run

1. Navigate to `http://localhost:5173`
2. Default credentials: `admin@reclame.lv` / `admin123` (change immediately)
3. Complete setup wizard
4. Import materials catalog

---

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                 Client Layer (Browser)                  │
│  ┌───────────┐  ┌───────────┐  ┌──────────────────┐   │
│  │ SvelteKit │  │  Svelte   │  │   TailwindCSS    │   │
│  │   Pages   │  │Components │  │     Styling      │   │
│  └───────────┘  └───────────┘  └──────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ HTTP/REST API
┌──────────────────────▼──────────────────────────────────┐
│           Application Server (Node.js)                  │
│  ┌─────────────────────────────────────────────────┐   │
│  │         SvelteKit Backend (SSR)                 │   │
│  │  ├─ API Routes (+server.ts)                     │   │
│  │  ├─ Server Load Functions (+page.server.ts)    │   │
│  │  ├─ Business Logic (src/lib/server)            │   │
│  │  └─ Authentication & Authorization             │   │
│  └─────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │ SQL Queries
┌──────────────────────▼──────────────────────────────────┐
│           Database Layer (PostgreSQL)                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Core Tables: users, draft_orders, materials,  │   │
│  │  order_profiles, profile_templates, inventory  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

**Documentation:** [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Implementation Guides

### Phase 1: Foundation & Database Schema
- [Database Schema](./PHASE_1_DATABASE_SCHEMA.md)
- [Type System](./PHASE_1_TYPE_SYSTEM.md)
- [Authentication Setup](./PHASE_1_AUTH.md)

### Phase 2: Materials & Inventory
- [Materials Catalog](./PHASE_2_MATERIALS_CATALOG.md)
- [Color Systems (RAL, PANTONE, ORACAL)](./PHASE_2_COLOR_SYSTEMS.md)
- [Inventory Management](./PHASE_2_INVENTORY.md)
- [Profile Templates (P1-P8)](./PHASE_2_PROFILE_TEMPLATES.md)

### Phase 3: Dynamic Forms & Components
- [Field Components](./PHASE_3_FIELD_COMPONENTS.md)
- [Profile Form Renderer](./PHASE_3_PROFILE_FORM.md)
- [Validation System](./PHASE_3_VALIDATION.md)

### Phase 4: Order Management
- [Draft Order Modal](./PHASE_4_DRAFT_ORDER_MODAL.md)
- [File Upload System](./PHASE_4_FILE_UPLOADS.md)
- [FAQ System](./PHASE_4_FAQ.md)
- [Production Workflow](./PHASE_4_PRODUCTION_WORKFLOW.md)

---

## API Documentation

### REST API Endpoints

**Full Documentation:** [API_REFERENCE.md](./API_REFERENCE.md)

#### Quick Reference

```javascript
// Materials
GET    /api/materials              // List materials
GET    /api/materials/:id          // Get material details
GET    /api/materials/search       // Search materials

// Colors
GET    /api/colors                 // List colors (RAL, PANTONE, ORACAL)
GET    /api/colors?system=RAL      // Filter by system
GET    /api/colors/:id             // Get color details

// Profile Templates
GET    /api/profiles/templates     // List all profiles
GET    /api/profiles/templates/:code  // Get profile (e.g., P7st)

// Draft Orders
GET    /api/draft-orders           // List draft orders
POST   /api/draft-orders           // Create draft order
PUT    /api/draft-orders/:id       // Update draft order
DELETE /api/draft-orders/:id       // Delete draft order

// Inventory
GET    /api/inventory              // List inventory
POST   /api/inventory/movement     // Record stock movement
GET    /api/inventory/low-stock    // Low stock alerts

// File Uploads
POST   /api/upload                 // Upload file (CDR/PDF/images)
GET    /api/files/:id              // Download file
DELETE /api/files/:id              // Delete file
```

---

## Deployment

### Production Deployment

**Full Guide:** [DEPLOYMENT.md](./DEPLOYMENT.md)

#### Quick Deploy (Ubuntu Server)

```bash
# 1. Install dependencies
sudo apt update
sudo apt install postgresql nginx certbot

# 2. Clone and build
git clone <repo> /opt/reclame-oms
cd /opt/reclame-oms
npm install
npm run build

# 3. Configure systemd service
sudo systemctl enable reclame-oms
sudo systemctl start reclame-oms

# 4. Configure Nginx reverse proxy
# See DEPLOYMENT.md for Nginx config

# 5. Set up SSL with Certbot
sudo certbot --nginx -d reclame.yourdomain.com
```

#### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

**Tailscale Integration:** [TAILSCALE_SETUP.md](./TAILSCALE_SETUP.md)

---

## Contributing

### Code Standards

**Style Guide:** [CONTRIBUTING.md](./CONTRIBUTING.md)

- **TypeScript** - Strict mode, interfaces over types
- **Svelte** - Composition API, script-style-markup order
- **CSS** - CSS custom properties (no Sass/Less)
- **Git** - Conventional commits (feat, fix, docs, etc.)

### Commit Convention

```bash
# Examples
feat(orders): add draft order modal component
fix(inventory): correct stock calculation bug
docs(api): update materials API documentation
refactor(auth): simplify login flow
```

### Pull Request Process

1. Create feature branch (`feature/draft-order-modal`)
2. Implement changes with tests
3. Update documentation
4. Submit PR with clear description
5. Pass CI/CD checks
6. Code review approval
7. Merge to main

---

## Support & Resources

### Internal Resources

- **Slack:** `#reclame-oms-dev`
- **Jira:** [Project Board](https://jira.company.com/ROMS)
- **Figma:** [Design System](https://figma.com/reclame-oms)

### External Resources

- [SvelteKit Docs](https://kit.svelte.dev/)
- [PostgreSQL Manual](https://www.postgresql.org/docs/)
- [PLEXIGLAS® Technical Data](https://www.plexiglas.de/)

---

## Changelog

### Version 1.0.0 (November 2025)
- ✅ Database schema and migrations
- ✅ Materials catalog (PLEXIGLAS, PVC, Aluminum)
- ✅ Color systems (RAL, PANTONE, ORACAL)
- ✅ Profile templates (P1, P3, P5, P7st, P8)
- ✅ Dynamic field components
- ✅ Profile form renderer
- ✅ Inventory management system

### Upcoming in 1.1.0
- 🚧 Draft order modal
- 🚧 File upload system
- 🚧 FAQ knowledge base
- 🚧 Production workflow
- 🚧 Mobile app (stocktaking)

---

## License

**Proprietary Software**  
Copyright © 2025 Reclame Company. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, distribution, or use is strictly prohibited.

---

## Quick Links

- [Architecture Overview](./ARCHITECTURE.md)
- [Database Schema](./PHASE_1_DATABASE_SCHEMA.md)
- [API Reference](./API_REFERENCE.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
