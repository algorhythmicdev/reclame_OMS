<script lang="ts">
  import { assets } from '$app/paths';
  import { onMount } from 'svelte';
  import DataTable from '$lib/ui/DataTable.svelte';
  import Input from '$lib/ui/Input.svelte';
  import type { Badge, Field, Order, Station } from '$lib/order/types';
  import { listOrders, createOrder } from '$lib/order/signage-store';
  import OrderForm from '$lib/order/OrderForm.svelte';
import { blankStages, STATE_LABEL, type StageState } from '$lib/order/stages';

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
    loadingDate?: string;
    badges: Badge[];
    fields: Field[];
    materials: Field[];
    stages: Record<Station, StageState>;
    isRD?: boolean;
    rdNotes?: string;
    fileName: string;
  };

  const assetPath = (name: string) => (assets && assets !== '.' ? `${assets}/files/${name}` : `/files/${name}`);

  const seeds: OrderSeed[] = [
    {
      id: 'PO-250375',
      title: '4500mm Long Frame',
      client: 'ABTB BIJEN',
      due: '2025-10-26',
      loadingDate: '2025-10-24',
      badges: ['OPEN', 'IN_PROGRESS'],
      fields: [{ key: 'priority', label: 'Priority', value: 'Normal' }],
      materials: [{ key: 'face', label: 'Face', value: 'Acrylic 3mm White' }],
      stages: {
        ...blankStages(),
        CAD: 'COMPLETED',
        CNC: 'COMPLETED',
        SANDING: 'IN_PROGRESS'
      },
      fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
    },
    {
      id: 'PO-250420',
      title: 'Pylon Letters',
      client: 'KIA',
      due: '2025-10-30',
      loadingDate: '2025-10-28',
      badges: ['OPEN'],
      fields: [{ key: 'priority', label: 'Priority', value: 'High' }],
      materials: [{ key: 'face', label: 'Face', value: 'Aluminium 4mm' }],
      stages: {
        ...blankStages(),
        CAD: 'COMPLETED',
        CNC: 'IN_PROGRESS',
        SANDING: 'QUEUED'
      },
      fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
    },
    {
      id: 'PO-250501',
      title: 'Menu Lightbox',
      client: 'Burger King',
      due: '2025-11-03',
      loadingDate: '2025-11-01',
      badges: ['OPEN', 'R&D'],
      fields: [{ key: 'priority', label: 'Priority', value: 'Rush' }],
      materials: [{ key: 'face', label: 'Face', value: 'Acrylic 5mm Frosted' }],
      stages: {
        ...blankStages(),
        CAD: 'IN_PROGRESS'
      },
      isRD: true,
      rdNotes: 'Prototype signage. Confirm LED layout before assembly.',
      fileName: 'PO-250375_ABTB-BIJEN_4500mm.pdf'
    }
  ];

  for (const seed of seeds) {
    createOrder({
      id: seed.id,
      title: seed.title,
      client: seed.client,
      due: seed.due,
      badges: seed.badges,
      fields: seed.fields,
      materials: seed.materials,
      stages: seed.stages,
      isRD: seed.isRD,
      rdNotes: seed.rdNotes,
      cycles: [],
      loadingDate: seed.loadingDate,
      file: {
        id: `${seed.id}-file`,
        name: seed.fileName,
        path: assetPath(seed.fileName),
        kind: 'pdf'
      }
    });
  }

  function statusFromOrder(order: Order): string {
    const stagesMap = order.stages ?? blankStages();
    const pending = stations.find((stage) => stagesMap[stage] !== 'COMPLETED');
    if (!pending) return 'Completed';
    const state = stagesMap[pending];
    return `${stationLabels[pending]} · ${STATE_LABEL[state]}`;
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
  let formOpen = false;

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
    <div class="row" style="gap:8px; align-items:center">
      <button class="tag" on:click={() => (formOpen = true)}>New Order</button>
      <div style="width:280px">
        <Input bind:value={q} placeholder="Filter by client…" ariaLabel="Filter" />
      </div>
    </div>
  </div>
  <div style="margin-top:12px">
    <DataTable columns={columns} rows={rows} filterKey="client" filterText={q} />
  </div>
</section>

<OrderForm bind:open={formOpen} onClose={() => { formOpen = false; refresh(); }} />
