<script lang="ts">
  import { onDestroy } from 'svelte';
  import { t } from 'svelte-i18n';
  import { calEvents } from './store';

  type Kind = 'all' | 'loading' | 'meeting' | 'note';

  let entries: any[] = [];
  let kind: Kind = 'all';

  const unsubscribe = calEvents.subscribe((value) => {
    entries = [...value].sort((a, b) => a.date.localeCompare(b.date));
  });

  onDestroy(() => {
    unsubscribe?.();
  });

  const filters: { value: Kind; label: string }[] = [
    { value: 'all', label: 'calendar.all' },
    { value: 'loading', label: 'calendar.loading' },
    { value: 'meeting', label: 'calendar.meeting' },
    { value: 'note', label: 'calendar.note' }
  ];
</script>

<div class="row" style="justify-content:space-between;align-items:center">
  <h3>{$t('calendar.upcoming')}</h3>
  <select bind:value={kind}>
    {#each filters as option}
      <option value={option.value}>{$t(option.label)}</option>
    {/each}
  </select>
</div>

<ul class="list">
  {#each entries.filter((event) => kind==='all' || event.kind===kind).slice(0, 100) as e}
    <li class="row" style="justify-content:space-between">
      <div>
        <b>{e.date}</b>
        {#if e.kind==='loading'} – Carrier: {(e as any).carrier || 'n/a'}; POs: {(e as any).poList?.length || 0}{/if}
        {#if e.kind==='meeting'} – {(e as any).title}{/if}
        {#if e.kind==='note'} – {(e as any).title || 'Note'}{/if}
      </div>
      <span class="muted">{new Date(e.createdAt).toLocaleString()}</span>
    </li>
  {/each}
</ul>

<style>
.list{display:grid;gap:6px}
.list li{border:1px solid var(--border);border-radius:10px;padding:8px;background:var(--bg-0)}
</style>
