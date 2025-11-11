# Profile 7st Form Components

Complete implementation of Profile 7st form components matching PDF layout exactly.

## 📋 Overview

This implementation provides a comprehensive form system for Profile 7st (OUTDOOR/INDOOR SIGN) manufacturing orders, with visual components that match the exact style of the PDF forms used in production.

## 🎨 New Components

### 1. OracalSelector.svelte
**Location:** `src/lib/profiles/components/fields/OracalSelector.svelte`

ORACAL 8500 series film color selector with visual grid display.

**Features:**
- Visual color grid with actual film colors
- Color codes displayed (063, 060, 097, etc.)
- Search/filter by color name or code
- Popular colors section (⭐ Most Used)
- Color preview boxes with hex values
- Live preview of selected color

**Props:**
```typescript
value: string          // Selected color code
label: string          // Field label
series: string         // ORACAL series (default: '8500')
required: boolean      // Is field required
disabled: boolean      // Is field disabled
showColorPreview: boolean  // Show selected color preview
```

**Usage:**
```svelte
<OracalSelector 
  bind:value={oracalColor}
  label="ORACAL Film"
  series="8500"
  showColorPreview={true}
/>
```

### 2. ButtonGroup.svelte
**Location:** `src/lib/profiles/components/fields/ButtonGroup.svelte`

Visual button group for options like LED color temperature with colored boxes.

**Features:**
- Two visual styles: 'buttons' or 'boxes'
- Smart color detection (WHITE 6000K, BLACK, etc.)
- Multi-select support
- Auto text color contrast
- PDF-style colored backgrounds

**Props:**
```typescript
value: string              // Selected value(s)
options: string[]          // Available options
label: string              // Field label
required: boolean          // Is field required
disabled: boolean          // Is field disabled
visualStyle: 'buttons' | 'boxes'  // Display style
multiSelect: boolean       // Allow multiple selections
```

**Usage:**
```svelte
<ButtonGroup
  bind:value={ledTemp}
  label="LED Color Temperature"
  options={['WARM WHITE 3000K', 'WHITE 6000K', '9000K']}
  visualStyle="boxes"
/>
```

### 3. InfoBox.svelte
**Location:** `src/lib/profiles/components/fields/InfoBox.svelte`

Warning boxes, notes, and special instructions matching PDF style.

**Features:**
- Three types: info (blue), warning (yellow), danger (red)
- Icon support (alert-circle, info, alert-triangle)
- HTML content support
- Full-width option for grid layouts

**Props:**
```typescript
content: string            // HTML content
type: 'info' | 'warning' | 'danger'  // Box type
icon: string               // Icon name
fullWidth: boolean         // Span full grid width
```

**Usage:**
```svelte
<InfoBox
  content="<strong>Important:</strong> Акрил лицевик: фрезеруем по максимуму"
  type="warning"
  icon="alert-circle"
/>
```

### 4. QuantitySelector.svelte
**Location:** `src/lib/profiles/components/QuantitySelector.svelte`

Colorful vertical quantity buttons (1-10 pcs) matching PDF forms.

**Features:**
- 10 colorful buttons with distinct colors
- Vertical layout (left side of form)
- Selected state with visual feedback
- Hover animations

**Props:**
```typescript
quantity: number           // Selected quantity
maxQuantity: number        // Maximum quantity (default: 10)
disabled: boolean          // Is field disabled
```

**Usage:**
```svelte
<QuantitySelector 
  bind:quantity={qty}
  maxQuantity={10}
/>
```

### 5. ProfileFormVisual.svelte
**Location:** `src/lib/profiles/components/ProfileFormVisual.svelte`

PDF-style form renderer with horizontal sections and black headers.

**Features:**
- Horizontal section layout (like PDF)
- Black section headers with white text
- Visual colored boxes for materials/colors
- Support for all field types
- Conditional field logic
- Responsive layout

**Props:**
```typescript
profileCode: string        // Profile code (e.g., 'P7st')
configuration: object      // Form configuration data
readonly: boolean          // Is form readonly
```

**Usage:**
```svelte
<ProfileFormVisual
  profileCode="P7st"
  bind:configuration={config}
  readonly={false}
/>
```

## 📦 PDF Generator

### generateProfilePDF.ts
**Location:** `src/lib/profiles/utils/generateProfilePDF.ts`

Generates PDF matching exact layout from the forms.

**Features:**
- "invoice" header in red
- PO-XXXX number
- Colorful quantity buttons on left
- Profile name (magenta badge)
- Horizontal sections with black headers
- Colored boxes for materials/colors
- Client info footer
- Delivery date box

