export type Unit = 'PCS' | 'M2' | 'M' | 'KG' | 'L';
export type Category =
  | 'ACRYLIC'
  | 'ALUMINIUM'
  | 'STEEL'
  | 'ACP'
  | 'VINYL'
  | 'PAINT'
  | 'ADHESIVE'
  | 'HARDWARE'
  | 'INSTRUMENT';
export type MovementKind = 'IN' | 'OUT' | 'ADJUST';

// New types for section-based organization
export type Section = 'materials' | 'leftovers' | 'paints' | 'tools' | 'cons';

export interface Item {
  id: string;
  sku: string;
  name: string;
  category: Category;
  unit: Unit;
  stock: number;
  min: number;
  location?: string;
  vendor?: string;
  supplier?: string;
  note?: string;
  colorCode?: string;
  thicknessMM?: number;
  leftover?: {
    lengthMM?: number;
    widthMM?: number;
    heightMM?: number;
    weightKG?: number;
    bin?: string;
  };
  updatedAt: string;
  // New fields for section-based organization
  section?: Section;
  group?: string;
  subgroup?: string;
  price?: number;
  barcode?: string;
}

export interface Movement {
  id: string;
  itemId: string;
  kind: MovementKind;
  qty: number;
  unit: Unit;
  by: string;
  at: string;
  note?: string;
  refPO?: string;
}
