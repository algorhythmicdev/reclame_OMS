<script lang="ts">
  import { onMount } from 'svelte';
  import CalendarMonth from '$lib/calendar/CalendarMonth.svelte';
  import { listOrders } from '$lib/order/signage-store';
  import { downloadCSV, toCSV } from '$lib/export/csv';
  import { listAll } from '$lib/loading/loading-store';
  import { t } from 'svelte-i18n';

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

  $: daySchedule = selectedISO
    ? orders.filter((order) => order.loadingDate === selectedISO)
    : [];

  function exportCSV() {
    if (!selectedISO) return;
    const rows = daySchedule.map((order) => ({
      PO: order.id,
      Client: order.client,
      Title: order.title,
      Due: order.due,
      Loading: order.loadingDate ?? ''
    }));
    downloadCSV(`loading-${selectedISO}.csv`, toCSV(rows, ['PO', 'Client', 'Title', 'Due', 'Loading']));
  }

  $: selectedMeta = selectedISO
    ? listAll().find((day) => day.id === selectedISO) || null
    : null;
</script>

<section class="card">
  <div class="row" style="justify-content:space-between;align-items:center">
    <h2 style="margin:0">{$t('calendar.title')}</h2>
    <div class="row" style="gap:8px; align-items:center">
      <button class="tag" on:click={prev}>◀</button>
      <div style="min-width:140px;text-align:center;font-weight:700">{y} · {m + 1}</div>
      <button class="tag" on:click={next}>▶</button>
      <button class="tag" on:click={() => (adminMode = !adminMode)} aria-pressed={adminMode}>
        {$t('calendar.loading_mode')}: {adminMode ? 'ON' : 'OFF'}
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
            Capacity {selectedMeta.capacity} · Note: {selectedMeta.note || '—'}
          </div>
        {/if}
      </div>
      <button class="tag" on:click={exportCSV}>{$t('loading.export_csv')}</button>
    </div>
    <div class="rf-scroll" style="margin-top:8px;max-height:320px">
      <table class="rf-table">
        <thead>
          <tr><th>PO</th><th>Client</th><th>Title</th><th>Due</th></tr>
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
            <tr><td colspan="4" class="muted">No orders assigned.</td></tr>
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
  border-bottom:1px solid rgba(255,255,255,.06);
  text-align:left;
}
</style>
