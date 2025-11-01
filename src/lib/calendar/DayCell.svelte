<script lang="ts">
  import { onDestroy } from 'svelte';
  import { byDate } from './store';
  import EventEditor from './EventEditor.svelte';
  import Truck from 'lucide-svelte/icons/truck';
  import Calendar from 'lucide-svelte/icons/calendar';
  import Sticky from 'lucide-svelte/icons/sticky-note';
  import { loads } from '$lib/state/loads';
  import { dragging } from '$lib/dnd';

  export let iso = '';
  export let dayNum = 1;
  export let canEdit = false;

  let open=false; let pressTimer:any;
  let items = byDate(iso);
  let $loads: any[] = [];
  let over = false;
  
  const unsub = loads.subscribe(v => $loads = v);
  
  onDestroy(() => {
    unsub?.();
  });

  function refresh(){ items = byDate(iso); }
  function onDown(){ clearTimeout(pressTimer); pressTimer=setTimeout(()=>open=true, 450); }
  function onUp(){ clearTimeout(pressTimer); }
  
  function onDragOver(e: DragEvent) {
    if (!e.dataTransfer) return;
    if (e.dataTransfer.types.includes('text/plain')) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    }
  }
  
  function onDrop(e: DragEvent) {
    e.preventDefault();
    over = false;
    const po = e.dataTransfer?.getData('text/plain');
    if (!po) return;
    
    let L = $loads.find(l => l.id === iso);
    if (!L) {
      L = { id: iso, dateISO: iso, pos: [], carrier: '', notes: '', createdAt: new Date().toISOString() };
      $loads.push(L);
    }
    if (!L.pos.includes(po)) {
      L.pos.push(po);
    }
    loads.set([...$loads]);
    announce(`Assigned ${po} to ${iso}`);
  }
  
  function announce(msg: string) {
    const el = document.getElementById('rf-live') as HTMLElement;
    if (el) {
      el.textContent = msg;
      setTimeout(() => el.textContent = '', 1000);
    }
  }
</script>

<div 
  class="day" 
  class:dragover={over}
  tabindex="0" 
  aria-label={`Day ${iso} — drop PO here`}
  aria-dropeffect="copy"
  on:pointerdown={onDown} 
  on:pointerup={onUp} 
  on:pointerleave={onUp}
  on:dragover={onDragOver}
  on:drop={onDrop}
  on:dragenter={() => over = true}
  on:dragleave={() => over = false}>
  <div class="row" style="justify-content:space-between">
    <div class="day-num">{dayNum}</div>
    {#if canEdit}
      <button class="tag ghost" title="Add entry" on:click={() => (open = true)}>+</button>
    {/if}
  </div>

  <div class="stack">
    {#each items as e (e.id)}
      <button
        class="chip"
        data-kind={e.kind}
        title={e.kind==='loading' ? `Carrier: ${(e as any).carrier||'-'}` : (e as any).title || e.kind}
        on:click={() => { open = true; }}
      >
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
{#if open}<EventEditor dateISO={iso} onClose={()=>{open=false; refresh();}} />{/if}

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
.day.dragover{
  outline: 2px dashed var(--ok);
  outline-offset: 3px;
}
.day-num{
  font-weight:700;
  color:var(--cal-num);
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
