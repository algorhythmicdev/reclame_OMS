import { derived, get, writable } from 'svelte/store';
import { createId } from '$lib/utils/id';
import type { Category, Item, Movement, MovementKind, Unit } from './types';

export type NewItemInput = Omit<Item, 'id' | 'updatedAt'> & {
  id?: string;
  updatedAt?: string;
};

export type ItemUpdate = Partial<Omit<Item, 'id'>> & { updatedAt?: string };

export type MovementOptions = {
  by?: string;
  note?: string;
  refPO?: string;
  unit?: Unit;
};

export type SearchField =
  | 'sku'
  | 'name'
  | 'category'
  | 'location'
  | 'colorCode'
  | 'vendor';

export type SearchOptions = {
  fields?: SearchField[];
  caseSensitive?: boolean;
};

export type CsvOptions = {
  separator?: string;
  includeHeader?: boolean;
};

export type MovementFilterOptions = {
  itemId?: string;
  kind?: MovementKind | MovementKind[];
  from?: string;
  to?: string;
};

type MovementQuantityBreakdown = Partial<
  Record<
    Unit,
    {
      IN: number;
      OUT: number;
      ADJUST: number;
    }
  >
>;

export type MovementStats = {
  total: number;
  byKind: Record<MovementKind, number>;
  unitQuantities: MovementQuantityBreakdown;
  itemsAffected: number;
};

export type InventorySummary = {
  totalItems: number;
  lowStockItems: number;
  categories: Record<Category, { total: number; lowStock: number }>;
  latestUpdate: string | null;
};

export const items = writable<Item[]>([
  {
    id: 'A-001',
    sku: 'ACR-CL-3',
    name: 'Acrylic Clear 3mm',
    category: 'ACRYLIC',
    unit: 'M2',
    stock: 24.5,
    min: 10,
    thicknessMM: 3,
    location: 'RACK A1',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'P-010',
    sku: 'RAL-3020',
    name: 'Paint RAL 3020 Red',
    category: 'PAINT',
    unit: 'L',
    stock: 7,
    min: 5,
    colorCode: 'RAL3020',
    location: 'PAINT CAB',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'I-101',
    sku: 'BIT-6MM',
    name: 'CNC Endmill 6mm',
    category: 'INSTRUMENT',
    unit: 'PCS',
    stock: 12,
    min: 8,
    location: 'TOOLBOX C',
    updatedAt: new Date().toISOString()
  }
]);

export const movements = writable<Movement[]>([]);

export function getItem(itemId: string) {
  return get(items).find((item) => item.id === itemId) ?? null;
}

export function findItemBySku(sku: string) {
  const needle = sku.trim().toLowerCase();
  if (!needle) return null;
  return get(items).find((item) => item.sku.toLowerCase() === needle) ?? null;
}

export function addItem(input: NewItemInput): Item {
  const id = input.id ?? createId('inv');
  const updatedAt = input.updatedAt ?? new Date().toISOString();
  const entry: Item = { ...input, id, updatedAt };
  items.update((list) => [...list, entry]);
  return entry;
}

export function createItem(partial: Partial<Item> = {}): Item {
  const newItem: Item = {
    id: createId('inv'),
    sku: '',
    name: '',
    category: 'HARDWARE',
    unit: 'PCS',
    stock: 0,
    min: 0,
    updatedAt: new Date().toISOString(),
    ...partial
  };
  items.update((list) => [...list, newItem]);
  return newItem;
}

export function updateItem(itemId: string, patch: ItemUpdate): Item | null {
  let updated: Item | null = null;
  const stamp = patch.updatedAt ?? new Date().toISOString();
  items.update((list) =>
    list.map((item) => {
      if (item.id !== itemId) return item;
      updated = { ...item, ...patch, id: item.id, updatedAt: stamp };
      return updated;
    })
  );
  return updated;
}

export function removeItem(itemId: string) {
  let removed = false;
  items.update((list) => {
    const next = list.filter((item) => {
      if (item.id === itemId) {
        removed = true;
        return false;
      }
      return true;
    });
    return next;
  });
  if (removed) {
    movements.update((records) => records.filter((movement) => movement.itemId !== itemId));
  }
  return removed;
}

export function recordMovement(
  itemId: string,
  kind: MovementKind,
  qty: number,
  options: MovementOptions = {}
) {
  const target = getItem(itemId);
  if (!target) return null;

  const id = createId('mv');
  const at = new Date().toISOString();
  const unit = options.unit ?? target.unit;
  const by = options.by ?? 'admin';
  const movement: Movement = {
    id,
    itemId,
    kind,
    qty,
    unit,
    by,
    at,
    note: options.note,
    refPO: options.refPO
  };

  movements.update((records) => [movement, ...records]);

  items.update((list) =>
    list.map((item) => {
      if (item.id !== itemId) return item;
      let stock: number;
      if (kind === 'ADJUST') {
        stock = Math.max(0, qty);
      } else {
        const delta = kind === 'IN' ? qty : -qty;
        stock = Math.max(0, item.stock + delta);
      }
      return { ...item, stock, updatedAt: at };
    })
  );

  return movement;
}

export function move(itemId: string, kind: MovementKind, qty: number, by = 'admin', note?: string) {
  const result = recordMovement(itemId, kind, qty, { by, note });
  
  // Check for low stock after movement
  if (result) {
    const item = getItem(itemId);
    if (item && item.stock <= item.min) {
      // Use dynamic imports to avoid circular dependencies
      Promise.all([
        import('$lib/stores/toast'),
        import('$lib/notify/bus')
      ]).then(([{ announce }, { push }]) => {
        announce(`Low stock: ${item.sku} (${item.stock} ${item.unit})`, 'warning');
        push('warn', `Low stock: ${item.sku} (${item.stock} ${item.unit})`);
      });
    }
  }
  
  return result;
}

