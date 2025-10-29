<script lang="ts">
  import { byDate } from './store';
  import EventEditor from './EventEditor.svelte';
  import Truck from 'lucide-svelte/icons/truck';
  import Calendar from 'lucide-svelte/icons/calendar';
  import Sticky from 'lucide-svelte/icons/sticky-note';

  export let iso = '';       // 'YYYY-MM-DD'
  export let dayNum = 1;
  export let canEdit = false;

  let open = false;
  let items = byDate(iso);
  
  function refresh(){ 
    items = byDate(iso); 
  }
</script>

<div class="day" tabindex="0" aria-label={`Day ${iso}`}>
  <div class="row" style="justify-content:space-between">
    <div class="day-num">{dayNum}</div>
    {#if canEdit}
      <button class="tag ghost" title="Add entry" on:click={()=>open=true}>+</button>
    {/if}
  </div>

  <div class="stack">
    {#each items as e (e.id)}
      <button 
        class="chip" 
        data-kind={e.kind} 
        title={e.kind==='loading' ? `Carrier: ${(e as any).carrier||'-'}` : (e as any).title || e.kind}
        on:click={()=>{open=true;}}>
        {#if e.kind==='loading'}<Truck size={14} aria-hidden="true"/>{/if}
        {#if e.kind==='meeting'}<Calendar size={14} aria-hidden="true"/>{/if}
        {#if e.kind==='note'}<Sticky size={14} aria-hidden="true"/>{/if}
        <span>
          {e.kind==='loading' ? `POs: ${(e as any).poList?.length||0}` :
           e.kind==='meeting' ? (e as any).title :
           (e as any).title || 'Note'}
        </span>
      </button>
    {/each}
  </div>
</div>

{#if open}
  <EventEditor dateISO={iso} onClose={()=>{open=false; refresh();}} />
{/if}

<style>
.day{
  background:var(--cal-day); 
  border:1px solid var(--cal-day-border); 
  border-radius:12px; 
  padding:8px; 
  display:grid; 
  gap:6px;
  min-height: 100px;
}
.day-num{
  font-weight:700; 
  color:var(--cal-day-num);
}
.stack{
  display:grid; 
  gap:6px; 
  max-height:120px; 
  overflow:auto;
}
.chip{
  display:flex; 
  gap:6px; 
  align-items:center; 
  border:1px solid var(--border); 
  border-radius:999px; 
  padding:4px 8px; 
  font-size:.9rem;
  background: var(--bg-1);
  color: var(--text);
  cursor: pointer;
  text-align: left;
}
.chip:hover {
  background: var(--bg-2);
}
.chip[data-kind="loading"]{
  border-color:var(--accent);
}
.chip[data-kind="meeting"]{
  border-color:var(--ok);
}
.chip[data-kind="note"]{
  border-color:var(--muted);
}
</style>
