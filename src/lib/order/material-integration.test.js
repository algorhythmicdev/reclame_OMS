import { describe, it, expect } from 'vitest';

// Mock crypto.randomUUID for testing if not available
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  global.crypto = global.crypto || {};
  if (!crypto.randomUUID) {
    crypto.randomUUID = () => Math.random().toString(36).substring(7);
  }
}

describe('material-integration', () => {
  it('can consume materials for an order', async () => {
    const { consumeMaterialsForOrder } = await import('./material-integration.js');
    const { inventory } = await import('../inventory/inventory-store.js');
    
    // Add a material
    inventory.addMaterial({
      id: 'mat-test-1',
      category: 'COMPOSITE',
      subtype: 'ACM_PANEL',
      name: 'Test Panel',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    
    // Add stock
    inventory.recordMovement({
      id: 'mov-test-1',
      materialId: 'mat-test-1',
      type: 'RECEIPT',
      quantity: 50,
      performedBy: 'test',
      timestamp: new Date().toISOString()
    });
    
    // Create mock order
    const order = {
      id: 'order-1',
      title: 'Test Order',
      materials: [
        { key: 'material1', label: 'Panel', value: 'mat-test-1::5' }
      ]
    };
    
    consumeMaterialsForOrder(order, 'test-user');
    
    // Check stock was reduced
    const remainingStock = inventory.getStock('mat-test-1');
    expect(remainingStock).toBe(45); // 50 - 5
  });
  
  it('can get materials used for an order', async () => {
    const { getMaterialsForOrder } = await import('./material-integration.js');
    
    const movements = getMaterialsForOrder('order-1');
    expect(movements.length > 0).toBe(true);
    expect(movements[0].orderId).toBe('order-1');
  });
  
  it('can check material availability', async () => {
    const { checkMaterialAvailability } = await import('./material-integration.js');
    
    const orderWithEnoughStock = {
      id: 'order-2',
      materials: [
        { key: 'material1', label: 'Panel', value: 'mat-test-1::10' }
      ]
    };
    
    const orderWithoutEnoughStock = {
      id: 'order-3',
      materials: [
        { key: 'material1', label: 'Panel', value: 'mat-test-1::100' }
      ]
    };
    
    expect(checkMaterialAvailability(orderWithEnoughStock)).toBe(true);
    expect(checkMaterialAvailability(orderWithoutEnoughStock)).toBe(false);
  });
  
  it('handles orders without materials', async () => {
    const { consumeMaterialsForOrder, checkMaterialAvailability } = await import('./material-integration.js');
    
    const orderNoMaterials = {
      id: 'order-4',
      materials: []
    };
    
    // Should not throw
    consumeMaterialsForOrder(orderNoMaterials, 'test-user');
    expect(checkMaterialAvailability(orderNoMaterials)).toBe(true);
  });
});
