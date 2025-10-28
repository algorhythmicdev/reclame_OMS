<script lang="ts">
  import { notifications, togglePin, markSeen, type NotificationItem } from '$lib/notifications/store';
  import { t } from 'svelte-i18n';
  import { TERMS } from '$lib/order/names';
  import { STATIONS, type StationTag } from '$lib/order/stages';

  export let items: NotificationItem[] = [];

  $: feed = Array.isArray(items) && items.length ? items : $notifications;

  let stationFilter: 'all' | StationTag = 'all';
  let urgencyFilter: 'all' | 'urgent' | 'normal' = 'all';

  const stationOptions = STATIONS;

  const urgencyLabel = (value: 'normal' | 'urgent') =>
    value === 'urgent' ? $t('notifications.urgency.urgent') : $t('notifications.urgency.normal');

  const stationLabel = (code: StationTag) => $t(TERMS.stations[code]);

  function applyFilters(list: NotificationItem[]) {
    let filtered = list;
    if (stationFilter !== 'all') {
      filtered = filtered.filter((item) => item.station === stationFilter);
    }
    if (urgencyFilter !== 'all') {
      filtered = filtered.filter((item) => item.urgency === urgencyFilter);
    }
    return filtered;
  }

  $: filtered = applyFilters(feed);
  $: pinned = filtered.filter((item) => item.pinned);
  $: unpinned = filtered.filter((item) => !item.pinned);

  function handlePin(id: string) {
    markSeen(id);
    togglePin(id);
  }

  function handleSeen(id: string) {
    markSeen(id);
  }
</script>

<div class="feed" aria-live="polite" aria-atomic="false">
  <div class="feed-controls">
    <label class="control">
      <span>{$t('notifications.filter.station')}</span>
      <select
        class="rf-input rf-input--compact"
        bind:value={stationFilter}
        aria-label={$t('notifications.filter.station')}
      >
        <option value="all">{$t('notifications.filter.all_stations')}</option>
        {#each stationOptions as option}
          <option value={option}>{stationLabel(option)}</option>
        {/each}
      </select>
    </label>
    <label class="control">
      <span>{$t('notifications.filter.urgency')}</span>
      <select
        class="rf-input rf-input--compact"
        bind:value={urgencyFilter}
        aria-label={$t('notifications.filter.urgency')}
      >
        <option value="all">{$t('notifications.filter.all_urgencies')}</option>
        <option value="urgent">{$t('notifications.urgency.urgent')}</option>
        <option value="normal">{$t('notifications.urgency.normal')}</option>
      </select>
    </label>
  </div>

  <div class="feed-section" role="log" aria-live="polite" aria-atomic="false">
    {#if pinned.length}
      <div class="section-label">{$t('notifications.pinned_section')}</div>
      {#each pinned as item (item.id)}
        <article
          class="card notif"
          data-urgency={item.urgency}
          data-seen={item.seen}
          aria-label={`${item.text} ${item.ts}`}
          tabindex="0"
          on:mouseenter={() => handleSeen(item.id)}
          on:focus={() => handleSeen(item.id)}
        >
          <header class="notif-head">
            <div class="notif-text">{item.text}</div>
            <button
              class="pin"
              type="button"
              on:click={() => handlePin(item.id)}
              aria-pressed={item.pinned}
              aria-label={$t('notifications.unpin_label')}
            >★</button>
          </header>
          <footer class="notif-meta">
            <span class="muted">{item.ts}</span>
            {#if item.station}
              <span class="tag tag--meta">{stationLabel(item.station)}</span>
            {/if}
            <span class="tag tag--meta" data-urgency={item.urgency}>{urgencyLabel(item.urgency)}</span>
          </footer>
        </article>
      {/each}
    {/if}

    {#if unpinned.length && pinned.length}
      <div class="divider" role="presentation"></div>
    {/if}

    {#each unpinned as item (item.id)}
      <article
        class="card notif"
        data-urgency={item.urgency}
        data-seen={item.seen}
        aria-label={`${item.text} ${item.ts}`}
        tabindex="0"
        on:mouseenter={() => handleSeen(item.id)}
        on:focus={() => handleSeen(item.id)}
      >
        <header class="notif-head">
          <div class="notif-text">{item.text}</div>
          <button
            class="pin"
            type="button"
            on:click={() => handlePin(item.id)}
            aria-pressed={item.pinned}
            aria-label={item.pinned ? $t('notifications.unpin_label') : $t('notifications.pin_label')}
          >{item.pinned ? '★' : '☆'}</button>
        </header>
        <footer class="notif-meta">
          <span class="muted">{item.ts}</span>
          {#if item.station}
            <span class="tag tag--meta">{stationLabel(item.station)}</span>
          {/if}
          <span class="tag tag--meta" data-urgency={item.urgency}>{urgencyLabel(item.urgency)}</span>
        </footer>
      </article>
    {/each}

    {#if filtered.length === 0}
      <div class="muted empty">{$t('notifications.empty')}</div>
    {/if}
  </div>
</div>

<style>
  .feed {
    display: grid;
    gap: 12px;
    min-height: 0;
  }

  .feed-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .control {
    display: grid;
    gap: 4px;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--muted);
  }

  .feed-section {
    display: grid;
    gap: 8px;
  }

  .section-label {
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--muted);
  }

  .notif {
    background: var(--bg-2);
    padding: 10px;
    display: grid;
    gap: 6px;
    border-left: 3px solid transparent;
  }

  .notif[data-urgency='urgent'] {
    border-left-color: var(--accent-1);
  }

  .notif[data-seen='true'] {
    background: color-mix(in oklab, var(--bg-2) 80%, var(--bg-1) 20%);
  }

  .notif[data-seen='true'] .notif-text {
    color: var(--muted);
  }

  .notif-head {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
  }

  .notif-text {
    font-size: 0.95rem;
    line-height: 1.4;
  }

  .notif-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
    font-size: 0.75rem;
  }

  .tag--meta {
    border-radius: 999px;
    padding: 2px 6px;
    background: color-mix(in oklab, var(--bg-0) 70%, var(--accent-2) 30%);
    color: var(--text);
    font-size: 0.7rem;
  }

  .tag--meta[data-urgency='urgent'] {
    background: color-mix(in oklab, var(--accent-1) 35%, var(--bg-0));
  }

  .pin {
    border: none;
    background: transparent;
    font-size: 1rem;
    cursor: pointer;
    color: var(--text);
  }

  .divider {
    border-bottom: 1px dashed var(--border);
    margin: 4px 0;
  }

  .empty {
    padding: 12px 0;
  }
</style>
