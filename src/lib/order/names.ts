export const TERMS = {
  stations: {
    CAD: 'stations.CAD',
    CNC: 'stations.CNC',
    SANDING: 'stations.SANDING',
    BENDING: 'stations.BENDING',
    WELDING: 'stations.WELDING',
    PAINT: 'stations.PAINT',
    ASSEMBLY: 'stations.ASSEMBLY',
    QC: 'stations.QC',
    LOGISTICS: 'stations.LOGISTICS'
  }
} as const;

export type StationCode = keyof typeof TERMS.stations;
