<script lang="ts">
  import { assets, base } from '$app/paths';
  import { onMount } from 'svelte';
  import Input from '$lib/ui/Input.svelte';
  import type { Badge, Field, Order, Station } from '$lib/order/types';
  import { listOrders, createOrder } from '$lib/order/signage-store';
  import OrderForm from '$lib/order/OrderForm.svelte';
  import { blankStages, STATE_LABEL, type StageState } from '$lib/order/stages';
  import { TERMS } from '$lib/order/names';
  import { t } from 'svelte-i18n';

  type OrderRow = {
    id: string;
    client: string;
    title: string;
    stages: [Station, StageState][];
    due: string;
    href: string;
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
      fileName: 'NL REKLATEKST Wassink 7000 mm  PO-251076  Nov 14.pdf'
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
      fileName: 'NL LEVANTO ALBERT HEIJN  Lightbox 500 mm   PO-35818  Nov 14.pdf'
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

  function toRow(order: Order): OrderRow {
    const stagesMap = order.stages ?? blankStages();
    return {
      id: order.id,
      client: order.client,
      title: order.title,
      stages: Object.entries(stagesMap) as [Station, StageState][],
      due: order.due,
      href: `${base}/orders/${order.id}`
    };
  }

  let rows: OrderRow[] = [];
  let q = '';
  let formOpen = false;
  let visible: OrderRow[] = [];
  let qLower = '';

  $: qLower = q.trim().toLowerCase();
  $: visible = qLower
    ? rows.filter((row) =>
        `${row.id} ${row.client} ${row.title}`.toLowerCase().includes(qLower)
      )
    : rows;

  function refresh() {
    rows = listOrders()
      .map(toRow)
      .sort((a, b) => a.due.localeCompare(b.due));
  }

  const stationLabel = (code: Station) => $t(TERMS.stations[code]);

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
    <h2 style="margin:0">{$t('orderLists.title')}</h2>
    <div class="row" style="gap:8px; align-items:center">
      <button class="tag" on:click={() => (formOpen = true)}>{$t('orderLists.new')}</button>
      <div style="width:280px">
        <Input bind:value={q} placeholder={$t('orderLists.filter_placeholder')} ariaLabel={$t('orderLists.filter_label')} />
      </div>
    </div>
  </div>
  <div style="margin-top:12px">
    <div class="rf-scroll" style="max-height:60vh">
      <table class="rf-table">
        <thead>
          <tr>
            <th style="width:140px">{$t('orderLists.headers.po')}</th>
            <th>{$t('orderLists.headers.client')}</th>
            <th>{$t('orderLists.headers.title')}</th>
            <th style="width:220px">{$t('orderLists.headers.summary')}</th>
            <th style="width:120px">{$t('orderLists.headers.due')}</th>
          </tr>
        </thead>
        <tbody>
          {#each visible as row (row.id)}
            <tr>
              <td><a href={row.href}>{row.id}</a></td>
              <td>{row.client}</td>
              <td>{row.title}</td>
              <td>
                <div class="row" style="flex-wrap:wrap;gap:6px">
                  {#each row.stages.slice(0,3) as [station, state]}
                    <span class="tag">{stationLabel(station)}: {$t(STATE_LABEL[state])}</span>
                  {/each}
                </div>
              </td>
              <td>{row.due}</td>
            </tr>
          {/each}
          {#if visible.length === 0}
            <tr><td colspan="5" class="muted">{$t('orderLists.empty')}</td></tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</section>

<OrderForm bind:open={formOpen} onClose={() => { formOpen = false; refresh(); }} />
