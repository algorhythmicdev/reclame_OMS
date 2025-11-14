# Reclame OMS - System Architecture

## Overview

Reclame OMS is a full-stack order management system built with SvelteKit, TypeScript, and PostgreSQL. The system uses a **hybrid storage architecture** during development, with a clear path to full database integration for production.

## Technology Stack

### Frontend
- **Framework:** SvelteKit 2.7.4
- **Language:** TypeScript
- **UI Components:** Custom component library
- **Icons:** Lucide Svelte
- **Charts:** ApexCharts
- **PDF Handling:** PDF.js
- **Internationalization:** svelte-i18n (EN/RU/LV)
- **Build Tool:** Vite 5.4

### Backend
- **Runtime:** Node.js (v18+)
- **API:** SvelteKit API routes (REST)
- **Database:** PostgreSQL 14+
- **ORM/Query:** Direct SQL with pg driver
- **File Storage:** Local filesystem (upgradeable to S3/MinIO)

### Deployment
- **Adapter:** @sveltejs/adapter-static (for GitHub Pages demo)
- **Production:** Node.js server with PostgreSQL backend

## Storage Architecture

### Current Hybrid Approach

The application uses a **two-tier storage system** to support both rapid prototyping and production deployment:

#### Tier 1: PostgreSQL Database (Production-Ready)

**✅ Fully Implemented & Database-Backed:**

1. **Profile Templates System**
   - Tables: `profile_templates`, `profile_sections`, `profile_section_fields`
   - API: Full CRUD + versioning + cloning + import/export
   - Status: Production-ready with version control

2. **Inventory Management**
   - Tables: `inventory_stock`, `inventory_transactions`, `purchase_orders`
   - API: Stock tracking, PO management, supplier management
   - Status: Production-ready

3. **Materials & Colors Library**
   - Tables: `materials`, `color_systems`
   - Includes: RAL, Pantone, ORACAL, custom colors
   - Status: Complete with full seed data

4. **FAQ/Documentation**
   - Tables: `faq_documents`
   - Multi-language support (EN/RU/LV)
   - Status: Production-ready

5. **Files Metadata**
   - Table: `files`
   - Tracks uploaded PDFs, CDRs, images
   - Status: Schema ready, needs file handler integration

#### Tier 2: LocalStorage (Development/Demo)

**⚠️ Currently Using LocalStorage (Migration Ready):**

1. **Orders System**
   - Current: `vcs-store.ts` with localStorage
   - Target: `draft_orders`, `order_profiles` tables
   - Migration: Backend schema ready, needs API endpoints

2. **Calendar Events**
   - Current: `calendar/store.ts` with localStorage
   - Target: New `calendar_events` table needed
   - Migration: Schema design needed

3. **User Sessions**
   - Current: `users/user-store.ts` with localStorage
   - Target: `users`, `sessions` tables
   - Migration: Auth system implementation needed

### Why Hybrid Architecture?

**Advantages:**
- ✅ Rapid prototyping without database setup
- ✅ Works offline/demo mode
- ✅ Easy GitHub Pages deployment
- ✅ Production database infrastructure already in place
- ✅ Progressive migration path

**Production Migration:**
- Backend infrastructure complete
- Frontend just needs to swap stores for API calls
- No data loss during migration
- Can be done module by module

## Database Schema

### Core Tables

#### Profile System
```sql
profile_templates          -- Template definitions (P7st, P1, etc.)
  ├── profile_sections     -- Reusable sections
  │     └── profile_section_fields -- Field definitions
  └── profile_version_history -- Audit trail

field_types               -- Field type registry
```

#### Orders (Schema Ready)
```sql
draft_orders              -- Main order records
  ├── order_profiles      -- Profile instances per order
  └── files               -- Attached CDR/PDF files
```

#### Inventory
```sql
materials                 -- Material catalog
  └── material_suppliers  -- Material-supplier links
  
inventory_stock          -- Current stock levels
  └── inventory_transactions -- Stock movements

purchase_orders          -- Material orders
  └── purchase_order_items -- PO line items

suppliers                -- Vendor information
```

#### Documentation
```sql
faq_documents            -- Documentation & help
color_systems            -- RAL/Pantone/ORACAL colors
```

### Database Connection

**File:** `src/lib/server/db/connection.ts`

```typescript
import pg from 'pg';

export const pool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  database: env.DB_NAME,
  user: env.DB_USER,
  password: env.DB_PASSWORD
});

export async function query<T>(text: string, params?: any[]);
export async function transaction<T>(callback: (client) => Promise<T>);
```

**Features:**
- Connection pooling
- Transaction support
- Error handling
- Query helper methods
- Graceful shutdown

## API Architecture

### RESTful API Endpoints

All API routes are in `src/routes/api/`:

#### Profile Templates (`/api/profiles/templates`)
```
GET    /                     - List templates
POST   /                     - Create template
GET    /:code                - Get specific template
PUT    /:code                - Update template
DELETE /:code                - Delete template
POST   /:code/clone          - Clone template
POST   /:code/rollback       - Rollback version
GET    /:code/versions       - Get version history
POST   /import               - Import from JSON
GET    /:code/export         - Export to JSON
POST   /validate             - Validate configuration
```