export function movementsForItem(itemId: string) {
  return get(movements).filter((movement) => movement.itemId === itemId);
}

export const lowStock = derived(items, ($items) => $items.filter((it) => it.stock <= it.min));

export function listLowStock() {
  return get(lowStock);
}

export function searchItems(query: string, options: SearchOptions = {}) {
  const defaultFields: SearchField[] = ['sku', 'name', 'category', 'location', 'colorCode', 'vendor'];
  const { caseSensitive = false, fields = defaultFields } = options;
  const trimmed = query.trim();
  if (!trimmed) return get(items);
  const needle = caseSensitive ? trimmed : trimmed.toLowerCase();
  const haystack = get(items);
  return haystack.filter((item) =>
    fields.some((field) => {
      const raw = item[field];
      if (raw == null) return false;
      const text = String(raw);
      const target = caseSensitive ? text : text.toLowerCase();
      return target.includes(needle);
    })
  );
}

export function recentMovements(limit = 25) {
  const history = [...get(movements)];
  history.sort((a, b) => b.at.localeCompare(a.at));
  return history.slice(0, Math.max(0, limit));
}

export function filterMovements(options: MovementFilterOptions = {}) {
  const allowedKinds = Array.isArray(options.kind)
    ? options.kind
    : options.kind
    ? [options.kind]
    : null;
  const from = options.from ?? null;
  const to = options.to ?? null;

  return get(movements).filter((movement) => {
    if (options.itemId && movement.itemId !== options.itemId) return false;
    if (allowedKinds && !allowedKinds.includes(movement.kind)) return false;
    if (from && movement.at < from) return false;
    if (to && movement.at > to) return false;
    return true;
  });
}

export function movementStats(options: MovementFilterOptions = {}): MovementStats {
  const sample = filterMovements(options);
  const byKind: Record<MovementKind, number> = { IN: 0, OUT: 0, ADJUST: 0 };
  const unitQuantities: MovementQuantityBreakdown = {} as MovementQuantityBreakdown;
  const touched = new Set<string>();

  for (const record of sample) {
    byKind[record.kind] += 1;
    touched.add(record.itemId);
    if (!unitQuantities[record.unit]) {
      unitQuantities[record.unit] = { IN: 0, OUT: 0, ADJUST: 0 };
    }
    unitQuantities[record.unit][record.kind] += record.qty;
  }

  return {
    total: sample.length,
    byKind,
    unitQuantities,
    itemsAffected: touched.size
  };
}

export function inventorySummary(): InventorySummary {
  const all = get(items);
  const low = get(lowStock);
  const categories: Record<Category, { total: number; lowStock: number }> = {
    ACRYLIC: { total: 0, lowStock: 0 },
    ALUMINIUM: { total: 0, lowStock: 0 },
    STEEL: { total: 0, lowStock: 0 },
    ACP: { total: 0, lowStock: 0 },
    VINYL: { total: 0, lowStock: 0 },
    PAINT: { total: 0, lowStock: 0 },
    ADHESIVE: { total: 0, lowStock: 0 },
    HARDWARE: { total: 0, lowStock: 0 },
    INSTRUMENT: { total: 0, lowStock: 0 }
  };

  let latest: string | null = null;

  for (const item of all) {
    const bucket = categories[item.category];
    if (bucket) {
      bucket.total += 1;
    }
    if (!latest || item.updatedAt > latest) {
      latest = item.updatedAt;
    }
  }

  for (const item of low) {
    const bucket = categories[item.category];
    if (bucket) {
      bucket.lowStock += 1;
    }
  }

  return {
    totalItems: all.length,
    lowStockItems: low.length,
    categories,
    latestUpdate: latest
  };
}

export function itemsByCategory(category: Category) {
  return get(items).filter((item) => item.category === category);
}

export function recentlyUpdatedItems(fromISO: string): Item[] {
  if (!fromISO) return [];
  return get(items).filter((item) => item.updatedAt >= fromISO);
}

export function resetInventory(next: Item[]) {
  items.set(next);
  movements.set([]);
}

export function exportInventoryCsv(options: CsvOptions = {}) {
  const { separator = ',', includeHeader = true } = options;
  const header = [
    'id',
    'sku',
    'name',
    'category',
    'unit',
    'stock',
    'min',
    'location',
    'vendor',
    'note',
    'colorCode',
    'thicknessMM',
    'leftover.lengthMM',
    'leftover.widthMM',
    'leftover.heightMM',
    'leftover.weightKG',
    'leftover.bin',
    'updatedAt'
  ];

  const rows = get(items).map((item) => [
    item.id,
    item.sku,
    item.name,
    item.category,
    item.unit,
    item.stock,
    item.min,
    item.location ?? '',
    item.vendor ?? '',
    item.note ?? '',
    item.colorCode ?? '',
    item.thicknessMM ?? '',
    item.leftover?.lengthMM ?? '',
    item.leftover?.widthMM ?? '',
    item.leftover?.heightMM ?? '',
    item.leftover?.weightKG ?? '',
    item.leftover?.bin ?? '',
    item.updatedAt
  ]);

  const escape = (value: unknown) => {
    const text = String(value ?? '');
    const needsQuotes = /[",\n]/.test(text) || text.includes(separator) || /^\s|\s$/.test(text);
    if (!needsQuotes) return text;
    return `"${text.replace(/"/g, '""')}"`;
  };

  const lines = rows.map((row) => row.map(escape).join(separator));
  if (includeHeader) {
    lines.unshift(header.map(escape).join(separator));
  }
  return lines.join('\n');
}
