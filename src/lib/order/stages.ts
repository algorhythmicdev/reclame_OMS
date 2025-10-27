export type StationTag =
  | 'CAD'
  | 'CNC'
  | 'SANDING'
  | 'BENDING'
  | 'WELDING'
  | 'PAINT'
  | 'ASSEMBLY'
  | 'QC'
  | 'LOGISTICS';

export type StageState =
  | 'NOT_STARTED'
  | 'QUEUED'
  | 'IN_PROGRESS'
  | 'BLOCKED'
  | 'REWORK'
  | 'COMPLETED';

export type ReworkReason =
  | 'RECUT'
  | 'RESAND'
  | 'REBEND'
  | 'REWELD'
  | 'REPAINT'
  | 'REASSEMBLE'
  | 'RECHECK'
  | 'CUSTOM';

export const REWORK_LABEL: Record<ReworkReason, string> = {
  RECUT: 'Re-cut',
  RESAND: 'Re-sand',
  REBEND: 'Re-bend',
  REWELD: 'Re-weld',
  REPAINT: 'Re-paint',
  REASSEMBLE: 'Re-assemble',
  RECHECK: 'Re-check',
  CUSTOM: 'Custom'
};

export type StageCycle = {
  idx: number;
  station: StationTag;
  reason: ReworkReason;
  note?: string;
  at: string;
  by: string;
};

export type StageMap = Record<StationTag, StageState>;

export const STATIONS: StationTag[] = [
  'CAD',
  'CNC',
  'SANDING',
  'BENDING',
  'WELDING',
  'PAINT',
  'ASSEMBLY',
  'QC',
  'LOGISTICS'
];

export const STATE_LABEL: Record<StageState, string> = {
  NOT_STARTED: 'Not started',
  QUEUED: 'Queued',
  IN_PROGRESS: 'In progress',
  BLOCKED: 'Blocked',
  REWORK: 'Rework',
  COMPLETED: 'Completed'
};

export const STATE_TONE: Record<
  StageState,
  'primary' | 'warn' | 'danger' | 'success' | 'muted'
> = {
  NOT_STARTED: 'muted',
  QUEUED: 'primary',
  IN_PROGRESS: 'primary',
  BLOCKED: 'danger',
  REWORK: 'warn',
  COMPLETED: 'success'
};

export const ALLOWED: Partial<Record<StageState, StageState[]>> = {
  NOT_STARTED: ['QUEUED', 'IN_PROGRESS', 'BLOCKED'],
  QUEUED: ['IN_PROGRESS', 'BLOCKED'],
  IN_PROGRESS: ['REWORK', 'BLOCKED', 'COMPLETED'],
  REWORK: ['IN_PROGRESS', 'BLOCKED', 'COMPLETED'],
  BLOCKED: ['IN_PROGRESS', 'REWORK'],
  COMPLETED: []
};

export function blankStages(): StageMap {
  const base: Partial<StageMap> = {};
  for (const station of STATIONS) {
    base[station] = 'NOT_STARTED';
  }
  return base as StageMap;
}