#### Inventory (`/api/inventory`)
```
GET    /                     - List inventory items
POST   /                     - Add inventory item
PUT    /:id                  - Update item
DELETE /:id                  - Delete item
```

#### FAQ (`/api/faq`)
```
GET    /                     - List FAQ documents
GET    /:slug                - Get specific document
```

#### Settings (`/api/settings`)
```
GET    /                     - Get settings
PUT    /                     - Update settings
```

### API Features

1. **Error Handling**
   - Consistent error responses
   - HTTP status codes
   - Detailed error messages

2. **Query Parameters**
   - Filtering (category, search, etc.)
   - Pagination (page, limit)
   - Include relationships (include=details)
   - Sorting options

3. **Authentication** (Ready for implementation)
   - User context via locals
   - Role-based access control
   - Session management hooks

## Frontend Architecture

### Component Structure

```
src/
├── lib/
│   ├── admin/              # Admin tools (profile builder, etc.)
│   ├── calendar/           # Calendar system
│   ├── inventory/          # Inventory management
│   ├── order/              # Order management
│   ├── ui/                 # Reusable UI components
│   ├── users/              # User management
│   ├── navigation/         # Navigation components
│   └── server/
│       └── db/             # Database layer
│           ├── connection.ts
│           ├── migrations/
│           └── seeds/
├── routes/
│   ├── api/                # API endpoints
│   ├── orders/             # Order pages
│   ├── calendar/           # Calendar page
│   ├── inventory/          # Inventory pages
│   ├── admin/              # Admin pages
│   └── +layout.svelte      # Root layout
└── locales/                # Translations (EN/RU/LV)
```

### State Management

**Current Implementation:**

1. **Svelte Stores** (Reactive)
   - `writable()` for local state
   - `derived()` for computed values
   - Automatic localStorage sync

2. **LocalStorage Stores** (Development)
   - `vcs-store.ts` - Orders with version control
   - `calendar/store.ts` - Calendar events
   - `user-store.ts` - User sessions

3. **API Integration** (Production)
   - Direct fetch calls from components
   - Response caching where appropriate
   - Optimistic updates

### Migration Path: LocalStorage → Database

**Step-by-step migration guide:**

1. **Create API Endpoints**
   ```typescript
   // src/routes/api/orders/+server.ts
   export const GET: RequestHandler = async () => {
     const result = await query('SELECT * FROM draft_orders');
     return json(result.rows);
   };
   ```

2. **Update Store to Use API**
   ```typescript
   // Before (localStorage)
   export const orders = writable<Order[]>(
     JSON.parse(localStorage.getItem('orders') || '[]')
   );

   // After (API)
   export const orders = writable<Order[]>([]);
   
   export async function loadOrders() {
     const res = await fetch('/api/orders');
     const data = await res.json();
     orders.set(data.items);
   }
   ```

3. **Update Components**
   ```svelte
   <script>
     import { orders, loadOrders } from '$lib/stores';
     
     onMount(async () => {
       await loadOrders();
     });
   </script>
   ```

## User Roles & Permissions

### Role Hierarchy

1. **SuperAdmin**
   - Full system access
   - User management
   - System settings
   - All admin functions

2. **Admin**
   - Create/edit orders
   - Manage profiles and materials
   - Assign loading dates
   - View all reports

3. **Operator**
   - View assigned orders
   - Update station status
   - Add notes and photos
   - Station-specific access

4. **Logistics**
   - View orders
   - Manage loading schedule
   - Generate manifests
   - Export reports

### Access Control

**Current:** Role checked in components
**Production:** Middleware + database-backed sessions

```typescript
// Component-level access control
$: isAdmin = $currentUser?.role === 'Admin' || 
             $currentUser?.role === 'SuperAdmin';
```

## Internationalization (i18n)

### Supported Languages
- **English (EN)** - Default
- **Russian (RU)** - Complete
- **Latvian (LV)** - Complete

### Translation Files
```
src/locales/
  ├── en.json
  ├── ru.json
  └── lv.json
```

### Usage
```svelte
<script>
  import { t } from 'svelte-i18n';
</script>

<h1>{$t('orderLists.title')}</h1>
```

### Database Multi-language
All database content tables include `_en`, `_ru`, `_lv` columns:
- `name_en`, `name_ru`, `name_lv`
- `description_en`, `description_ru`, `description_lv`
- `content_en`, `content_ru`, `content_lv`

## Theme System

### Available Themes
1. **Light** (Default)
2. **Dark**
3. **High Contrast** (Accessibility)

### CSS Custom Properties
```css
:root {
  --bg-0, --bg-1, --bg-2: Background layers
  --text, --muted: Text colors
  --border: Border color
  --accent-1, --accent-2: Brand colors
  --ok, --warn, --danger: Status colors
  --focus: Focus indicator
}
```

