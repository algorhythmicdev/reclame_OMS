# Phase 3: API Integration & Database Backend - Testing Guide

## Overview

Phase 3 implementation adds complete REST API for profile template management with:
- Full CRUD operations
- Version control and history tracking
- Template cloning and rollback
- Audit logging with triggers
- Transaction support

## Database Schema

### New Tables Created

1. **profile_sections** (template-specific)
   - Links sections to specific templates
   - Supports ordering, required flags, metadata

2. **profile_fields** (section-specific)
   - Links fields to sections
   - Supports 15+ field types
   - Includes validation, conditional logic, metadata

3. **template_versions**
   - Stores complete snapshots of templates
   - Enables version rollback
   - Tracks version history

4. **template_changes**
   - Audit log for all template modifications
   - Tracks CREATE, UPDATE, DELETE, CLONE, ROLLBACK actions
   - Links to user who made changes

### Migration File

Located at: `src/lib/server/db/migrations/005_profile_templates_extended.sql`

**To run migration:**
```bash
# Connect to PostgreSQL
psql -U reclame_admin -d reclame_oms -f src/lib/server/db/migrations/005_profile_templates_extended.sql
```

## API Endpoints

### 1. List Templates
```
GET /api/profiles/templates
```

**Query Parameters:**
- `include=details` - Include sections and fields
- `includeStats=true` - Include usage statistics
- `active=false` - Include inactive templates (default: active only)
- `search=term` - Search by code, name, description
- `page=1` - Page number (default: 1)
- `limit=50` - Results per page (default: 50)

**Example Response:**
```json
{
  "items": [
    {
      "id": 1,
      "code": "P7st",
      "name": "Profile 7st - Super Pro",
      "description": "Complete outdoor/indoor sign",
      "version": "1.0",
      "is_active": true,
      "metadata": {...},
      "sections_count": 3,
      "fields_count": 8,
      "created_at": "2024-11-12T...",
      "updated_at": "2024-11-12T..."
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50,
  "pages": 1
}
```

### 2. Create Template
```
POST /api/profiles/templates
```

**Request Body:**
```json
{
  "code": "P9test",
  "name": "Test Profile 9",
  "description": "Test template",
  "version": "1.0",
  "is_active": true,
  "metadata": {
    "icon": "layers",
    "complexity": "simple"
  },
  "sections": [
    {
      "name": "CNC_FREZER",
      "display_name_en": "CNC Frezer",
      "order_index": 1,
      "is_required": true,
      "metadata": {},
      "fields": [
        {
          "field_key": "material",
          "field_type": "material_field",
          "label_en": "Material",
          "order_index": 1,
          "is_required": true,
          "config": {"materialTypes": ["ACRYLIC"]},
          "metadata": {}
        }
      ]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "template": {...},
  "message": "Template P9test created successfully"
}
```

### 3. Get Single Template
```
GET /api/profiles/templates/:code
```

**Query Parameters:**
- `versions=true` - Include version history
- `changes=true` - Include change log

**Example:**
```
GET /api/profiles/templates/P7st?versions=true
```

**Response:**
```json
{
  "id": 1,
  "code": "P7st",
  "name": "Profile 7st - Super Pro",
  "sections": [...],
  "versions": [
    {
      "id": 1,
      "version": "1.0",
      "notes": "Initial version",
      "created_at": "2024-11-12T...",
      "created_by": "system"
    }
  ]
}
```

### 4. Update Template
```
PUT /api/profiles/templates/:code
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "version_notes": "Added new fields",
  "sections": [...]
}
```

**Response:**
```json
{
  "success": true,
  "version": "1.1",
  "message": "Template P7st updated to v1.1"
}
```

**Notes:**
- Automatically increments version (1.0 -> 1.1)
- Creates version snapshot
- Logs change in audit table

### 5. Delete Template
```
DELETE /api/profiles/templates/:code
```

**Query Parameters:**
- `hard=true` - Permanently delete (default: soft delete)

**Soft Delete (default):**
```
DELETE /api/profiles/templates/P7st
```
Marks template as inactive (is_active = false)

**Hard Delete:**
```
DELETE /api/profiles/templates/P7st?hard=true
```
Permanently deletes template (fails if used in orders)

### 6. Get Version History
```
GET /api/profiles/templates/:code/versions
```

**Query Parameters:**
- `snapshots=true` - Include full snapshot data
- `limit=50` - Number of versions to return

**Response:**
```json
{
  "code": "P7st",
  "versions": [
    {
      "id": 2,
      "version": "1.1",
      "notes": "Updated fields",
      "changes_count": 3,
      "created_at": "2024-11-12T...",
      "created_by": "admin"
    },
    {
      "id": 1,
      "version": "1.0",
      "notes": "Initial version",
      "changes_count": 0,
      "created_at": "2024-11-12T...",
      "created_by": "system"
    }
  ],
  "total": 2
}
```

### 7. Rollback to Version
```
POST /api/profiles/templates/:code/rollback
```

**Request Body:**
```json
{
  "version": "1.0"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template P7st rolled back to version 1.0",
  "version": "1.0"
}
```

**Notes:**
- Restores complete template structure from snapshot
- Deletes current sections/fields
- Updates template version
- Logs rollback action

### 8. Clone Template
```
POST /api/profiles/templates/:code/clone
```

