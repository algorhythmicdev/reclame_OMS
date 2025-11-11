# Materials & Inventory System Integration

## Overview

The Reclame OMS materials system is a comprehensive catalog that integrates across all modules:
- **Profile Configuration** - Material selection in manufacturing profiles
- **Draft Orders** - Material specification and tracking
- **Inventory Management** - Stock tracking and purchasing
- **Cost Calculation** - Material cost tracking and profitability
- **Production Planning** - Material availability checks
- **Waste Management** - Scrap and waste tracking
- **Reporting** - Material usage analytics

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CENTRAL CATALOGS                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Materials   │  │ Color Systems│  │   Suppliers  │     │
│  │  Database    │  │   Database   │  │   Database   │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
└─────────┼──────────────────┼──────────────────┼─────────────┘
          │                  │                  │
          ├──────────────────┼──────────────────┤
          │                  │                  │
┌─────────▼──────────────────▼──────────────────▼─────────────┐
│              MODULE INTEGRATION LAYER                         │
└─────────┬──────────┬──────────┬──────────┬──────────────────┘
          │          │          │          │
     ┌────▼───┐ ┌───▼────┐ ┌──▼─────┐ ┌──▼──────┐
     │Profile │ │ Orders │ │Inventor│ │Analytics│
     │Builder │ │ System │ │  y     │ │& Reports│
     └────────┘ └────────┘ └────────┘ └─────────┘
```

## Material Categories

### 1. PLEXIGLAS® Acrylic (Proplastik)
**Usage:** Profile faces, LED diffusion, clear glazing
**Inventory tracking:** Yes (sheets, thickness variants)
**Cost tracking:** Per sheet or per m²

### 2. PVC Foam Boards
**Usage:** Backing panels, lightweight signs, displays
**Inventory tracking:** Yes (sheets by thickness and color)
**Cost tracking:** Per sheet or per m²

### 3. Aluminum
**Usage:** Frames, structural support, backing
**Inventory tracking:** Yes (sheets, profiles, tubes)
**Cost tracking:** Per kg or per unit

### 4. Color Systems
**Usage:** Paint specification, film selection, branding
**Inventory tracking:** Yes (separate color_inventory table)
**Cost tracking:** Per liter/roll

## Integration Points

### Profile Configuration System
```
// Material selection in profile forms
{
  "section": "LINE_FREEZER",
  "fields": {
    "material": {
      "type": "material_selector",
      "options": ["PLEXIGLAS_XT_WN071", "PLEXIGLAS_XT_0F00"],
      // Links to materials table
      "inventory_check": true  // Check stock before order
    },
    "thickness": {
      "type": "thickness_selector",
      // Only show thicknesses available in inventory
      "dynamic_options": true
    }
  }
}
```

### Draft Order Material Tracking
```
// When operator creates order:
1. Select profile (e.g., P7st)
2. Configure materials (PLEXIGLAS XT WN071 3mm)
3. System checks inventory availability
4. Calculates required quantity
5. Creates material_usage record (linked to order)
6. Optionally reserves stock
```

### Inventory Management
```
// Stock movements automatically tracked:
- Purchase Order received → Stock increases
- Production Order started → Stock reserved
- Production completed → Stock consumed (material_usage)
- Waste recorded → Stock adjusted + waste_tracking
- Stocktake → Adjustment movements
```

### Cost Calculation
```
-- Calculate order material cost
SELECT
  o.po_number,
  SUM(mu.total_cost) as material_cost,
  SUM(mu.waste_quantity * mu.cost_per_unit) as waste_cost,
  SUM(mu.total_cost) + SUM(mu.waste_quantity * mu.cost_per_unit) as total_cost
