import { createOrder, getOrder } from '$lib/order/signage-store';
import { blankStages, STATIONS } from '$lib/order/stages';

export function seed(base: string) {
  const seedData = [
    {
      id: 'PO-250375',
      title: '4500mm Long Frame',
      client: 'ABTB BIJEN',
      due: '2025-10-26',
      loadingDate: '2025-10-24',
      file: `${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`,
      stages: {
        CAD: 'COMPLETED',
        CNC: 'COMPLETED',
        SANDING: 'IN_PROGRESS',
        BENDING: 'NOT_STARTED',
        WELDING: 'NOT_STARTED',
        PAINT: 'NOT_STARTED',
        ASSEMBLY: 'NOT_STARTED',
        QC: 'NOT_STARTED',
        LOGISTICS: 'NOT_STARTED'
      }
    },
    {
      id: 'PO-250420',
      title: 'Pylon Letters',
      client: 'KIA',
      due: '2025-10-30',
      loadingDate: '2025-10-28',
      file: `${base}/files/PO-250420_KIA_Pylon.pdf`,
      stages: {
        CAD: 'COMPLETED',
        CNC: 'IN_PROGRESS',
        SANDING: 'QUEUED',
        BENDING: 'NOT_STARTED',
        WELDING: 'NOT_STARTED',
        PAINT: 'NOT_STARTED',
        ASSEMBLY: 'NOT_STARTED',
        QC: 'NOT_STARTED',
        LOGISTICS: 'NOT_STARTED'
      }
    }
  ];

  let targetId: string | null = null;

  for (const s of seedData) {
    const existing = getOrder(s.id);
    const order = existing
      ? existing
      : createOrder({
          id: s.id,
          title: s.title,
          client: s.client,
          due: s.due,
          loadingDate: s.loadingDate,
          badges: ['OPEN', 'IN_PROGRESS'],
          fields: [{ key: 'priority', label: 'Priority', value: 'Normal' }],
          materials: [{ key: 'face', label: 'Face', value: 'Acrylic 3mm White' }],
          stages: { ...blankStages(), ...s.stages },
          cycles: [],
          progress: Object.fromEntries(STATIONS.map((key) => [key, 0])),
          file: { id: crypto.randomUUID(), name: s.file.split('/').pop()!, path: s.file, kind: 'pdf' }
        });

    if (s.id === 'PO-250420') {
      targetId = order.id;
    }
  }
}