### Theme Switching
```typescript
// Stored in localStorage
document.documentElement.setAttribute('data-theme', 'dark');
```

## File Handling

### Supported File Types
- **PDF** - Primary drawings
- **CDR** - CorelDraw source files
- **JPG/PNG** - Images
- **SVG** - Vector graphics

### Upload Configuration
```env
MAX_FILE_SIZE=52428800        # 50MB
ALLOWED_FILE_TYPES=.pdf,.cdr,.jpg,.png,.svg
UPLOAD_DIR=uploads
```

### File Storage Strategy

**Current (Development):**
- Local filesystem in `uploads/` directory

**Production (Recommended):**
- Object storage (S3, MinIO, DigitalOcean Spaces)
- CDN for static assets
- Database stores metadata only

## Security Measures

### Current Implementation

1. **Environment Variables**
   - Sensitive config in `.env`
   - Never committed to git
   - `.env.example` for template

2. **SQL Injection Prevention**
   - Parameterized queries only
   - Input validation
   - Type checking

3. **CSRF Protection** (Ready)
   - SvelteKit built-in protection
   - Token-based validation

4. **XSS Prevention**
   - Svelte auto-escaping
   - Content Security Policy ready

### Production Recommendations

1. **Authentication**
   - JWT tokens or session cookies
   - Password hashing (bcrypt)
   - Rate limiting

2. **Authorization**
   - Role-based access control (RBAC)
   - Resource-level permissions
   - API key authentication

3. **Network Security**
   - HTTPS only
   - HSTS headers
   - CSP headers

4. **Database Security**
   - Connection over SSL/TLS
   - Principle of least privilege
   - Regular backups

## Performance Considerations

### Frontend Optimization

1. **Code Splitting**
   - Route-based splitting (automatic)
   - Component lazy loading
   - Dynamic imports for heavy features

2. **Asset Optimization**
   - Image lazy loading
   - SVG sprites for icons
   - CSS minification

3. **Caching Strategy**
   - API response caching
   - LocalStorage for offline support
   - Service Worker ready

### Backend Optimization

1. **Database**
   - Connection pooling (configured)
   - Indexes on frequently queried columns
   - Query optimization

2. **API**
   - Pagination for large datasets
   - Field selection (include=details)
   - Response compression

## Development Workflow

### Setup
```bash
npm install                    # Install dependencies
cp .env.example .env           # Configure environment
./scripts/init-database.sh     # Initialize database
npm run dev                    # Start dev server
```

### Build & Deploy
```bash
npm run build                  # Build for production
npm run preview                # Preview production build
```

### Database Management
```bash
# Run single migration
psql -U user -d db -f src/lib/server/db/migrations/001_profiles_schema.sql

# Run all migrations
./scripts/init-database.sh

# Reset database (development only)
dropdb reclame_oms && createdb reclame_oms
./scripts/init-database.sh
```

## Testing Strategy

### Current State
- Manual testing via UI
- API testing via Postman/curl
- Database integrity via SQL queries

### Recommended Additions
1. **Unit Tests**
   - Vitest configured
   - Test database utilities
   - API endpoint tests

2. **Integration Tests**
   - End-to-end workflows
   - Database transactions
   - File upload/processing

3. **Accessibility Tests**
   - Axe-core integration
   - Keyboard navigation
   - Screen reader compatibility

## Monitoring & Logging

### Development
- Console logging
- Browser DevTools
- PostgreSQL logs

### Production (Recommended)
- Application monitoring (e.g., Sentry)
- Performance monitoring (e.g., New Relic)
- Database monitoring
- Uptime monitoring

## Scalability Considerations

### Database
- PostgreSQL can handle millions of records
- Read replicas for scaling reads
- Partitioning for large tables

### Application
- Stateless API design
- Horizontal scaling ready
- Load balancer support

### File Storage
- Object storage for scale
- CDN for global distribution
- Cleanup jobs for old files

## Migration Roadmap

### Phase 1: Current (Development)
- ✅ Hybrid storage (localStorage + Database)
- ✅ Profile templates on database
- ✅ Inventory on database
- ✅ FAQ on database

### Phase 2: Production Preparation
- 🔲 Move orders to database API
- 🔲 Move calendar to database API
- 🔲 Implement authentication system
- 🔲 Add user management UI

### Phase 3: Production Features
- 🔲 Real-time notifications
- 🔲 WebSocket for chat
- 🔲 File processing workers
- 🔲 Advanced analytics

### Phase 4: Advanced Features
- 🔲 Mobile app (PWA)
- 🔲 QR code scanning
- 🔲 Barcode generation
- 🔲 External integrations

## Conclusion

Reclame OMS uses a modern, scalable architecture with:
- ✅ Production-ready database infrastructure
- ✅ RESTful API design
- ✅ Component-based frontend
- ✅ Multi-language support
- ✅ Theme system
- ✅ Clear migration path

The hybrid storage approach allows for rapid development while maintaining a clear path to full database integration for production deployment.

---

**Version:** 1.0.1  
**Last Updated:** November 14, 2024  
**Author:** Reclame OMS Team
