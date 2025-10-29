<script lang="ts">
  import { onMount } from 'svelte';
  import CalendarMonth from '$lib/calendar/CalendarMonth.svelte';
  import Tooltip from '$lib/ui/Tooltip.svelte';
  import { listOrders } from '$lib/order/signage-store';
  import { downloadCSV, toCSV } from '$lib/export/csv';
  import { listAll } from '$lib/loading/loading-store';
  import { get } from 'svelte/store';
  import { t } from 'svelte-i18n';
  import type { Order } from '$lib/order/types';

  let today = new Date();
  let y = today.getFullYear();
  let m = today.getMonth();
  let adminMode = true;
  let selectedISO: string | null = null;
  let orders = listOrders();

  function refreshOrders() {
    orders = listOrders();
  }

  function prev() {
    m -= 1;
    if (m < 0) {
      m = 11;
      y -= 1;
    }
  }

  function next() {
    m += 1;
    if (m > 11) {
      m = 0;
      y += 1;
    }
  }

  function onPicked(event: CustomEvent<string>) {
    selectedISO = event.detail;
    refreshOrders();
  }

  onMount(() => {
    refreshOrders();
    const handler = (event: StorageEvent) => {
      if (!event.key || event.key === 'rf_orders_vcs') {
        refreshOrders();
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  });

  let daySchedule: Order[] = [];
  $: daySchedule = selectedISO
    ? orders.filter((order) => order.loadingDate === selectedISO)
    : [];

  function exportCSV() {
    if (!selectedISO) return;
    const translate = get(t);
    const columns = [
      { label: translate('calendar.columns.po'), value: (order: Order) => order.id },
      { label: translate('calendar.columns.client'), value: (order: Order) => order.client },
      { label: translate('calendar.columns.title'), value: (order: Order) => order.title },
      { label: translate('calendar.columns.due'), value: (order: Order) => order.due },
      { label: translate('calendar.columns.loading'), value: (order: Order) => order.loadingDate ?? '' }
    ];
    const rows = daySchedule.map((order) =>
      Object.fromEntries(columns.map((column) => [column.label, column.value(order)]))
    );
    downloadCSV(`loading-${selectedISO}.csv`, toCSV(rows, columns.map((column) => column.label)));
  }

  $: selectedMeta = selectedISO
    ? listAll().find((day) => day.id === selectedISO) || null
    : null;
</script>

<section class="card">
  <div class="row" style="justify-content:space-between;align-items:center">
    <div style="display: flex; align-items: center; gap: 8px;">
      <h2 style="margin:0">{$t('calendar.title')}</h2>
      <Tooltip text="Toggle admin mode to mark loading days. Click days to view or assign orders." />
    </div>
    <div class="row" style="gap:8px; align-items:center">
      <button class="tag" on:click={prev}>◀</button>
      <div style="min-width:140px;text-align:center;font-weight:700">{y} · {m + 1}</div>
      <button class="tag" on:click={next}>▶</button>
      <button class="tag" on:click={() => (adminMode = !adminMode)} aria-pressed={adminMode}>
        {$t('calendar.loading_mode')}: {$t(adminMode ? 'calendar.loading_on' : 'calendar.loading_off')}
      </button>
    </div>
  </div>

  <CalendarMonth year={y} month={m} {adminMode} on:selectDay={onPicked} />
</section>

{#if selectedISO}
  <section class="card" style="margin-top:12px">
    <div class="row" style="justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0 0 4px 0">{$t('loading.schedule')}: {selectedISO}</h3>
        {#if selectedMeta}
          <div class="muted" style="font-size:.85rem">
            {$t('calendar.meta', {
              capacity: selectedMeta.capacity,
              note: selectedMeta.note || $t('calendar.note_empty')
            })}
          </div>
        {/if}
      </div>
      <button class="tag" on:click={exportCSV}>{$t('loading.export_csv')}</button>
    </div>
    <div class="rf-scroll" style="margin-top:8px;max-height:320px">
      <table class="rf-table">
        <thead>
          <tr>
            <th>{$t('calendar.columns.po')}</th>
            <th>{$t('calendar.columns.client')}</th>
            <th>{$t('calendar.columns.title')}</th>
            <th>{$t('calendar.columns.due')}</th>
          </tr>
        </thead>
        <tbody>
          {#each daySchedule as row}
            <tr>
              <td>{row.id}</td>
              <td>{row.client}</td>
              <td>{row.title}</td>
              <td>{row.due}</td>
            </tr>
          {/each}
          {#if daySchedule.length === 0}
            <tr>
              <td colspan="4" class="muted">{$t('calendar.empty')}</td>
            </tr>
          {/if}
        </tbody>
      </table>
    </div>
  </section>
{/if}

<style>
:global(.rf-table){
  width:100%;
  border-collapse:collapse;
}
:global(.rf-table th),
:global(.rf-table td){
  padding:10px;
  border-bottom:1px solid var(--border);
  text-align:left;
}
</style>
