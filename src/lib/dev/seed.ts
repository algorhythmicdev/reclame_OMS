import { createOrder, openChangeRequest, addRevision, getOrder } from '$lib/order/signage-store';

export function seed(base: string) {
  const id = 'PO-250420';
  createOrder({
    id,
    title: 'Pylon Letters',
    client: 'KIA',
    due: '2025-10-30',
    badges: ['OPEN', 'IN_PROGRESS'],
    fields: [{ key: 'priority', label: 'Priority', value: 'High' }],
    materials: [{ key: 'face', label: 'Face', value: 'Aluminum 2mm' }],
    progress: {
      CAD: 100,
      CNC: 80,
      SANDING: 20,
      BENDING: 0,
      WELDING: 0,
      PAINT: 0,
      ASSEMBLY: 0,
      QC: 0,
      LOGISTICS: 0
    },
    file: {
      id: 'f1',
      name: 'PO-250420_KIA_Pylon.pdf',
      path: `${base}/files/PO-250420_KIA_Pylon.pdf`,
      kind: 'pdf'
    }
  });
  const seeded = getOrder(id);
  if (!seeded) return;

  const hasSecondRevision = seeded.revisions.some((rev) => rev.message.includes('Spec update'));
  if (!hasSecondRevision) {
    const cryptoRef = typeof globalThis !== 'undefined' ? (globalThis.crypto as Crypto | undefined) : undefined;
    const revisionId = cryptoRef?.randomUUID ? cryptoRef.randomUUID() : `rev-${Date.now()}`;
    addRevision(
      id,
      {
        id: revisionId,
        name: 'PO-250420_KIA_Pylon_update.pdf',
        path: `${base}/files/PO-250420_KIA_Pylon_update.pdf`,
        kind: 'pdf'
      },
      'admin',
      'Spec update (demo)'
    );
  }

  const hasSeededChangeRequest = seeded.prs.some((pr) => pr.title === 'Sanding +10%');
  if (!hasSeededChangeRequest) {
    openChangeRequest(id, {
      title: 'Sanding +10%',
      author: 'SANDING',
      proposed: { progress: { SANDING: 30 } }
    });
  }
}
