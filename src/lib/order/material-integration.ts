import { inventory } from '$lib/inventory/inventory-store';
import type { StockMovement } from '$lib/inventory/inventory-store';
import type { Order } from './types';

/**
 * Consume materials for an order
 * Parses materials from order.materials array and records stock movements
 */
export function consumeMaterialsForOrder(order: Order, username: string): void {
  if (!order.materials || order.materials.length === 0) return;
  
  // Parse materials from order.materials array
  order.materials.forEach(mat => {
    if (!mat.value) return;
    
    // Extract quantity and material ID (format: "materialId:colorId:quantity")
    // Or simple format: "materialName - quantity unit"
    const parts = mat.value.split(':');
    
    if (parts.length >= 3) {
      // Format: "materialId:colorId:quantity"
      const [materialId, colorId, quantityStr] = parts;
      const quantity = parseFloat(quantityStr);
      
      if (!materialId || !quantity || isNaN(quantity)) return;
      
      const movement: StockMovement = {
        id: crypto.randomUUID(),
        materialId,
        colorId: colorId || undefined,
        type: 'USAGE',
        quantity,
        orderId: order.id,
        performedBy: username,
        timestamp: new Date().toISOString(),
        notes: `Used for order ${order.id} - ${order.title}`
      };
      
      inventory.recordMovement(movement);
    }
  });
}

/**
 * Get all materials used for a specific order
 */
export function getMaterialsForOrder(orderId: string): StockMovement[] {
  let result: StockMovement[] = [];
  const unsubscribe = inventory.movements.subscribe(movements => {
    result = movements.filter(m => m.orderId === orderId);
  });
  unsubscribe();
  return result;
}

/**
 * Check if all required materials are available in stock
 */
export function checkMaterialAvailability(order: Order): boolean {
  if (!order.materials || order.materials.length === 0) return true;
  
  for (const mat of order.materials) {
    if (!mat.value) continue;
    
    const parts = mat.value.split(':');
    if (parts.length >= 3) {
      const [materialId, colorId, quantityStr] = parts;
      const requiredQty = parseFloat(quantityStr);
      
      if (isNaN(requiredQty)) continue;
      
      const availableQty = inventory.getStock(materialId, colorId);
      
      if (availableQty < requiredQty) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Get material usage summary for an order
 */
export function getOrderMaterialSummary(orderId: string): {
  totalMaterials: number;
  totalCost: number;
  movements: StockMovement[];
} {
  const movements = getMaterialsForOrder(orderId);
  
  return {
    totalMaterials: movements.length,
    totalCost: 0, // TODO: Calculate based on material prices
    movements
  };
}
