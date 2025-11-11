// src/lib/inventory/types.ts

import type { Material, ColorSystem } from '$lib/profiles/types';

/**
 * Supplier/Vendor information
 */
export interface Supplier {
  id: number;
  name: string;
  code: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  country?: string;
  website?: string;
  paymentTerms?: string;
  deliveryTimeDays?: number;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

/**
 * Material supplier relationship with pricing
 */
export interface MaterialSupplier {
  id: number;
  materialId: number;
  material?: Material;
  supplierId: number;
  supplier?: Supplier;
  supplierCode?: string;
  unitPrice: number;
  currency: string;
  minimumOrderQuantity?: number;
  unitOfMeasure: string;
  leadTimeDays?: number;
  isPreferred: boolean;
  lastPriceUpdate?: string;
  notes?: string;
}

/**
 * Inventory stock item
 */
export interface InventoryStock {
  id: number;
  materialId: number;
  material?: Material;
  thickness?: number;
  quantityInStock: number;
  unitOfMeasure: string;
  location?: string;
  minimumStockLevel?: number;
  reorderPoint?: number;
  lastStocktakeDate?: string;
  lastStocktakeQuantity?: number;
  costPerUnit?: number;
  totalValue?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Stock movement types
 */
export type StockMovementType =
  | 'PURCHASE'
  | 'SALE'
  | 'PRODUCTION_USE'
  | 'WASTE'
  | 'ADJUSTMENT'
  | 'TRANSFER'
  | 'RETURN'
  | 'DAMAGE'
  | 'STOCKTAKE';

/**
 * Stock movement record
 */
export interface StockMovement {
  id: number;
  inventoryStockId: number;
  inventoryStock?: InventoryStock;
  movementType: StockMovementType;
  quantity: number;
  unitOfMeasure: string;
  referenceType?: string;
  referenceId?: number;
  reason?: string;
  notes?: string;
  movedBy: string;
  movedAt: string;
}

/**
 * Purchase order status
 */
export type PurchaseOrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'CONFIRMED'
  | 'PARTIALLY_RECEIVED'
  | 'RECEIVED'
  | 'CANCELLED';

/**
 * Purchase order
 */
export interface PurchaseOrder {
  id: number;
  poNumber: string;
  supplierId: number;
  supplier?: Supplier;
  orderDate: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: PurchaseOrderStatus;
  subtotal?: number;
  tax?: number;
  shippingCost?: number;
  total?: number;
  currency: string;
  paymentStatus?: string;
  notes?: string;
  items?: PurchaseOrderItem[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Purchase order line item
 */
export interface PurchaseOrderItem {
  id: number;
  purchaseOrderId: number;
  materialId: number;
  material?: Material;
  thickness?: number;
  quantityOrdered: number;
  quantityReceived: number;
  unitOfMeasure: string;
  unitPrice: number;
  lineTotal?: number;
  notes?: string;
}

/**
 * Material usage in production
 */
export interface MaterialUsage {
  id: number;
  draftOrderId: number;
  orderProfileId?: number;
  materialId: number;
  material?: Material;
  thickness?: number;
  quantityUsed: number;
  unitOfMeasure: string;
  wasteQuantity: number;
  costPerUnit?: number;
  totalCost?: number;
  usageDate: string;
  recordedBy: string;
  notes?: string;
}

/**
 * Color inventory (paints, films, etc.)
 */
export type ColorProductType = 'PAINT' | 'FILM' | 'VINYL' | 'INK' | 'OTHER';

export interface ColorInventory {
  id: number;
  colorSystemId: number;
  colorSystem?: ColorSystem;
  productType: ColorProductType;
  brand?: string;
  productCode?: string;
  quantityInStock: number;
  unitOfMeasure: string;
  location?: string;
  minimumStockLevel?: number;
  costPerUnit?: number;
  expiryDate?: string;
  batchNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Material cost history for tracking
 */
export interface MaterialCostHistory {
  id: number;
  materialId: number;
  material?: Material;
  thickness?: number;
  costPerUnit: number;
  currency: string;
  effectiveDate: string;
  supplierId?: number;
  supplier?: Supplier;
  changedBy: string;
  reason?: string;
  createdAt: string;
}

/**
 * Waste tracking
 */
export type WasteType =
  | 'OFFCUT'
  | 'DEFECT'
  | 'MEASUREMENT_ERROR'
  | 'DAMAGE'
  | 'EXPIRED'
  | 'OTHER';

export interface WasteTracking {
  id: number;
  materialId: number;
  material?: Material;
  thickness?: number;
  quantityWasted: number;
  unitOfMeasure: string;
  wasteType: WasteType;
  reason?: string;
  draftOrderId?: number;
  costImpact?: number;
  recordedBy: string;
  recordedAt: string;
}

/**
 * Stock alert for low inventory
 */
export interface StockAlert {
  inventoryStockId: number;
  material: Material;
  thickness?: number;
  currentStock: number;
  minimumLevel: number;
  reorderPoint: number;
  deficit: number;
  suggestedOrderQuantity: number;
}

/**
 * Inventory statistics
 */
export interface InventoryStats {
  totalValue: number;
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  categories: Array<{
    category: string;
    value: number;
    items: number;
  }>;
}

/**
 * Material consumption report
 */
export interface MaterialConsumptionReport {
  materialId: number;
  material: Material;
  thickness?: number;
  totalUsed: number;
  totalWaste: number;
  wastePercentage: number;
  totalCost: number;
  ordersCount: number;
  period: {
    from: string;
    to: string;
  };
}
