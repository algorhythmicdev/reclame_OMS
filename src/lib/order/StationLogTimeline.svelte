<script lang="ts">
  import type { StationLog } from './types.signage';
  import { TERMS } from './names';
  export let logs: StationLog[] = [];
  export let id: string | undefined;
</script>

<section class="card" id={id} aria-label={TERMS.stationLogs}>
  <h3 style="margin:0 0 8px 0">{TERMS.stationLogs}</h3>
  <ul style="display:grid;gap:10px" aria-label={TERMS.stationLogs}>
    {#each logs as c (c.id)}
      <li class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between">
          <b>{c.message}</b>
          <time class="muted" datetime={c.ts} style="font-size:.85rem">
            {new Date(c.ts).toLocaleString()}
          </time>
        </div>
        <div class="muted" style="margin-top:4px">
          recorded by {c.author}{#if c.station} · {c.station}{/if}
        </div>
        {#if c.changes}
          <details style="margin-top:6px">
            <summary>Details</summary>
            <pre style="white-space:pre-wrap;margin:6px 0">{JSON.stringify(c.changes, null, 2)}</pre>
          </details>
        {/if}
      </li>
    {/each}
  </ul>
</section>
