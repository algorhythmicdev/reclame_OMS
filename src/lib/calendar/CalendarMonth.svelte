<script lang="ts">
import { onMount, createEventDispatcher } from 'svelte';
import { t } from 'svelte-i18n';
  import { toggleDay, listAll, setCapacity, setNote, usage } from '$lib/loading/loading-store';

  export let year: number;
  export let month: number;
  export let adminMode = false;

  type DayCell = { d: Date; iso: string; inMonth: boolean };

  let days: DayCell[] = [];
  let selectedISO: string | null = null;
  const dispatch = createEventDispatcher<string>();
  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

  function toISO(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  function build() {
    days = [];
    const first = new Date(year, month, 1);
    const dow = first.getDay() || 7;
    const start = new Date(first);
    start.setDate(1 - (dow - 1));
    for (let i = 0; i < 42; i += 1) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      days.push({ d: current, iso: toISO(current), inMonth: current.getMonth() === month });
    }
  }

  onMount(build);
  $: (year, month, adminMode, build());

  function clickDay(iso: string) {
    if (!adminMode) {
      selectedISO = iso;
      dispatch('selectDay', iso);
      return;
    }
    toggleDay(iso);
    selectedISO = iso;
    dispatch('selectDay', iso);
  }

  function meta(iso: string) {
    const stats = usage(iso);
    const day = listAll().find((item) => item.id === iso);
    return {
      active: Boolean(day?.active),
      note: day?.note ?? '',
      capacity: day?.capacity ?? 0,
      ...stats
    };
  }

  function handleCapacityChange(event: Event, iso: string | null) {
    if (!iso) return;
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    const value = Number.parseInt(target.value, 10);
    setCapacity(iso, Number.isFinite(value) ? value : 0);
  }

  function handleNoteChange(event: Event, iso: string | null) {
    if (!iso) return;
    const target = event.target as HTMLInputElement | null;
    if (!target) return;
    setNote(iso, target.value);
  }
</script>

<div class="cal">
  <div class="head">
    {#each dayKeys as key}
      <div>{$t(`calendar.days.${key}`)}</div>
    {/each}
  </div>
  <div class="grid">
    {#each days as day (day.iso)}
      {#if day.inMonth}
        {@const info = meta(day.iso)}
        <button
          class="cell"
          style={`--fill:${info.capacity ? info.assigned / info.capacity : 0};`}
          aria-pressed={info.active}
          data-active={info.active}
          on:click={() => clickDay(day.iso)}>
          <div class="date">{day.d.getDate()}</div>
          {#if info.active}
            <div class="badge" aria-label={$t('calendar.loading_day')}>
              {info.assigned}/{info.capacity || '∞'}
            </div>
          {/if}
        </button>
      {:else}
        <div class="cell muted"></div>
      {/if}
    {/each}
  </div>
</div>

{#if adminMode && selectedISO}
  {@const currentISO = selectedISO}
  {@const info = meta(currentISO)}
  <div class="card" style="margin-top:10px">
    <h3 style="margin:0 0 8px 0">{$t('calendar.loading_day_with_date', { date: currentISO })}</h3>
    <div class="row" style="gap:8px;flex-wrap:wrap">
      <label>
        <span>{$t('calendar.capacity')}</span>
        <input
          class="rf-input"
          type="number"
          min="0"
          value={info.capacity}
          on:change={(event) => handleCapacityChange(event, currentISO)}
        />
      </label>
      <label>
        <span>{$t('calendar.note')}</span>
        <input
          class="rf-input"
          type="text"
          value={info.note}
          on:change={(event) => handleNoteChange(event, currentISO)}
        />
      </label>
    </div>
  </div>
{/if}

<style>
.cal{ display:grid; gap:8px }
.head{ display:grid; grid-template-columns:repeat(7,1fr); gap:4px; text-align:center }
.grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px }
.cell{ position:relative; min-height:80px; border:1px solid var(--border); border-radius:10px; background:var(--bg-0); cursor:pointer }
.cell[data-active="true"]{ outline:2px solid var(--accent-1) }
.cell::after{
  content:"";
  position:absolute;
  left:0;
  right:0;
  bottom:0;
  height:4px;
  background:linear-gradient(90deg,var(--accent-1),var(--accent-2));
  transform-origin:left;
  transform:scaleX(var(--fill, 0));
}
.cell .date{ position:absolute; top:6px; left:8px; font-weight:700 }
.cell .badge{ position:absolute; bottom:6px; right:8px; font-size:.8rem; padding:2px 6px; border-radius:999px; background:var(--bg-2) }
.cell.muted{ opacity:.35; border-style:dashed }
</style>