**Usage:**
```typescript
import { generateProfilePDF } from '$lib/profiles/utils';

const pdf = await generateProfilePDF({
  poNumber: 'PO-1234',
  profileCode: 'P7st',
  profileName: 'Profile 7st - Super Pro',
  quantity: 2,
  configuration: { /* field values */ },
  deliveryDate: '2024-12-15',
  clientInfo: {
    name: 'Client Name',
    address: 'Address',
    country: 'Country'
  }
});

// Download the PDF
const url = URL.createObjectURL(pdf);
const a = document.createElement('a');
a.href = url;
a.download = 'profile-p7st.pdf';
a.click();
```

## 🗄️ Database Schema

### Migration: 004_add_metadata_to_fields.sql
Adds metadata column to `profile_section_fields` for visual styling.

### Seed: 006_p7st_complete_template.sql
Complete Profile 7st template with all sections and fields:

**Sections:**
1. **CNC FREZER** - Face/Back materials, thicknesses
2. **BENDER** - Sides material, depth
3. **FRONT** - OPAL, Film/Print options
4. **PAINTING** - Sides/Back colors, Frame options
5. **ASSEMBLING** - LED, TRAFO, CABLES, WATERHOLES, mounting options
6. **DELIVERY** - Delivery date

**Field Types:**
- `material_field` - MaterialField component
- `dropdown` - Dropdown selector
- `toggle` - Toggle switch
- `color_ral` - RAL color picker
- `button_group` - Button group selector
- `oracal_selector` - ORACAL film selector
- `info_box` - Info/warning boxes
- `numeric_input` - Number input
- `textarea` - Text area
- `date_input` - Date picker

## 🧪 Testing

### Visual Test Page
**URL:** `/profile-visual-test`

Demonstrates all components with live examples:
- ORACAL Film Selector
- Button Group (LED Temperature)
- Info Boxes (info, warning, danger)
- Quantity Selector
- Complete Form Layout preview

### Running Tests
```bash
# Build the project
npm run build

# Run dev server
npm run dev

# Visit http://localhost:5173/profile-visual-test
```

## 📝 Field Configuration Examples

### Material Field with Visual Box
```sql
INSERT INTO profile_section_fields (...) VALUES (
  ...,
  'face_material',
  'material_field',
  'FACE',
  ...,
  '{
    "materialTypes": ["ACRYLIC"],
    "defaultMaterial": "PLEXIGLAS_XT_WN071"
  }'::jsonb,
  '{"column": 1, "visualBox": true}'::jsonb
);
```

### Conditional Field (LED Brand)
```sql
INSERT INTO profile_section_fields (...) VALUES (
  ...,
  'led_brand',
  'dropdown',
  'LED Brand',
  ...,
  '{"options": ["BaltLED 6500K", "SLOAN 6500K"]}'::jsonb,
  '{"conditionalOn": "led_type", "showIf": "!= NO LED"}'::jsonb
);
```

### Visual Box with Custom Color
```sql
INSERT INTO profile_section_fields (...) VALUES (
  ...,
  'trafo_type',
  'dropdown',
  'TRAFO',
  ...,
  '{"options": ["REGULAR", "SLOAN INSIDE SIGN"]}'::jsonb,
  '{"visualBox": true, "boxColor": "#F59E0B"}'::jsonb
);
```

## 🎨 Styling Guide

### Visual Boxes
All material and color fields can display as colored boxes:
```typescript
metadata: {
  visualBox: true,        // Enable visual box
  boxColor: "#3B82F6",    // Custom background color
  boxTextColor: "#fff"    // Custom text color (auto if omitted)
}
```

### Section Headers
Sections use dark headers with configurable colors:
```typescript
metadata: {
  color: "#1a1a1a",  // Header background color
  icon: "cpu"        // Optional icon
}
```

### Layout Columns
Fields can be organized in columns within sections:
```typescript
metadata: {
  column: 1,        // Column number
  fullWidth: true   // Span all columns
}
```

## 🔧 Dependencies

- **jsPDF** - PDF generation library
- **lucide-svelte** - Icon library
- Existing Material Field, ColorRAL components

## 📚 Related Files

**Components:**
- `src/lib/profiles/components/fields/MaterialField.svelte` - Material selector
- `src/lib/profiles/components/fields/ColorRAL.svelte` - RAL color picker
- `src/lib/profiles/components/ProfileForm.svelte` - Standard form renderer

**Types:**
- `src/lib/profiles/types.ts` - TypeScript type definitions

**Database:**
- `src/lib/server/db/migrations/001_profiles_schema.sql` - Base schema
- `src/lib/server/db/seeds/004_profile_sections.sql` - Section definitions
- `src/lib/server/db/seeds/001_field_types.sql` - Field type registry

## 🚀 Future Enhancements

- [ ] Real-time PDF preview
- [ ] Form validation with error messages
- [ ] Auto-save draft configurations
- [ ] Print-friendly CSS
- [ ] Export to multiple formats (PNG, SVG)
- [ ] Field dependency resolver
- [ ] Custom ORACAL series support
- [ ] Material library integration

## 📄 License

Part of the reclame_OMS project. See main project LICENSE for details.
