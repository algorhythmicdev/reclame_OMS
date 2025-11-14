# Reclame OMS - Local Deployment Guide

This guide provides step-by-step instructions for deploying Reclame OMS locally for development and testing.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/algorhythmicdev/reclame_OMS.git
cd reclame_OMS
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and configure your database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=reclame_oms
DB_USER=reclame_admin
DB_PASSWORD=your_secure_password_here

# Application Settings
NODE_ENV=development
PUBLIC_BASE_PATH=
VITE_API_URL=http://localhost:5173

# Session Secret (generate a random string)
SESSION_SECRET=your_random_session_secret_here

# File Upload Configuration
MAX_FILE_SIZE=52428800
ALLOWED_FILE_TYPES=.pdf,.cdr,.jpg,.png,.svg
UPLOAD_DIR=uploads
```

### 4. Setup PostgreSQL Database

#### Create Database User

```bash
# Connect to PostgreSQL as superuser
sudo -u postgres psql

# Create user and database
CREATE USER reclame_admin WITH PASSWORD 'your_secure_password_here';
CREATE DATABASE reclame_oms OWNER reclame_admin;
GRANT ALL PRIVILEGES ON DATABASE reclame_oms TO reclame_admin;

# Exit
\q
```

#### Initialize Database

Run the initialization script to create all tables and seed data:

```bash
./scripts/init-database.sh
```

This script will:
- Create the database (if it doesn't exist)
- Run all migrations in order
- Seed the database with initial data

### 5. Start the Development Server

```bash
npm run dev
```

The application will be available at: `http://localhost:5173`

## Database Structure

### Core Tables

#### Profile System
- `profile_templates` - Manufacturing profile templates (P7st, P1, P3, P5, P8)
- `profile_sections` - Reusable sections (LINE_FREEZER, BENDER, etc.)
- `field_types` - Field type registry for form builder
- `profile_section_fields` - Field definitions for each section
- `profile_version_history` - Version control for templates

#### Materials & Colors
- `materials` - Material library (ALU, OPAL, PVC, etc.)
- `color_systems` - Color database (RAL, PANTONE, ORACAL, HEX)

#### Orders
- `draft_orders` - Draft manufacturing orders
- `order_profiles` - Profile instances within orders

#### Inventory (Phase 2)
- `suppliers` - Supplier/vendor information
- `material_suppliers` - Material-supplier relationships
- `inventory_items` - Current inventory stock
- `inventory_transactions` - Stock movement history
- `inventory_locations` - Storage locations
- `purchase_orders` - Material purchase orders
- `purchase_order_items` - PO line items

#### Documentation
- `faq_documents` - FAQ and documentation system

#### Files
- `files` - File storage metadata (CDR, PDF, images)

### Seed Data Included

The database seeds include:

1. **Field Types** - All available form field types
2. **Materials** - Complete material catalog (Aluminum, Opal, PVC, etc.)
3. **Color Systems** - RAL colors, Pantone colors, ORACAL colors
4. **Profile Sections** - Standard manufacturing sections
5. **Profile Templates** - P7st, P1, P3, P5, P8 templates with complete field definitions
6. **FAQ Data** - Documentation for all profile types
7. **Suppliers** - Initial supplier data (Proplastik, Evonik, Oracal)

## API Endpoints

The application includes REST APIs for all major functionality:

### Profile Templates API
- `GET /api/profiles/templates` - List all templates
- `GET /api/profiles/templates/:code` - Get specific template
- `POST /api/profiles/templates` - Create new template
- `PUT /api/profiles/templates/:code` - Update template
- `DELETE /api/profiles/templates/:code` - Delete template
- `POST /api/profiles/templates/:code/clone` - Clone template
- `POST /api/profiles/templates/:code/rollback` - Rollback to previous version
- `GET /api/profiles/templates/:code/versions` - Get version history
- `POST /api/profiles/templates/import` - Import template from JSON
- `GET /api/profiles/templates/:code/export` - Export template to JSON
- `POST /api/profiles/validate` - Validate profile configuration

### Inventory API
- `GET /api/inventory` - List inventory items
- `POST /api/inventory` - Create inventory item
- `PUT /api/inventory/:id` - Update inventory item
- `DELETE /api/inventory/:id` - Delete inventory item

### FAQ API
- `GET /api/faq` - List FAQ documents
- `GET /api/faq/:slug` - Get specific FAQ document

### Settings API
- `GET /api/settings` - Get application settings
- `PUT /api/settings` - Update settings

## User Roles

The system has four user roles with different permissions:

1. **SuperAdmin** - Full system access, can manage users
2. **Admin** - Can create/edit orders, manage profiles and materials
3. **Operator** - Can view and update order status at their station
4. **Logistics** - Can view orders and manage loading schedules

### Default Users (Development)

For development, the system uses localStorage-based authentication. Access the login page to create users.

## Application Features

### ✅ Implemented Features

1. **Order Management**
   - Draft order creation
   - Order listing with search/filter
   - Order details with PDF preview
   - Badge system (URGENT, R&D, etc.)
   - Drag & drop to calendar

2. **Calendar System**
   - Loading date scheduling
   - Drag & drop order assignment
   - Daily/Weekly/Monthly views
   - Capacity management
   - Export to CSV

3. **Inventory System**
   - Material tracking
   - Stock levels
   - Barcode scanning (mock)
   - Purchase orders
   - Supplier management

