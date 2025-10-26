export type Station =
  | 'CAD' | 'CNC' | 'SANDING' | 'BENDING' | 'WELDING'
  | 'PAINT' | 'ASSEMBLY' | 'QC' | 'LOGISTICS';

export type Badge = 'OPEN' | 'IN_PROGRESS' | 'BLOCKED' | 'READY_TO_SHIP' | 'DONE' | 'URGENT' | 'LOW_STOCK';

export type Field = { key: string; label: string; value: string };

export type FileRef = { id: string; name: string; path: string; kind: 'pdf' | 'image' | 'other' };

export type Commit = {
  id: string;
  ts: string; // ISO
  author: string; // station or user
  station?: Station;
  message: string;
  changes: Partial<{
    title: string; client: string; due: string; status: string;
    fields: Field[]; materials: Field[]; badges: Badge[]; progress: Record<Station, number>;
    files: FileRef[];
  }>;
};

export type Branch = {
  name: string;
  head: string;           // commit id
  commits: Commit[];      // newest first
  isDefault?: boolean;
};

export type OrderRepo = {
  id: string;             // e.g., PO-250375
  title: string;
  client: string;
  defaultBranch: string;  // name
  branches: Branch[];
  badges: Badge[];
  progress: Record<Station, number>; // 0..100 per station
  fields: Field[];
  materials: Field[];
  files: FileRef[];
};
