<script lang="ts">
  import { notifications } from '$lib/notifications/store';
  import type { NotificationItem } from '$lib/notifications/store';

  export let items: NotificationItem[] = [];

  $: feed = Array.isArray(items) && items.length ? items : $notifications;
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
