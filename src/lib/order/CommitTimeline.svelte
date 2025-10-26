<script lang="ts">
  import type { Commit } from './order-model';
  export let commits: Commit[] = [];
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Commits</h3>
  <ul style="display:grid;gap:10px">
    {#each commits as c (c.id)}
      <li class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between"><b>{c.message}</b><span class="muted" style="font-size:.85rem">{new Date(c.ts).toLocaleString()}</span></div>
        <div class="muted" style="margin-top:4px">by {c.author}{#if c.station} · {c.station}{/if}</div>
        {#if c.changes}
          <details style="margin-top:6px">
            <summary>Changed</summary>
            <pre style="white-space:pre-wrap;margin:6px 0">{JSON.stringify(c.changes, null, 2)}</pre>
          </details>
        {/if}
      </li>
    {/each}
  </ul>
</div>
