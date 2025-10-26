<script lang="ts">
  import type { ChangeRequest } from './types.signage';
  import { TERMS } from './names';
  export let items: ChangeRequest[] = [];
  export let isAdmin = false;
  export let onApprove: (id:string)=>void = ()=>{};
  export let onDecline: (id:string)=>void = ()=>{};
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{TERMS.changeRequests}</h3>
  <ul style="display:grid;gap:8px" aria-label={TERMS.changeRequests}>
    {#each items as p (p.id)}
      <li class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between;gap:12px">
          <div>
            <b>{p.title}</b>
            <div class="muted">from {p.author} — {p.status}</div>
            {#if p.message}<div class="muted" style="margin-top:4px">{p.message}</div>{/if}
          </div>
          <div class="row">
            {#if isAdmin && p.status==='open'}
              <button class="tag" on:click={()=>onApprove(p.id)} aria-label={`${TERMS.approve} ${TERMS.changeRequest}`}>{TERMS.approve}</button>
              <button class="tag" on:click={()=>onDecline(p.id)} aria-label={`${TERMS.decline} ${TERMS.changeRequest}`}>{TERMS.decline}</button>
            {/if}
          </div>
        </div>
        <details style="margin-top:6px">
          <summary>Proposed changes</summary>
          <pre style="white-space:pre-wrap;margin:6px 0">{JSON.stringify(p.proposed, null, 2)}</pre>
        </details>
      </li>
    {/each}
    {#if items.length===0}<div class="muted">No pending {TERMS.changeRequests.toLowerCase()}.</div>{/if}
  </ul>
</div>
