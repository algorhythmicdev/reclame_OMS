<script lang="ts">
  import { onMount } from 'svelte';
  export let items: { id: string; text: string; ts?: string }[] = [];

  // maintain a local feed so we never mutate the exported prop directly
  let feed = Array.isArray(items) ? [...items] : [];
  let previousItems = items;
  let ticker: ReturnType<typeof setInterval> | undefined;

  const makeId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  $: if (items !== previousItems) {
    feed = Array.isArray(items) ? [...items] : [];
    previousItems = items;
  }

  onMount(() => {
    ticker = setInterval(() => {
      const now = new Date().toLocaleTimeString();
      feed = [{ id: makeId(), text: 'Heartbeat OK', ts: now }, ...feed].slice(0, 50);
    }, 7000);
    return () => {
      if (ticker) clearInterval(ticker);
    };
  });
</script>

<div class="rf-panel">
  <header style="font-weight:900;margin-bottom:8px">Notifications</header>
  <div class="rf-scroll" style="display:grid;gap:8px" role="log" aria-live="polite" aria-atomic="false">
    {#each feed as n (n.id)}
      <div class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between;gap:10px">
          <span>{n.text}</span>
          {#if n.ts}<span class="muted" style="font-size:.8rem">{n.ts}</span>{/if}
        </div>
      </div>
    {/each}
    {#if feed.length === 0}<div class="muted">No notifications yet.</div>{/if}
  </div>
</div>
