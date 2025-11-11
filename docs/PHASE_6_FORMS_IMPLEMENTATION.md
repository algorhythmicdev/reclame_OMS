# Phase 6: Profile Forms Implementation Guide

**Version:** 1.0.0  
**Last Updated:** November 11, 2025  
**Status:** Production Ready

---

## 📖 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Material Field System](#material-field-system)
3. [Field Components](#field-components)
4. [Profile Templates](#profile-templates)
5. [Visual Form Renderer](#visual-form-renderer)
6. [API Endpoints](#api-endpoints)
7. [Role-Based Access](#role-based-access)
8. [Testing Guide](#testing-guide)
9. [Deployment Checklist](#deployment-checklist)

---

## 🏗️ Architecture Overview

### System Flow

```
┌──────────────┐
│ Orders Page  │ (User selects "New Draft Order")
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Draft Order Modal│
│ ├─ Client Info   │
│ ├─ Files Upload  │
│ └─ Profile Select│ ◄── Selects Profile (P1, P3, P5, P7st, P8)
└──────┬───────────┘
       │
       ▼
┌─────────────────────────┐
│ Profile Form Visual     │
│ ┌─────────────────────┐ │
│ │ CNC | BEND | PAINT │ │ ◄── Horizontal sections
│ │ ─── | ──── | ───── │ │
│ │ [Material Fields]   │ │ ◄── Material → Thickness
│ │ [Color RAL Fields]  │ │ ◄── RAL/PANTONE/ORACAL
│ │ [Visual Boxes]      │ │ ◄── Colored boxes (PDF style)
│ └─────────────────────┘ │
└──────┬──────────────────┘
       │
       ▼
┌──────────────────┐
│ Validation API   │ ◄── Check required fields, types, rules
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Save to Database │ ◄── Store configuration as JSONB
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Generate PDF     │ ◄── Create invoice matching exact PDF layout
└──────────────────┘
```

---

## 🔧 Material Field System

### The Three-Tier Material Selection

**CRITICAL CONCEPT:** Materials are separated into three distinct layers:

#### Tier 1: Material Type
```typescript
type MaterialType = 'ACRYLIC' | 'ALUMINUM' | 'PVC';
```

**User sees:** Three buttons to select material category

#### Tier 2: Specific Material/Color
```typescript
// For ACRYLIC:
{
  materialId: 142,
  materialCode: 'PLEXIGLAS_XT_WN071',
  materialName: 'PLEXIGLAS® XT White Opal'
}

// For ALUMINUM:
{
  materialCode: 'ALU',
  finish: 'Mill Finish' | 'Brushed Horizontal' | 'Anodized'
}

// For PVC:
{
  materialCode: 'PVC_WHITE',
  color: 'White' | 'Black' | 'Grey'
}
```

**User sees:**
- **Acrylic**: Grid of PLEXIGLAS codes (WN071, WN297, colored variants)
- **Aluminum**: Finish selector (Mill/Brushed/Anodized)
- **PVC**: Color dropdown

#### Tier 3: Thickness
```typescript
{
  thickness: 3.0, // in mm
  unit: 'mm'
}
```

**User sees:** 
- Preset buttons (3mm, 5mm, 6mm, 8mm)
- Custom input for non-standard sizes

### Complete Material Value Structure

```typescript
interface MaterialFieldValue {
  materialType: 'ACRYLIC' | 'ALUMINUM' | 'PVC';
  materialId?: number;          // Database ID (for ACRYLIC)
  materialCode: string;          // e.g., "PLEXIGLAS_XT_WN071", "ALU", "PVC_WHITE"
  materialName?: string;         // Display name
  thickness?: number;            // in mm
  finish?: string;               // For aluminum/PVC
  metadata?: {
    hex?: string;                // Color preview
    supplier?: string;           // Proplastik
    category?: string;           // For filtering
  };
}
```

### Visual Box Rendering

When user completes selection, display colored box:

```html
<!-- Example: OPAL WN071 3mm -->
<div class="visual-box" style="background-color: #F5F5F0; border: 2px solid #000;">
  <span>OPAL</span>
  <span class="thickness">3mm</span>
</div>

<!-- Example: ALU 1.5 -->
<div class="visual-box" style="background-color: #C0C0C0; border: 2px solid #000;">
  <span>ALU 1.5</span>
</div>

<!-- Example: RAL 3020 (Red) -->
<div class="visual-box" style="background-color: #CC0605; color: #fff; border: 2px solid #000;">
  <span>3020</span>
</div>
```

---

## 🧩 Field Components Reference

### Available Field Types

| Field Type | Component | Use Case | Example |
|------------|-----------|----------|---------|
| `material_field` | MaterialField.svelte | Material selection with thickness | Face, Back, Sides |
| `color_ral` | ColorRAL.svelte | RAL color selection | Painting sections |
| `color_pantone` | ColorPANTONE.svelte | PANTONE matching | Brand colors |
| `oracal_selector` | OracalSelector.svelte | ORACAL film selection | Front finish |
| `signtrim_selector` | SignTrimSelector.svelte | SignTrim colors | Profile P5 trim |
| `dropdown` | Dropdown.svelte | Simple option selection | LED types |
| `button_group` | ButtonGroup.svelte | Visual option buttons | LED temp |
| `toggle` | ToggleSwitch.svelte | Boolean fields | WATERHOLES |
| `number` | NumberInput | Numeric values | Depth, width |
| `text` | TextInput | Free text | Cable length |
| `textarea` | TextArea | Multi-line text | Special instructions |
| `date` | DatePicker | Date selection | Delivery date |
| `multi_select_chips` | MultiSelectChips.svelte | Multiple selections | Waterhole locations |
| `info_box` | InfoBox.svelte | Warnings/notes | Milling instructions |
| `computed_field` | ComputedField.svelte | Display only | Shows related values |

---

## 📋 Profile Templates

### Template Structure

Each profile template consists of:

1. **Metadata** (name, description, version, timeline)
2. **Sections** (CNC, BENDER, PAINTING, etc.)
3. **Fields** within each section
4. **Validation rules**
5. **Conditional logic** (field visibility)

### Example: Profile P7st Structure

```json
{
  "code": "P7st",
  "name": "Profile 7st - Super Pro",
  "version": 1,
  "metadata": {
    "typical_timeline": "8-10 days",
    "complexity": "complex",
    "color": "#E91E63"
  },
  "sections": [
    {
      "name": "CNC_FREZER",
      "display_name_en": "CNC FREZER",
      "order_index": 1,
      "metadata": { "color": "#1a1a1a" },
      "fields": [
        {
          "field_key": "face_material",
          "field_type": "material_field",
          "label_en": "FACE",
          "is_required": true,
          "config": {
            "materialTypes": ["ACRYLIC"],
            "allowedCodes": ["WN071", "WN297", "0F00"]
          },
          "metadata": {
            "visualBox": true,
            "column": 1
          }
        }
      ]
    }
  ]
}
```

---

## 🎨 Visual Form Renderer

### Section Layout (Horizontal)

```
┌──────────┬──────────┬──────────┬──────────┬──────────┬──────────┐
│CNC FREZER│  BENDER  │  FRONT   │ PAINTING │ASSEMBLING│ DELIVERY │
├──────────┼──────────┼──────────┼──────────┼──────────┼──────────┤
│  FACE    │  SIDES   │   OPAL   │  SIDES   │   LED    │ Oct 27   │
│  ┌────┐  │  ┌────┐  │  ┌────┐  │  ┌────┐  │  ┌────┐  │   2025   │
│  │OPAL│  │  │ALU │  │  │3mm │  │  │3020│  │  │Balt│  │          │
│  │3mm │  │  │1.2 │  │  │    │  │  │RED │  │  │LED │  │          │
│  └────┘  │  └────┘  │  └────┘  │  └────┘  │  └────┘  │          │
└──────────┴──────────┴──────────┴──────────┴──────────┴──────────┘
```

### Responsive Behavior

- **Desktop (>1024px)**: Horizontal sections
- **Tablet (768-1024px)**: 2-3 sections per row
- **Mobile (<768px)**: Vertical stacking, one section per row

---

## 📡 API Endpoints

### GET /api/profiles/templates
List all available profile templates

**Query Parameters:**
- `active` (boolean, default: true) - Filter by active status

**Response:**
```json
{
  "items": [
    {
      "id": 1,
      "code": "P7st",
      "name": "Profile 7st - Super Pro",
      "description": "Complete outdoor/indoor sign",
      "version": 1,
      "is_active": true,
      "metadata": {
        "typical_timeline": "8-10 days",
        "complexity": "complex"
      }
    }
  ],
  "total": 5
}
```

### POST /api/profiles/validate
Validate profile configuration against template

**Request Body:**
```json
{
  "profileCode": "P7st",
  "configuration": {
    "CNC_FREZER": {
      "face_material": {
        "materialType": "ACRYLIC",
        "materialCode": "WN071",
        "thickness": 3
      }
    }
  }
}
```

**Response:**
```json
{
  "valid": true,
  "errors": []
}
```

Or with errors:
```json
{
  "valid": false,
  "errors": [
    {
      "section": "CNC_FREZER",
      "field": "face_material",
      "message": "face_material is required"
    }
  ]
}
```

---

## 🔐 Role-Based Access Control

### Permission Matrix

| Feature | Operator | Admin | Super Admin |
|---------|----------|-------|-------------|
| View orders | ✅ Own only | ✅ All | ✅ All |
| Create draft orders | ✅ | ✅ | ✅ |
| Edit draft orders | ✅ Own only | ✅ All | ✅ All |
| Delete orders | ❌ | ✅ | ✅ |
| Send to production | ❌ | ✅ | ✅ |
| Profile Template Builder | ❌ | ✅ | ✅ |
| Materials Management | ❌ | ✅ | ✅ |

---

## 🧪 Testing Guide

### Unit Tests

```typescript
// tests/unit/MaterialField.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import MaterialField from '$lib/profiles/components/fields/MaterialField.svelte';

describe('MaterialField', () => {
  it('shows material types', () => {
    const { getByText } = render(MaterialField, {
      materialTypes: ['ACRYLIC', 'ALUMINUM']
    });
    
    expect(getByText('Acrylic')).toBeInTheDocument();
    expect(getByText('Aluminum')).toBeInTheDocument();
  });
});
```

---

## ✅ Deployment Checklist

### Pre-Deployment

- [ ] All profile templates seeded in database
- [ ] Materials catalog imported (PLEXIGLAS, ORACAL, RAL)
- [ ] User roles assigned correctly
- [ ] Environment variables set

### Database Migrations

```bash
# Run in order
pnpm db:migrate:001_core_schema
pnpm db:migrate:002_materials_system
pnpm db:migrate:003_profile_templates
pnpm db:seed:materials
pnpm db:seed:profile_templates
```

### Post-Deployment

- [ ] Test order creation flow end-to-end
- [ ] Verify admin FAB menu visibility
- [ ] Test role-based access
- [ ] Monitor error logs for first 48 hours

---

## 🆘 Troubleshooting

### Common Issues

**Material Selection Not Saving:**
- Verify materialId is being captured
- Check database foreign key constraints
- Validate JSONB structure in PostgreSQL

**Admin Menu Not Showing:**
- Clear browser cache
- Verify user role in database
- Check session/JWT token payload

---

**For Support:** Contact dev team at #reclame-oms-dev
