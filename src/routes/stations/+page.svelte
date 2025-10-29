<script lang="ts">
  import { board, moveTicket } from '$lib/stations/store';
  import { WIP, atLimit, type Stage } from '$lib/stations/wip';
  import AlertTriangle from 'lucide-svelte/icons/alert-triangle';
  
  let boardData = [];
  const unsub = board.subscribe(v => boardData = v);
  const stages:Stage[]=['CNC','SANDING','BENDING','WELDING','PAINT','ASSEMBLY','QC','LOGISTICS'];

  let dragging: { id:string; from:Stage } | null = null;

  function onDragStart(e:DragEvent, id:string, from:Stage){
    dragging = { id, from }; e.dataTransfer?.setData('text/plain', id);
  }
  function onDragOver(e:DragEvent, s:Stage){ e.preventDefault(); /* allow drop */ }
  function onDrop(e:DragEvent, to:Stage){
    e.preventDefault(); if(!dragging) return;
    const countHere = boardData.filter(t=>t.stage===to).length;
    if(atLimit(to, countHere)){ alert(`WIP limit reached in ${to}`); dragging=null; return; }
    moveTicket(dragging.id, to); dragging=null;
  }
</script>

<section class="grid" style="grid-template-columns:repeat(8,minmax(220px,1fr));align-items:start">
  {#each stages as s}
    <div class="card column" on:dragover={(e)=>onDragOver(e,s)} on:drop={(e)=>onDrop(e,s)} aria-label={`${s} column`}>
      <header class="row" style="justify-content:space-between">
        <strong>{s}</strong>
        <span class="tag">{ boardData.filter(t=>t.stage===s).length } / {WIP[s]}</span>
      </header>

      {#if atLimit(s, boardData.filter(t=>t.stage===s).length)}
        <div class="warn"><AlertTriangle aria-hidden="true" /> <span>WIP limit</span></div>
      {/if}

      <div class="col-body">
        {#each boardData.filter(t=>t.stage===s) as t (t.id)}
          <article class="ticket" draggable="true" on:dragstart={(e)=>onDragStart(e,t.id,s)}>
            <div class="row" style="justify-content:space-between"><b>{t.po}</b><span class="muted">{t.client}</span></div>
            <div>{t.title}</div>
          </article>
        {/each}
      </div>
    </div>
  {/each}
</section>

<style>
.column{min-height:280px}
.col-body{display:grid;gap:8px;margin-top:8px}
.ticket{border:1px solid var(--border);background:var(--bg-0);border-radius:10px;padding:8px}
.warn{display:flex;gap:6px;align-items:center;color:var(--warn)}
</style>
