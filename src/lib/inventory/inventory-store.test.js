import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';

// Mock crypto.randomUUID for testing if not available
if (typeof crypto === 'undefined' || !crypto.randomUUID) {
  global.crypto = global.crypto || {};
  if (!crypto.randomUUID) {
    crypto.randomUUID = () => Math.random().toString(36).substring(7);
  }
}

describe('inventory-store', () => {
  it('can add a material', async () => {
    const { inventory } = await import('./inventory-store.js');
    
    const material = {
      id: 'test-mat-1',
      category: 'COMPOSITE',
      subtype: 'ACM_PANEL',
      name: 'Test ACM Panel',
      minStockLevel: 10,
      reorderPoint: 15,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    inventory.addMaterial(material);
    
    const materials = get(inventory.materials);
    const added = materials.find(m => m.id === 'test-mat-1');
    expect(!!added).toBe(true);
    expect(added.name).toBe('Test ACM Panel');
  });
  
  it('can record stock receipt', async () => {
    const { inventory } = await import('./inventory-store.js');
    
    const movement = {
      id: 'mov-1',
      materialId: 'test-mat-1',
      type: 'RECEIPT',
      quantity: 20,
      performedBy: 'test-user',
      timestamp: new Date().toISOString()
    };
    
    inventory.recordMovement(movement);
    
    const stock = inventory.getStock('test-mat-1');
    expect(stock).toBe(20);
  });
  
  it('can record stock usage', async () => {
    const { inventory } = await import('./inventory-store.js');
    
    const movement = {
      id: 'mov-2',
      materialId: 'test-mat-1',
      type: 'USAGE',
      quantity: 5,
      performedBy: 'test-user',
      timestamp: new Date().toISOString()
    };
    
    inventory.recordMovement(movement);
    
    const stock = inventory.getStock('test-mat-1');
    expect(stock).toBe(15); // 20 - 5
  });
  
  it('detects low stock alerts', async () => {
    const { inventory } = await import('./inventory-store.js');
    
    // Material has minStockLevel: 10, reorderPoint: 15
    // Current stock is 15, which is at reorder point
    const alerts = get(inventory.lowStockAlerts);
    const hasAlert = alerts.some(a => a.id === 'test-mat-1');
    expect(hasAlert).toBe(true);
  });
  
  it('handles stock with color variants', async () => {
    const { inventory } = await import('./inventory-store.js');
    
    const material = {
      id: 'test-mat-2',
      category: 'VINYL',
      subtype: 'CAST_VINYL',
      name: 'Test Vinyl',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    inventory.addMaterial(material);
    
    // Add stock for different colors
    inventory.recordMovement({
      id: 'mov-3',
      materialId: 'test-mat-2',
      colorId: 'red',
      type: 'RECEIPT',
      quantity: 10,
      performedBy: 'test-user',
      timestamp: new Date().toISOString()
    });
    
    inventory.recordMovement({
      id: 'mov-4',
      materialId: 'test-mat-2',
      colorId: 'blue',
      type: 'RECEIPT',
      quantity: 15,
      performedBy: 'test-user',
      timestamp: new Date().toISOString()
    });
    
    expect(inventory.getStock('test-mat-2', 'red')).toBe(10);
    expect(inventory.getStock('test-mat-2', 'blue')).toBe(15);
  });
});