FROM draft_orders o
JOIN material_usage mu ON mu.draft_order_id = o.id
WHERE o.id = $1
GROUP BY o.po_number;
```

## Workflow Examples

### Example 1: Creating P7st Order

1. **Operator** selects Profile 7st
2. **System** loads profile template with material fields
3. **Operator** configures:
   - LINE_FREEZER material: PLEXIGLAS XT WN071 3mm
   - BENDER material: ALU_MILL_1_5
   - PAINTING color: RAL 3020 (Traffic Red)
4. **System checks**:
   - PLEXIGLAS XT WN071 3mm stock: 15 sheets ✓
   - ALU_MILL_1_5 stock: 5 sheets ✓
   - RAL 3020 paint: 2 liters ✓
5. **Order created** with material links
6. **Production starts**:
   - Material reserved in inventory
   - Usage tracked in material_usage table
   - Waste recorded if any
7. **Production complete**:
   - Stock consumed
   - Costs calculated
   - Inventory updated

### Example 2: Low Stock Alert & Reordering

1. **System** runs daily stock check
2. **Detects** PLEXIGLAS XT WN071 3mm below reorder point
3. **Generates** stock alert
4. **Purchaser** reviews alert
5. **Creates** purchase order to Proplastik
6. **Supplier** confirms delivery
7. **Goods received**:
   - Stock updated
   - Cost per unit updated
   - Material cost history recorded

## API Endpoints

### Materials
```
GET    /api/materials                 - List all materials
GET    /api/materials/:id             - Get material details
GET    /api/materials/search          - Search materials
POST   /api/materials                 - Create material (admin)
PUT    /api/materials/:id             - Update material (admin)
```

### Inventory
```
GET    /api/inventory                 - List inventory
GET    /api/inventory/low-stock       - Low stock alerts
GET    /api/inventory/:id             - Stock item details
POST   /api/inventory/movement        - Record stock movement
GET    /api/inventory/stats           - Inventory statistics
```

### Purchase Orders
```
GET    /api/purchase-orders           - List POs
POST   /api/purchase-orders           - Create PO
PUT    /api/purchase-orders/:id       - Update PO
POST   /api/purchase-orders/:id/receive - Receive goods
```

### Material Usage
```
GET    /api/material-usage            - Usage history
POST   /api/material-usage            - Record usage
GET    /api/material-usage/order/:id  - Usage per order
GET    /api/material-usage/report     - Consumption report
```

### Waste Tracking
```
GET    /api/waste                     - Waste records
POST   /api/waste                     - Record waste
GET    /api/waste/analysis            - Waste analysis report
```

## Reporting & Analytics

### Available Reports

1. **Material Consumption Report**
   - Usage by material type
   - Waste percentage
   - Cost per order
   - Trends over time

2. **Inventory Valuation Report**
   - Total inventory value
   - Value by category
   - Slow-moving items
   - Stock turnover rate

3. **Purchase Analysis**
   - Spend by supplier
   - Delivery performance
   - Price trends
   - Lead time analysis

4. **Waste Analysis**
   - Waste by type
   - Cost impact
   - Waste reduction opportunities
   - Material efficiency

## Database Schema Summary

**Core Tables:**
- `materials` - Material catalog (50+ items)
- `color_systems` - Color catalog (2,600+ colors)
- `suppliers` - Supplier database
- `material_suppliers` - Pricing & relationships
- `inventory_stock` - Current stock levels
- `stock_movements` - All inventory transactions
- `purchase_orders` - PO management
- `material_usage` - Production consumption
- `color_inventory` - Paint/film inventory
- `waste_tracking` - Scrap tracking

## Next Steps

1. **Batch 3** - Build UI components for material selection
2. **Batch 4** - Implement inventory management screens
3. **Batch 5** - Create reporting dashboards
4. **Batch 6** - Mobile app for stocktaking

## Configuration

### Environment Variables
```
# Enable inventory features
ENABLE_INVENTORY=true
ENABLE_AUTO_REORDER=true
ENABLE_COST_TRACKING=true

# Stock alert thresholds
LOW_STOCK_THRESHOLD_PERCENT=25
CRITICAL_STOCK_THRESHOLD_PERCENT=10

# Proplastik integration (future)
PROPLASTIK_API_KEY=your_key_here
PROPLASTIK_AUTO_SYNC=true
```
