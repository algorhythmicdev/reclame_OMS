import type { Badge, Field, Station, StageState } from './types';

export type OrderSeed = {
  id: string;
  title: string;
  client: string;
  due: string;
  loadingDate?: string;
  badges: Badge[];
  fields: Field[];
  materials: Field[];
  stages?: Partial<Record<Station, StageState>>;
  isRD?: boolean;
  rdNotes?: string;
  fileName: string;
};

export const ORDER_SEEDS: OrderSeed[] = [
  {
    id: 'PO-250375',
    title: '4500mm Long Frame',
    client: 'ABTB BIJEN',
    due: '2025-10-26',
    loadingDate: '2025-10-24',
    badges: ['OPEN', 'IN_PROGRESS'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Normal' },
      { key: 'region', label: 'Region', value: 'NL' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Acrylic 3mm White' },
      { key: 'frame', label: 'Frame', value: 'Aluminium' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'COMPLETED',
      SANDING: 'IN_PROGRESS'
    },
    fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
  },
  {
    id: 'PO-251076',
    title: 'Wassink 7000mm Lightbox',
    client: 'Reklatekst',
    due: '2025-11-14',
    loadingDate: '2025-11-12',
    badges: ['OPEN'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Normal' },
      { key: 'site', label: 'Site', value: 'Wassink' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Opal Acrylic 4mm' },
      { key: 'lighting', label: 'Lighting', value: 'LED 6500K' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'IN_PROGRESS',
      BENDING: 'QUEUED',
      ASSEMBLY: 'QUEUED'
    },
    fileName: 'NL REKLATEKST Wassink 7000 mm  PO-251076  Nov 14.pdf'
  },
  {
    id: 'PO-4894',
    title: 'Bibliotheek 6300mm Signage',
    client: 'Hendrix',
    due: '2025-11-14',
    loadingDate: '2025-11-13',
    badges: ['OPEN', 'IN_PROGRESS'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'High' },
      { key: 'site', label: 'Site', value: 'Bibliotheek' }
    ],
    materials: [
      { key: 'letters', label: 'Letters', value: 'Aluminium 3mm' },
      { key: 'finish', label: 'Finish', value: 'RAL 9016 Satin' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'COMPLETED',
      PAINT: 'IN_PROGRESS',
      ASSEMBLY: 'QUEUED'
    },
    fileName: 'NL Hendrix BIBLIOTHEEK 6300 mm  PO-4894  Nov 14.pdf'
  },
  {
    id: 'PO-6109',
    title: 'Lammers Beton P-3 6500mm',
    client: 'Hendrix',
    due: '2025-11-14',
    loadingDate: '2025-11-13',
    badges: ['OPEN'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Normal' },
      { key: 'site', label: 'Site', value: 'Lammers Beton P-3' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Aluminium Composite' },
      { key: 'frame', label: 'Frame', value: 'Steel 3mm' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'IN_PROGRESS',
      WELDING: 'QUEUED'
    },
    fileName: 'NL Hendrix LAMMERS Beton  P-3  6500 mm  PO-6109  Nov 14.pdf'
  },
  {
    id: 'PO-35697',
    title: 'Albert Heijn Logo 626mm',
    client: 'Levanto',
    due: '2025-11-14',
    loadingDate: '2025-11-12',
    badges: ['OPEN'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Normal' },
      { key: 'site', label: 'Site', value: 'Albert Heijn' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Acrylic 3mm' },
      { key: 'lighting', label: 'Lighting', value: 'LED Module Set' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'QUEUED',
      ASSEMBLY: 'QUEUED'
    },
    fileName: 'NL LEVANTO ALBERT HEIJN  Logo 626 mm    PO-35697   Nov 14.pdf'
  },
  {
    id: 'PO-35818',
    title: 'Albert Heijn Lightbox 500mm',
    client: 'Levanto',
    due: '2025-11-14',
    loadingDate: '2025-11-12',
    badges: ['OPEN', 'R&D'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Rush' },
      { key: 'site', label: 'Site', value: 'Albert Heijn' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Diffused Acrylic' },
      { key: 'lighting', label: 'Lighting', value: 'Dynamic LED' }
    ],
    stages: {
      CAD: 'IN_PROGRESS',
      CNC: 'QUEUED'
    },
    isRD: true,
    rdNotes: 'Validate diffuser brightness before production.',
    fileName: 'NL LEVANTO ALBERT HEIJN  Lightbox 500 mm   PO-35818  Nov 14.pdf'
  },
  {
    id: 'PO-35884',
    title: 'Etos Dermacare Lightbox Set',
    client: 'Levanto',
    due: '2025-11-14',
    loadingDate: '2025-11-11',
    badges: ['OPEN'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Normal' },
      { key: 'site', label: 'Site', value: 'Etos Dermacare' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Opal Acrylic Panels' },
      { key: 'lighting', label: 'Lighting', value: 'LED Strips 1490/1990/2990' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'IN_PROGRESS',
      ASSEMBLY: 'QUEUED'
    },
    fileName: 'NL LEVANTO ETOS work  LIGHTBOX  Dermacare 1490, 1990,  2990 mm  PO-35884  Nov 14.pdf'
  },
  {
    id: 'PO-36063',
    title: 'Dreamland 9000mm P-7st',
    client: 'Levanto',
    due: '2025-11-14',
    loadingDate: '2025-11-13',
    badges: ['OPEN', 'URGENT'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'High' },
      { key: 'site', label: 'Site', value: 'Dreamland P-7st' }
    ],
    materials: [
      { key: 'frame', label: 'Frame', value: 'Steel 4mm' },
      { key: 'finish', label: 'Finish', value: 'RAL 3020 Gloss' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'IN_PROGRESS',
      BENDING: 'QUEUED',
      PAINT: 'QUEUED'
    },
    fileName: 'NL LEVANTO Dreamland  9000 mm  P-7st   PO-36063  Nov 14 !!.pdf'
  },
  {
    id: 'PO-OBJ-GELDBESPAREN',
    title: 'Geldbesparen Campaign Reface',
    client: 'ObjektReclame',
    due: '2025-11-14',
    loadingDate: '2025-11-12',
    badges: ['OPEN'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Normal' },
      { key: 'campaign', label: 'Campaign', value: 'Geldbesparen' }
    ],
    materials: [
      { key: 'graphic', label: 'Graphic', value: 'Full-colour Vinyl' },
      { key: 'frame', label: 'Frame', value: 'Existing Frame Reuse' }
    ],
    stages: {
      CAD: 'COMPLETED',
      PAINT: 'QUEUED'
    },
    fileName: 'NL ObjektReclame  GELDBESPAREN  Work  Nov 14.pdf'
  },
  {
    id: 'SE-COLOURCENTER-P7',
    title: 'ColourCenter Street Food P-7',
    client: 'ColourCenter',
    due: '2025-10-27',
    loadingDate: '2025-10-25',
    badges: ['OPEN', 'IN_PROGRESS'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'High' },
      { key: 'region', label: 'Region', value: 'SE' }
    ],
    materials: [
      { key: 'face', label: 'Face', value: 'Composite Panel' },
      { key: 'lighting', label: 'Lighting', value: 'Outdoor LED' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'COMPLETED',
      PAINT: 'IN_PROGRESS',
      LOGISTICS: 'QUEUED'
    },
    fileName: 'SWEDEN ColourCenter -  STREET FOOD  P-7  Work  Oct 27 Load.pdf'
  },
  {
    id: 'SE-SIBYLLA-LED',
    title: 'Sibylla Red LED Line',
    client: 'Sibylla',
    due: '2025-11-25',
    loadingDate: '2025-11-20',
    badges: ['OPEN', 'IN_PROGRESS'],
    fields: [
      { key: 'priority', label: 'Priority', value: 'Rush' },
      { key: 'site', label: 'Site', value: 'Ekeby' }
    ],
    materials: [
      { key: 'lighting', label: 'Lighting', value: 'Red LED Flex' },
      { key: 'mounting', label: 'Mounting', value: 'Aluminium Track' }
    ],
    stages: {
      CAD: 'COMPLETED',
      CNC: 'QUEUED',
      ASSEMBLY: 'IN_PROGRESS',
      QC: 'QUEUED'
    },
    fileName: 'SWEDEN Sibylla RED LED LINE  Ekeby  WORK  Nov XX.pdf'
  }
];

export const ORDER_SEEDS_BY_ID: Record<string, OrderSeed> = ORDER_SEEDS.reduce(
  (acc, seed) => {
    acc[seed.id] = seed;
    return acc;
  },
  {} as Record<string, OrderSeed>
);

export function getOrderSeed(id: string): OrderSeed | undefined {
  return ORDER_SEEDS_BY_ID[id];
}
