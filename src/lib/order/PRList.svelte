<script lang="ts">
  import type { PullRequest } from './types';
  export let prs: PullRequest[] = [];
  export let isAdmin = false;
  export let onMerge: (id:string)=>void = ()=>{};
  export let onClose: (id:string)=>void = ()=>{};
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Pull Requests</h3>
  <ul style="display:grid;gap:8px">
    {#each prs as p (p.id)}
      <li class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between">
          <div>
            <b>{p.title}</b> <span class="muted">by {p.author} — {p.status}</span>
            {#if p.message}<div class="muted" style="margin-top:4px">{p.message}</div>{/if}
          </div>
          <div class="row">
            {#if isAdmin && p.status==='open'}
              <button class="tag" on:click={()=>onMerge(p.id)} aria-label="Merge PR">Merge</button>
              <button class="tag" on:click={()=>onClose(p.id)} aria-label="Close PR">Close</button>
            {/if}
          </div>
        </div>
        <details style="margin-top:6px">
          <summary>Proposed changes</summary>
          <pre style="white-space:pre-wrap;margin:6px 0">{JSON.stringify(p.proposed, null, 2)}</pre>
        </details>
      </li>
    {/each}
    {#if prs.length===0}<div class="muted">No pull requests.</div>{/if}
  </ul>
</div>