**Request Body:**
```json
{
  "newCode": "P10",
  "newName": "Cloned Profile"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Template P7st cloned to P10",
  "newTemplate": {
    "id": 2,
    "code": "P10",
    "name": "Cloned Profile",
    "version": "1.0",
    ...
  }
}
```

## Testing Workflow

### Prerequisites
1. PostgreSQL database running
2. Run migration: `005_profile_templates_extended.sql`
3. Start dev server: `npm run dev`

### Test Sequence

#### 1. List Templates
```bash
curl http://localhost:5173/api/profiles/templates
```

#### 2. Get P7st Template Details
```bash
curl http://localhost:5173/api/profiles/templates/P7st?versions=true
```

#### 3. Create New Template
```bash
curl -X POST http://localhost:5173/api/profiles/templates \
  -H "Content-Type: application/json" \
  -d '{
    "code": "P9test",
    "name": "Test Profile",
    "sections": [
      {
        "name": "TEST_SECTION",
        "display_name_en": "Test Section",
        "order_index": 1,
        "fields": []
      }
    ]
  }'
```

#### 4. Update Template
```bash
curl -X PUT http://localhost:5173/api/profiles/templates/P9test \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Profile",
    "version_notes": "First update"
  }'
```

#### 5. Get Version History
```bash
curl http://localhost:5173/api/profiles/templates/P9test/versions
```

#### 6. Clone Template
```bash
curl -X POST http://localhost:5173/api/profiles/templates/P9test/clone \
  -H "Content-Type: application/json" \
  -d '{
    "newCode": "P10",
    "newName": "Cloned Test Profile"
  }'
```

#### 7. Rollback to Version
```bash
curl -X POST http://localhost:5173/api/profiles/templates/P9test/rollback \
  -H "Content-Type: application/json" \
  -d '{"version": "1.0"}'
```

#### 8. Soft Delete
```bash
curl -X DELETE http://localhost:5173/api/profiles/templates/P10
```

## Validation & Error Handling

### Code Validation
- Must start with "P"
- Followed by alphanumeric characters, hyphens, underscores
- Examples: `P7st`, `P1`, `P-custom-123`

### Version Format
- Semantic versioning: `major.minor`
- Examples: `1.0`, `1.1`, `2.0`
- Auto-increments minor version on update

### Field Type Validation
- Must be one of 15 supported types:
  - `material_field`, `color_ral`, `color_pantone`
  - `oracal_selector`, `signtrim_selector`
  - `dropdown`, `button_group`, `toggle`
  - `number`, `text`, `textarea`, `date`
  - `multi_select_chips`, `info_box`, `computed_field`

### Error Responses

**400 Bad Request:**
```json
{
  "message": "Invalid code format. Must start with 'P' followed by alphanumeric characters"
}
```

**404 Not Found:**
```json
{
  "message": "Template P99 not found"
}
```

**409 Conflict:**
```json
{
  "message": "Template with code P7st already exists"
}
```

**403 Forbidden:**
```json
{
  "message": "Admin access required"
}
```

## Database Audit Trail

### Automatic Change Logging

All template modifications are automatically logged via triggers:

```sql
SELECT * FROM template_changes 
WHERE template_id = 1 
ORDER BY created_at DESC;
```

**Example Results:**
```
id | template_id | change_type | entity_type | description              | created_by | created_at
---+-------------+-------------+-------------+--------------------------+------------+------------
5  | 1           | ROLLED_BACK | TEMPLATE    | Rolled back to v1.0      | admin      | 2024-11-12
4  | 1           | CLONED      | TEMPLATE    | Cloned to P10            | admin      | 2024-11-12
3  | 1           | UPDATED     | TEMPLATE    | NULL                     | admin      | 2024-11-12
2  | 1           | UPDATED     | TEMPLATE    | NULL                     | admin      | 2024-11-12
1  | 1           | CREATED     | TEMPLATE    | NULL                     | system     | 2024-11-12
```

## Security & Authorization

### Role-Based Access Control

**Current Implementation (Simplified):**
- Mock user in `locals.user` with role
- Admin role required for POST/PUT
- SuperAdmin role required for DELETE

**Roles:**
- `Admin` - Can create, update templates
- `SuperAdmin` - Can delete templates
- Other roles - Read-only access to active templates

### Future Enhancements
- Implement proper authentication middleware
- Add user session management
- Add JWT token validation
- Add permission-based access control

## Known Limitations

1. **Authentication:** Currently using mock user context. Full auth system needs implementation.

2. **Soft Delete:** Soft-deleted templates are still queryable by admins but hidden from regular users.

3. **Cascade Operations:** Hard delete cascades to all sections, fields, and versions. Use with caution.

4. **Transaction Timeouts:** Large template operations may timeout. Consider batch processing for bulk updates.

5. **Version Snapshots:** Large templates create large JSON snapshots. Consider compression for production.

## Next Steps

1. ✅ Complete database schema and migrations
2. ✅ Implement CRUD API endpoints
3. ✅ Add version control functionality
4. ✅ Implement audit logging
5. ⏳ Test endpoints with real database
6. ⏳ Add authentication middleware
7. ⏳ Update frontend to use real APIs
8. ⏳ Add API documentation (Swagger/OpenAPI)
9. ⏳ Add unit tests
10. ⏳ Add integration tests

## Support

For issues or questions:
- Check error logs in console
- Verify database connection
- Check migration ran successfully
- Verify user permissions
