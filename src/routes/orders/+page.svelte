<script lang="ts">
  import { assets } from '$app/paths';
  import { onMount } from 'svelte';
  import DataTable from '$lib/ui/DataTable.svelte';
  import Input from '$lib/ui/Input.svelte';
  import type { Badge, Field, Order, Station } from '$lib/order/types';
  import { listOrders, createOrder } from '$lib/order/vcs-store';

  type OrderRow = { id: string; client: string; title: string; status: string; due: string };

  const columns = [
    { key: 'id', label: 'PO', width: '140px' },
    { key: 'client', label: 'Client' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', width: '160px' },
    { key: 'due', label: 'Due', width: '120px' }
  ];

  const stations: Station[] = ['CAD', 'CNC', 'SANDING', 'BENDING', 'WELDING', 'PAINT', 'ASSEMBLY', 'QC', 'LOGISTICS'];
  const stationLabels: Record<Station, string> = {
    CAD: 'CAD',
    CNC: 'CNC',
    SANDING: 'Sanding',
    BENDING: 'Bending',
    WELDING: 'Welding',
    PAINT: 'Paint',
    ASSEMBLY: 'Assembly',
    QC: 'QC',
    LOGISTICS: 'Logistics'
  };

  type OrderSeed = {
    id: string;
    title: string;
    client: string;
    due: string;
    badges: Badge[];
    fields: Field[];
    materials: Field[];
    progress: Record<Station, number>;
    fileName: string;
  };

  const assetPath = (name: string) => (assets && assets !== '.' ? `${assets}/files/${name}` : `/files/${name}`);

  const seeds: OrderSeed[] = [
    {
      id: 'PO-250375',
      title: '4500mm Long Frame',
      client: 'ABTB BIJEN',
      due: '2025-10-26',
      badges: ['OPEN', 'IN_PROGRESS'],
      fields: [{ key: 'priority', label: 'Priority', value: 'Normal' }],
      materials: [{ key: 'face', label: 'Face', value: 'Acrylic 3mm White' }],
      progress: withProgress({ CAD: 100, CNC: 100, SANDING: 40 }),
      fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
    },
    {
      id: 'PO-250420',
      title: 'Pylon Letters',
      client: 'KIA',
      due: '2025-10-30',
      badges: ['OPEN'],
      fields: [{ key: 'priority', label: 'Priority', value: 'High' }],
      materials: [{ key: 'face', label: 'Face', value: 'Aluminium 4mm' }],
      progress: withProgress({ CAD: 100, CNC: 65 }),
      fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
    },
    {
      id: 'PO-250501',
      title: 'Menu Lightbox',
      client: 'Burger King',
      due: '2025-11-03',
      badges: ['OPEN', 'URGENT'],
      fields: [{ key: 'priority', label: 'Priority', value: 'Rush' }],
      materials: [{ key: 'face', label: 'Face', value: 'Acrylic 5mm Frosted' }],
      progress: withProgress({ CAD: 45 }),
      fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
    }
  ];

  function baseProgress(): Record<Station, number> {
    return stations.reduce((acc, stage) => {
      acc[stage] = 0;
      return acc;
    }, {} as Record<Station, number>);
  }

  function withProgress(overrides: Partial<Record<Station, number>>): Record<Station, number> {
    return { ...baseProgress(), ...overrides };
  }

  for (const seed of seeds) {
    createOrder({
      id: seed.id,
      title: seed.title,
      client: seed.client,
      due: seed.due,
      badges: seed.badges,
      fields: seed.fields,
      materials: seed.materials,
      progress: seed.progress,
      file: {
        id: `${seed.id}-file`,
        name: seed.fileName,
        path: assetPath(seed.fileName),
        kind: 'pdf'
      }
    });
  }

  function statusFromOrder(order: Order): string {
    const pending = stations.find((stage) => (order.progress?.[stage] ?? 0) < 100);
    if (!pending) return 'Complete';
    const value = order.progress?.[pending] ?? 0;
    return value > 0 ? `${stationLabels[pending]} ${value}%` : stationLabels[pending];
  }

  function toRow(order: Order): OrderRow {
    return {
      id: order.id,
      client: order.client,
      title: order.title,
      status: statusFromOrder(order),
      due: order.due
    };
  }

  let rows: OrderRow[] = [];
  let q = '';

  function refresh() {
    rows = listOrders()
      .map(toRow)
      .sort((a, b) => a.due.localeCompare(b.due));
  }

  refresh();

  onMount(() => {
    refresh();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'rf_orders_vcs') refresh();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  });
</script>

<section class="card">
  <div class="row" style="justify-content:space-between">
    <h2 style="margin:0">Orders</h2>
    <div style="width:280px"><Input bind:value={q} placeholder="Filter by client…" ariaLabel="Filter" /></div>
  </div>
  <div style="margin-top:12px">
    <DataTable columns={columns} rows={rows} filterKey="client" filterText={q} />
  </div>
</section>
