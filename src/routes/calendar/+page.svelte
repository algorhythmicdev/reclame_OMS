<script lang="ts">
  import { onMount } from 'svelte';
  import CalendarMonth from '$lib/calendar/CalendarMonth.svelte';
  import WeekStrip from '$lib/calendar/WeekStrip.svelte';
  import DayList from '$lib/calendar/DayList.svelte';
  import Tooltip from '$lib/ui/Tooltip.svelte';
  import { listOrders } from '$lib/order/signage-store';
  import { downloadCSV, toCSV } from '$lib/export/csv';
  import { listAll } from '$lib/loading/loading-store';
  import { get } from 'svelte/store';
  import { t } from 'svelte-i18n';
  import type { Order } from '$lib/order/types';
  import { loads } from '$lib/state/loads';
  import EventEditor from '$lib/calendar/EventEditor.svelte';
  import { Calendar, TruckIcon, Users, StickyNote, Grid3x3, List, Download, Truck } from 'lucide-svelte';

  let today = new Date();
  let y = today.getFullYear();
  let m = today.getMonth();
  let adminMode = true;
  let selectedISO: string | null = null;
  let orders = listOrders();
  let mode:'grid'|'list'='grid';
  let quick:{kind:'loading'|'meeting'|'note', dateISO?:string}|null=null;
  
  function openQuick(kind:'loading'|'meeting'|'note'){ 
    quick={kind, dateISO:new Date().toISOString().slice(0,10)}; 
  }

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

  let loadsList: any[] = [];
  loads.subscribe(v => loadsList = v);

  function toICS(){
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//RF OMS//EN'];
    for(const l of loadsList){
      lines.push('BEGIN:VEVENT');
      lines.push(`UID:${l.id}@reclame-oms`);
      lines.push(`DTSTART;VALUE=DATE:${l.dateISO.replaceAll('-','')}`);
      lines.push(`SUMMARY:Loading day (${l.carrier||'carrier n/a'})`);
      if (l.notes) lines.push(`DESCRIPTION:${l.notes.replace(/\n/g,'\\n')}`);
      lines.push('END:VEVENT');
    }
    lines.push('END:VCALENDAR');
    const blob = new Blob([lines.join('\r\n')], {type:'text/calendar'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='reclame-loading.ics'; a.click(); URL.revokeObjectURL(url);
  }
</script>

<section class="card cal-card">
  <div class="cal-header-sticky">
    <div class="cal-header-content">
      <div class="cal-header-title">
        <Calendar size={20} aria-hidden="true" />
        <h2 class="cal-month-title">{$t('calendar.title')}</h2>
        <Tooltip text="Toggle admin mode to mark loading days. Click days to view or assign orders." />
      </div>
      
      <div class="cal-header-actions">
        <div class="cal-actions-group">
          <button class="tag" on:click={()=>openQuick('loading')}>
            <TruckIcon size={14} aria-hidden="true" />
            <span>New loading</span>
          </button>
          <button class="tag ghost" on:click={()=>openQuick('meeting')}>
            <Users size={14} aria-hidden="true" />
            <span>New meeting</span>
          </button>
          <button class="tag ghost" on:click={()=>openQuick('note')}>
            <StickyNote size={14} aria-hidden="true" />
            <span>New note</span>
          </button>
        </div>
        
        <div class="cal-actions-group" role="tablist" aria-label="View mode">
          <button class="tag" class:is-active={mode==='grid'} role="tab" aria-selected={mode==='grid'} on:click={()=>mode='grid'}>
            <Grid3x3 size={14} aria-hidden="true" />
            <span>Grid</span>
          </button>
          <button class="tag" class:is-active={mode==='list'} role="tab" aria-selected={mode==='list'} on:click={()=>mode='list'}>
            <List size={14} aria-hidden="true" />
            <span>List</span>
          </button>
        </div>
        
        <div class="cal-actions-group cal-nav-group">
          <button class="tag" on:click={prev} aria-label="Previous month">◀</button>
          <div class="cal-month-display">{y} · {m + 1}</div>
          <button class="tag" on:click={next} aria-label="Next month">▶</button>
        </div>
        
        <div class="cal-actions-group">
          <button class="tag" on:click={() => (adminMode = !adminMode)} aria-pressed={adminMode}>
            <Truck size={14} aria-hidden="true" />
            {$t('calendar.loading_mode')}: {$t(adminMode ? 'calendar.loading_on' : 'calendar.loading_off')}
          </button>
          <button class="tag ghost" on:click={toICS}>
            <Download size={14} aria-hidden="true" />
            <span>Export ICS</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  {#if mode==='grid'}
    <div class="cal-month">
      <CalendarMonth year={y} month={m} {adminMode} on:selectDay={onPicked} />
    </div>
    <WeekStrip year={y} month={m} />
  {:else}
    <DayList />
  {/if}
</section>

{#if selectedISO}
  <section class="card" style="margin-top:12px">
    <div class="row" style="justify-content:space-between;align-items:center">
      <div>
        <h3 style="margin:0 0 4px 0">{$t('loading.schedule')}: {selectedISO}</h3>
        {#if selectedMeta}
          <div class="muted" style="font-size:.85rem">
            {#if selectedMeta.carrier}
              Carrier: {selectedMeta.carrier}
              {#if selectedMeta.note} · Note: {selectedMeta.note}{/if}
            {:else if selectedMeta.note}
              Note: {selectedMeta.note}
            {:else}
              {$t('calendar.note_empty')}
            {/if}
          </div>
        {/if}
      </div>
      <button class="tag" on:click={exportCSV}>
        <Download size={14} aria-hidden="true" />
        {$t('loading.export_csv')}
      </button>
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

{#if quick}<EventEditor dateISO={quick.dateISO} presetKind={quick.kind} onClose={()=>quick=null}/>{/if}

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

.cal-card{ 
  container-type:inline-size;
  padding: 0;
}

.cal-header-sticky {
  position: sticky;
  top: calc(var(--topbar-h, 56px) + var(--space-sm));
  z-index: 10;
  background: var(--bg-1);
  border-bottom: 1px solid var(--border);
  padding: var(--space-lg);
  margin: 0 -1px;
  border-radius: var(--radius-lg) var(--radius-lg) 0 0;
}

.cal-header-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.cal-header-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cal-month-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.25rem;
  letter-spacing: 0.2px;
}

.cal-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.cal-actions-group {
  display: flex;
  gap: 6px;
  align-items: center;
}

.cal-nav-group {
  border: 1px solid var(--border);
  border-radius: var(--radius-full);
  padding: 2px;
}

.cal-month-display {
  min-width: 140px;
  text-align: center;
  font-weight: 700;
  padding: 0 8px;
}

.cal-month{
  display:block;
  padding: var(--space-lg);
}

/* Container query breakpoint at 560px - applies when the card itself is narrow,
   which can happen even on larger screens with sidebars or multi-column layouts.
   This is different from the 820px media query which applies to viewport width. */
@container (width <= 560px){ 
  /* phones or narrow cards */
  /* auto-switch to compact week strip when card is narrow */
  .cal-month{ 
    display:none 
  }
  :global(.cal-weekstrip){ 
    display:block 
  }
  
  .cal-header-content {
    gap: 8px;
  }
  
  .cal-header-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .cal-actions-group {
    width: 100%;
    justify-content: center;
  }
}
</style>
