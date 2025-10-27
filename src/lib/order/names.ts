export const TERMS = {
  stations: {
    CAD: 'CAD',
    CNC: 'CNC',
    SANDING: 'Sanding',
    BENDING: 'Bending',
    WELDING: 'Welding',
    PAINT: 'Paint',
    ASSEMBLY: 'Assembly',
    QC: 'QC',
    LOGISTICS: 'Logistics'
  }
} as const;

export type StationCode = keyof typeof TERMS.stations;