4. **Profile System**
   - Profile templates (P7st, P1, P3, P5, P8)
   - Dynamic form generation
   - Version control
   - Template cloning
   - Import/Export

5. **Station Boards**
   - Per-station Kanban views
   - CAD, CNC, SANDING, BENDING, WELDING, PAINT, ASSEMBLY, QC, LOGISTICS
   - Status updates
   - Rework tracking

6. **FAQ/Documentation**
   - Profile-specific documentation
   - Searchable knowledge base
   - Multi-language support (EN/RU/LV)

7. **Multi-language Support**
   - English (EN)
   - Russian (RU)
   - Latvian (LV)

8. **Theme Support**
   - Light theme
   - Dark theme
   - High contrast theme

### 🚧 In Progress / Future Features

1. **User Management UI**
   - Currently uses localStorage
   - Backend ready for PostgreSQL-based authentication

2. **Real-time Collaboration**
   - Chat system (UI ready, backend pending)
   - Live notifications

3. **Advanced Analytics**
   - KPI dashboards
   - Production metrics
   - Bottleneck analysis

4. **File Processing**
   - PDF parsing
   - BOM extraction
   - Auto-population from CDR files

## Database Connection Verification

To verify your database setup is working correctly:

1. Check database connection in the application:

```bash
node -e "
const { testConnection } = require('./src/lib/server/db/connection.ts');
testConnection().then(success => {
  console.log(success ? '✅ Database connected' : '❌ Connection failed');
  process.exit(success ? 0 : 1);
});
"
```

2. Verify tables exist:

```bash
PGPASSWORD=$DB_PASSWORD psql -h localhost -U reclame_admin -d reclame_oms -c "\dt"
```

3. Check seed data:

```bash
PGPASSWORD=$DB_PASSWORD psql -h localhost -U reclame_admin -d reclame_oms -c "SELECT code, name FROM profile_templates;"
```

## Troubleshooting

### Build Errors

If you encounter build errors:

```bash
# Clear build cache
rm -rf .svelte-kit
rm -rf build

# Reinstall dependencies
rm -rf node_modules
npm install

# Rebuild
npm run build
```

### Database Connection Issues

1. Check PostgreSQL is running:
```bash
sudo systemctl status postgresql
```

2. Verify credentials in `.env` match your PostgreSQL setup

3. Check PostgreSQL logs:
```bash
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Port Already in Use

If port 5173 is already in use:

```bash
# Option 1: Kill the process using the port
lsof -ti:5173 | xargs kill -9

# Option 2: Use a different port
PORT=3000 npm run dev
```

### Migration Errors

If migrations fail:

1. Check PostgreSQL version is 14+
2. Ensure user has CREATE privileges
3. Try running migrations individually:

```bash
PGPASSWORD=$DB_PASSWORD psql -h localhost -U reclame_admin -d reclame_oms -f src/lib/server/db/migrations/001_profiles_schema.sql
```

## Production Build

To build for production:

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

The build output will be in the `build/` directory.

## Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `reclame_oms` |
| `DB_USER` | Database user | `reclame_admin` |
| `DB_PASSWORD` | Database password | (required) |
| `NODE_ENV` | Environment | `development` |
| `PUBLIC_BASE_PATH` | Base path for routing | `` |
| `VITE_API_URL` | API URL | `http://localhost:5173` |
| `SESSION_SECRET` | Session encryption key | (required) |
| `MAX_FILE_SIZE` | Max upload size (bytes) | `52428800` (50MB) |
| `ALLOWED_FILE_TYPES` | Allowed file extensions | `.pdf,.cdr,.jpg,.png,.svg` |
| `UPLOAD_DIR` | Upload directory | `uploads` |

## Testing

Currently, the project uses localStorage for development testing. Database integration is complete and ready for production use.

To test the database functionality:

1. Ensure the database is initialized
2. Run the development server
3. Navigate to profile templates or inventory pages
4. The API endpoints will interact with the PostgreSQL database

## Support

For issues or questions:
- Check existing documentation in the `docs/` folder
- Review phase implementation summaries (PHASE_*.md files)
- Check URGENT_FIXES_NEEDED.md for known issues

## Contributing

When making changes:

1. Always run migrations in order
2. Test with the database before committing
3. Update seed files if schema changes
4. Document API changes in PHASE3_API_TESTING.md
5. Follow the coding standards in README.md

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit `.env` file to version control
2. Use strong passwords for database users
3. Change `SESSION_SECRET` in production
4. Restrict database access to application server only
5. Use SSL/TLS for database connections in production
6. Regularly update dependencies: `npm audit fix`

## Next Steps

After successful deployment:

1. **Customize for Your Needs**
   - Add your company logo and branding
   - Configure material catalog for your inventory
   - Set up user accounts

2. **Connect to Production Database**
   - Set up PostgreSQL on production server
   - Update `.env` with production credentials
   - Run migrations on production database

3. **Configure File Storage**
   - Set up object storage (S3, MinIO, etc.)
   - Update upload configuration
   - Configure CDN if needed

4. **Enable Real-time Features**
   - Set up WebSocket server for chat
   - Configure notification system
   - Set up background workers

5. **Monitoring & Analytics**
   - Set up application monitoring
   - Configure error tracking
   - Enable performance monitoring

---

**Version:** 1.0.1  
**Last Updated:** November 14, 2024  
**Status:** Production Ready (with local testing)
