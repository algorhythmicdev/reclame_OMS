import { createOrder, getOrder } from '$lib/order/signage-store';
import { blankStages, STATIONS } from '$lib/order/stages';
import { ORDER_SEEDS } from '$lib/order/order-seeds';
import type { Station } from '$lib/order/types';

export function seed(base: string) {
  for (const seed of ORDER_SEEDS) {
    const existing = getOrder(seed.id);
    if (existing) continue;

    const stages = seed.stages ? { ...blankStages(), ...seed.stages } : blankStages();
    const progress = Object.fromEntries(STATIONS.map((key) => [key, 0])) as Record<Station, number>;

    createOrder({
      id: seed.id,
      title: seed.title,
      client: seed.client,
      due: seed.due,
      loadingDate: seed.loadingDate,
      badges: [...seed.badges],
      fields: seed.fields.map((field) => ({ ...field })),
      materials: seed.materials.map((field) => ({ ...field })),
      stages,
      cycles: [],
      isRD: seed.isRD,
      rdNotes: seed.rdNotes,
      progress,
      file: {
        id: crypto.randomUUID(),
        name: seed.fileName,
        path: `${base}/files/${seed.fileName}`,
        kind: 'pdf'
      }
    });
  }
}
