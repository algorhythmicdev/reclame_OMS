import { createOrder, openChangeRequest, getOrder } from '$lib/order/signage-store';

export function seed(base: string) {
  const seedData = [
    {
      id: 'PO-250375',
      title: '4500mm Long Frame',
      client: 'ABTB BIJEN',
      due: '2025-10-26',
      loadingDate: '2025-10-24',
      file: `${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`,
      progress: { CAD: 100, CNC: 100, SANDING: 40, BENDING: 0, WELDING: 0, PAINT: 0, ASSEMBLY: 0, QC: 0, LOGISTICS: 0 }
    },
    {
      id: 'PO-250420',
      title: 'Pylon Letters',
      client: 'KIA',
      due: '2025-10-30',
      loadingDate: '2025-10-28',
      file: `${base}/files/PO-250420_KIA_Pylon.pdf`,
      progress: { CAD: 100, CNC: 80, SANDING: 20, BENDING: 0, WELDING: 0, PAINT: 0, ASSEMBLY: 0, QC: 0, LOGISTICS: 0 }
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
          progress: s.progress,
          file: { id: crypto.randomUUID(), name: s.file.split('/').pop()!, path: s.file, kind: 'pdf' }
        });

    if (s.id === 'PO-250420') {
      targetId = order.id;
    }
  }

  if (targetId) {
    const order = getOrder(targetId);
    const existing = order?.prs?.some((pr) => pr.title === 'Sanding +10%' && pr.status === 'open');
    if (!existing) {
      openChangeRequest(targetId, {
        title: 'Sanding +10%',
        author: 'SANDING',
        proposed: { progress: { SANDING: 30 } }
      });
    }
  }
}
