export type MaterialCategory = 
  | 'SHEET_METAL'
  | 'COMPOSITE'
  | 'PLASTIC'
  | 'VINYL'
  | 'FINISHING'
  | 'HARDWARE';

export type MaterialSubtype = 
  // Sheet metals
  | 'ALUMINUM_SHEET'
  | 'STAINLESS_STEEL'
  | 'GALVANIZED_STEEL'
  // Composites
  | 'ACM_PANEL'
  | 'DIBOND'
  | 'ALUPANEL'
  // Plastics
  | 'PVC_FOAM'
  | 'ACRYLIC'
  | 'POLYCARBONATE'
  | 'CORRUGATED_PLASTIC'
  // Vinyls
  | 'CAST_VINYL'
  | 'CALENDERED_VINYL'
  | 'REFLECTIVE_VINYL'
  | 'PRINTABLE_VINYL'
  // Finishing
  | 'POWDER_COATING'
  | 'LIQUID_PAINT'
  | 'LAMINATE'
  // Hardware
  | 'MOUNTING_BRACKETS'
  | 'RIVETS'
  | 'STANDOFFS';

export interface MaterialSpec {
  id: string;
  category: MaterialCategory;
  subtype: MaterialSubtype;
  name: string;
  brand?: string;
  supplier?: string;
  
  // Physical properties
  thickness?: number; // mm
  width?: number; // mm
  length?: number; // mm
  weight?: number; // kg per unit
  
  // Technical specs
  weatherResistant?: boolean;
  uvRating?: string;
  temperatureRange?: string;
  applications?: string[];
  
  // Color info
  availableColors?: ColorSpec[];
  supportsCustomColor?: boolean;
  
  // Pricing
  unitPrice?: number;
  currency?: string;
  pricePerUnit?: 'sheet' | 'sqm' | 'linear_meter' | 'kg' | 'piece';
  
  // Stock management
  minStockLevel?: number;
  reorderPoint?: number;
  leadTimeDays?: number;
  
  // Metadata
  notes?: string;
  datasheet?: string; // URL
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ColorSpec {
  id: string;
  name: string;
  ralCode?: string; // e.g., "RAL 9016"
  pantoneCode?: string; // e.g., "Pantone 185 C"
  hexValue?: string; // e.g., "#FF5733"
  cmykValues?: { c: number; m: number; y: number; k: number };
  isCustom?: boolean;
  customFormulation?: string;
  finishType?: 'MATTE' | 'GLOSS' | 'SATIN' | 'TEXTURED';
  swatchUrl?: string;
}
