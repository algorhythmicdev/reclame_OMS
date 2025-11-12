import { writable, derived } from 'svelte/store';
import type { MaterialSpec } from './material-types';

export interface StockItem {
  id: string;
  materialId: string;
  colorId?: string;
  quantity: number;
  unit: 'sheets' | 'sqm' | 'linear_meters' | 'kg' | 'pieces';
  location?: string; // Warehouse location
  batchNumber?: string;
  expiryDate?: string; // For materials with shelf life
  receivedDate: string;
  lastUpdated: string;
}

export interface StockMovement {
  id: string;
  materialId: string;
  colorId?: string;
  type: 'RECEIPT' | 'USAGE' | 'ADJUSTMENT' | 'WASTE' | 'TRANSFER';
  quantity: number;
  orderId?: string; // Link to order if usage
  stationId?: string; // Station that used material
  reason?: string;
  performedBy: string;
  timestamp: string;
  notes?: string;
}

function createInventoryStore() {
  const materials = writable<MaterialSpec[]>([]);
  const stock = writable<StockItem[]>([]);
  const movements = writable<StockMovement[]>([]);

  // Load from localStorage
  if (typeof window !== 'undefined') {
    const storedMaterials = localStorage.getItem('rf_materials');
    const storedStock = localStorage.getItem('rf_stock');
    const storedMovements = localStorage.getItem('rf_movements');
    
    if (storedMaterials) materials.set(JSON.parse(storedMaterials));
    if (storedStock) stock.set(JSON.parse(storedStock));
    if (storedMovements) movements.set(JSON.parse(storedMovements));
  }

  // Auto-save
  materials.subscribe(val => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rf_materials', JSON.stringify(val));
    }
  });
  
  stock.subscribe(val => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rf_stock', JSON.stringify(val));
    }
  });
  
  movements.subscribe(val => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rf_movements', JSON.stringify(val));
    }
  });

  // Derived store: low stock alerts
  const lowStockAlerts = derived([materials, stock], ([$materials, $stock]) => {
    return $materials.filter(mat => {
      const stockItem = $stock.find(s => s.materialId === mat.id);
      const currentQty = stockItem?.quantity ?? 0;
      const reorderPoint = mat.reorderPoint ?? mat.minStockLevel ?? 0;
      return currentQty <= reorderPoint;
    });
  });

  return {
    materials,
    stock,
    movements,
    lowStockAlerts,
    
    // Material CRUD
    addMaterial: (material: MaterialSpec) => {
      materials.update(m => [...m, material]);
    },
    
    updateMaterial: (id: string, updates: Partial<MaterialSpec>) => {
      materials.update(m => m.map(mat => 
        mat.id === id ? { ...mat, ...updates, updatedAt: new Date().toISOString() } : mat
      ));
    },
    
    deleteMaterial: (id: string) => {
      materials.update(m => m.filter(mat => mat.id !== id));
    },
    
    // Stock operations
    recordMovement: (movement: StockMovement) => {
      movements.update(m => [movement, ...m]);
      
      // Update stock quantity
      stock.update(s => {
        const existing = s.find(item => 
          item.materialId === movement.materialId && 
          item.colorId === movement.colorId
        );
        
        if (existing) {
          const delta = movement.type === 'RECEIPT' ? movement.quantity : -movement.quantity;
          return s.map(item => 
            item.id === existing.id 
              ? { ...item, quantity: item.quantity + delta, lastUpdated: movement.timestamp }
              : item
          );
        } else if (movement.type === 'RECEIPT') {
          // Create new stock item
          const newItem: StockItem = {
            id: crypto.randomUUID(),
            materialId: movement.materialId,
            colorId: movement.colorId,
            quantity: movement.quantity,
            unit: 'pieces', // Default, should be from material spec
            receivedDate: movement.timestamp,
            lastUpdated: movement.timestamp
          };
          return [...s, newItem];
        }
        return s;
      });
    },
    
    // Get current stock for a material
    getStock: (materialId: string, colorId?: string): number => {
      let result = 0;
      const unsubscribe = stock.subscribe(s => {
        const item = s.find(i => 
          i.materialId === materialId && 
          (!colorId || i.colorId === colorId)
        );
        result = item?.quantity ?? 0;
      });
      unsubscribe();
      return result;
    }
  };
}

export const inventory = createInventoryStore();
