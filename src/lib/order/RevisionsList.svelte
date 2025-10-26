<script lang="ts">
  import type { Revision } from './types';
  export let items: Revision[] = [];
  export let currentId = '';
  export let onUse: (id:string)=>void = ()=>{};
  export let canManage = false;
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">File Revisions</h3>
  <ul style="display:grid;gap:8px">
    {#each items as r (r.id)}
      <li class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between">
          <div>
            <b>{r.message}</b>
            <div class="muted">{r.file.name} • by {r.createdBy}</div>
          </div>
          <div class="row">
            {#if currentId===r.id}
              <span class="tag">In use</span>
            {:else if canManage}
              <button class="tag" on:click={()=>onUse(r.id)} aria-label="Use this revision">Use</button>
            {/if}
            <a class="tag" href={r.file.path} target="_blank" rel="noreferrer">Download</a>
          </div>
        </div>
      </li>
    {/each}
    {#if items.length===0}<div class="muted">No revisions.</div>{/if}
  </ul>
</div>
