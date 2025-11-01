<script lang="ts">
  import { assets, base } from '$app/paths';
  import { onMount } from 'svelte';
  import Input from '$lib/ui/Input.svelte';
  import Tooltip from '$lib/ui/Tooltip.svelte';
  import type { Order, Station, Badge as BadgeCode } from '$lib/order/types';
  import { listOrders, createOrder } from '$lib/order/signage-store';
  import OrderForm from '$lib/order/OrderForm.svelte';
  import DraftOrderForm from '$lib/order/DraftOrderForm.svelte';
  import { blankStages, STATE_LABEL, type StageState } from '$lib/order/stages';
  import { TERMS } from '$lib/order/names';
  import { t } from 'svelte-i18n';
  import { ORDER_SEEDS } from '$lib/order/order-seeds';
  import { BADGE_ICONS, badgeTone } from '$lib/order/badges';
  import Badge from '$lib/ui/Badge.svelte';
  import { currentUser } from '$lib/users/user-store';
  import { dragging } from '$lib/dnd';

  type OrderRow = {
    id: string;
    client: string;
    title: string;
    stages: [Station, StageState][];
    due: string;
    loadingDate: string;
    badges: BadgeCode[];
    href: string;
    isDraft: boolean;
    expanded: boolean;
  };

  const assetPath = (name: string) => (assets && assets !== '.' ? `${assets}/files/${name}` : `/files/${name}`);

  for (const seed of ORDER_SEEDS) {
    const stages = seed.stages ? { ...blankStages(), ...seed.stages } : blankStages();
    createOrder({
      id: seed.id,
      title: seed.title,
      client: seed.client,
      due: seed.due,
      badges: seed.badges,
      fields: seed.fields,
      materials: seed.materials,
      stages,
      isRD: seed.isRD,
      rdNotes: seed.rdNotes,
      cycles: [],
      loadingDate: seed.loadingDate,
      file: {
        id: `${seed.id}-file`,
        name: seed.fileName,
        path: assetPath(seed.fileName),
        kind: 'pdf'
      }
    });
  }

  function toRow(order: Order): OrderRow {
    const stagesMap = order.stages ?? blankStages();
    return {
      id: order.id,
      client: order.client,
      title: order.title,
      stages: Object.entries(stagesMap) as [Station, StageState][],
      due: order.due,
      loadingDate: order.loadingDate ?? '',
      badges: order.badges ?? [],
      href: `${base}/orders/${order.id}`,
      isDraft: order.isDraft || false,
      expanded: false
    };
  }

  let rows: OrderRow[] = [];
  let q = '';
  let formOpen = false;
  let draftFormOpen = false;
  let visible: OrderRow[] = [];
  let qLower = '';
  let sortKey: 'id' | 'client' | 'title' | 'due' | 'loadingDate' = 'due';
  let sortAsc = true;

  $: qLower = q.trim().toLowerCase();
  $: {
    let filtered = qLower
      ? rows.filter((row) =>
          `${row.id} ${row.client} ${row.title}`.toLowerCase().includes(qLower)
        )
      : rows;
    
    // Sort the filtered results
    visible = filtered.sort((a, b) => {
      let av = a[sortKey] || '';
      let bv = b[sortKey] || '';
      const result = av > bv ? 1 : av < bv ? -1 : 0;
      return sortAsc ? result : -result;
    });
  }

  $: isAdmin = $currentUser?.role === 'Admin' || $currentUser?.role === 'SuperAdmin';
  $: isSuperAdmin = $currentUser?.role === 'SuperAdmin';

  function refresh() {
    const allOrders = listOrders();
    // Filter draft orders - only visible to Admin and SuperAdmin
    const filteredOrders = isAdmin 
      ? allOrders 
      : allOrders.filter(order => !order.isDraft);
    
    rows = filteredOrders.map(toRow);
  }

  function toggleSort(key: typeof sortKey) {
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
  }

  function toggleExpand(rowId: string) {
    rows = rows.map(row => 
      row.id === rowId ? { ...row, expanded: !row.expanded } : row
    );
  }

  const stationLabel = (code: Station) => $t(TERMS.stations[code]);
  const badgeLabel = (badge: BadgeCode) => $t(TERMS.badges[badge]);

  refresh();

  onMount(() => {
    refresh();
    const handleStorage = (event: StorageEvent) => {
      if (!event.key || event.key === 'rf_orders_vcs') refresh();
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  });
</script>

<section class="card">
  <div class="row" style="justify-content:space-between; align-items:center;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <h2 style="margin:0">{$t('orderLists.title')}</h2>
      <Tooltip text="Click column headers to sort. Click the arrow button to expand order details." />
    </div>
    <div class="row" style="gap:8px; align-items:center">
      {#if isSuperAdmin}
        <button class="tag" on:click={() => (draftFormOpen = true)}>
          {$t('draft.add')}
        </button>
      {/if}
      {#if isAdmin}
        <button class="tag" on:click={() => (formOpen = true)}>
          {$t('orderLists.new')}
        </button>
      {/if}
      <div style="width:280px">
        <Input bind:value={q} placeholder={$t('orderLists.filter_placeholder')} ariaLabel={$t('orderLists.filter_label')} />
      </div>
    </div>
  </div>
  <div style="margin-top:12px">
    <div class="rf-scroll" style="max-height:60vh">
      <table class="rf-table orders-table">
        <thead>
          <tr>
            <th style="width:40px"></th>
            <th style="width:120px">
              <button class="tag ghost" data-sort={sortKey === 'id' ? (sortAsc ? 'asc' : 'desc') : ''} on:click={() => toggleSort('id')}>
                {$t('orderLists.headers.po')}
              </button>
            </th>
            <th style="width:140px">
              <button class="tag ghost" data-sort={sortKey === 'client' ? (sortAsc ? 'asc' : 'desc') : ''} on:click={() => toggleSort('client')}>
                {$t('orderLists.headers.client')}
              </button>
            </th>
            <th>
              <button class="tag ghost" data-sort={sortKey === 'title' ? (sortAsc ? 'asc' : 'desc') : ''} on:click={() => toggleSort('title')}>
                {$t('orderLists.headers.title')}
              </button>
            </th>
            <th style="width:110px">
              <button class="tag ghost" data-sort={sortKey === 'loadingDate' ? (sortAsc ? 'asc' : 'desc') : ''} on:click={() => toggleSort('loadingDate')}>
                {$t('orderLists.headers.loading')}
              </button>
            </th>
            <th style="width:100px">
              <button class="tag ghost" data-sort={sortKey === 'due' ? (sortAsc ? 'asc' : 'desc') : ''} on:click={() => toggleSort('due')}>
                {$t('orderLists.headers.due')}
              </button>
            </th>
            <th style="width:240px">{$t('orderLists.headers.badges')}</th>
          </tr>
        </thead>
        <tbody>
          {#each visible as row (row.id)}
            <tr class="order-row rowi" class:expanded={row.expanded}>
              <td>
                <button 
                  class="expand-btn" 
                  on:click={() => toggleExpand(row.id)}
                  aria-expanded={row.expanded}
                  aria-label={row.expanded ? 'Collapse' : 'Expand'}>
                  {row.expanded ? '▼' : '▶'}
                </button>
              </td>
              <td>
                <a 
                  href={row.href} 
                  class="order-link"
                  draggable="true"
                  on:dragstart={(e) => {
                    e.dataTransfer?.setData('text/plain', row.id);
                    dragging.set({ type: 'po', po: row.id });
                  }}
                  on:dragend={() => dragging.set(null)}
                  aria-grabbed="true"
                  aria-label={`Drag ${row.id} to a loading day`}>
                  {row.id}
                </a>
              </td>
              <td>{row.client}</td>
              <td>{row.title}</td>
              <td>{row.loadingDate ? row.loadingDate : '—'}</td>
              <td>{row.due}</td>
              <td>
                <div class="badges-cell">
                  {#if row.badges.length}
                    {#each row.badges as badge}
                      {@const label = badgeLabel(badge)}
                      <Badge tone={badgeTone(badge)} label={label}>
                        <svelte:component this={BADGE_ICONS[badge]} size={14} aria-hidden="true" />
                        <span class="badge-text">{label}</span>
                      </Badge>
                    {/each}
                  {:else}
                    <span class="muted">{$t('orderLists.no_badges')}</span>
                  {/if}
                </div>
              </td>
            </tr>
            {#if row.expanded}
              <tr class="expanded-row">
                <td colspan="7">
                  <div class="expanded-content">
                    <div class="expanded-section">
                      <h4>{$t('orderLists.headers.stages')}</h4>
                      <div class="stages-grid">
                        {#each row.stages.slice(0, 6) as [station, state]}
                          <div class="stage-item">
                            <span class="tag stage-tag" data-tone={STATE_LABEL[state] !== 'COMPLETED' ? 'primary' : 'success'}>
                              <strong>{stationLabel(station)}</strong>
                              <span class="muted"> · </span>
                              {$t(STATE_LABEL[state])}
                            </span>
                          </div>
                        {/each}
                      </div>
                    </div>
                    {#if row.badges.length > 0}
                      <div class="expanded-section">
                        <h4>{$t('orderLists.headers.all_badges')}</h4>
                        <div class="badges-expanded">
                          {#each row.badges as badge}
                            {@const label = badgeLabel(badge)}
                            <Badge tone={badgeTone(badge)} label={label}>
                              <svelte:component this={BADGE_ICONS[badge]} size={14} aria-hidden="true" />
                              <span>{label}</span>
                            </Badge>
                          {/each}
                        </div>
                      </div>
                    {/if}
                    <div class="expanded-actions">
                      <a href={row.href} class="tag">View Details →</a>
                    </div>
                  </div>
                </td>
              </tr>
            {/if}
          {/each}
          {#if visible.length === 0}
            <tr><td colspan="7" class="muted">{$t('orderLists.empty')}</td></tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</section>

<OrderForm bind:open={formOpen} onClose={() => { formOpen = false; refresh(); }} />
<DraftOrderForm bind:open={draftFormOpen} onClose={() => { draftFormOpen = false; refresh(); }} />

<style>
  .orders-table :global(th.sortable) {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
  }

  .orders-table :global(th.sortable:hover) {
    background-color: color-mix(in oklab, var(--bg-1) 95%, var(--text));
  }

  .order-row {
    transition: background-color 0.15s ease;
  }

  .order-row:hover {
    background-color: color-mix(in oklab, var(--bg-1) 95%, var(--text));
  }

  .order-row.expanded {
    background-color: color-mix(in oklab, var(--accent-1) 10%, transparent);
  }

  .expand-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    padding: 4px 8px;
    color: var(--text);
    transition: transform 0.2s ease;
  }

  .expand-btn:hover {
    background-color: color-mix(in oklab, var(--bg-1) 85%, var(--text));
    border-radius: 4px;
  }

  .order-link {
    color: var(--accent-1);
    text-decoration: none;
    font-weight: 600;
  }

  .order-link:hover {
    text-decoration: underline;
  }

  .badges-cell {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
  }

  .badge-text {
    display: none;
    font-size: 0.75rem;
  }
  
  /* Show badge text on wider screens */
  @media (min-width: 1024px) {
    .badge-text {
      display: inline;
    }
  }
  
  /* Scale down table font sizes for better fit */
  .orders-table {
    font-size: 0.9rem;
  }
  
  .orders-table td,
  .orders-table th {
    padding: 8px;
  }

  .expanded-row {
    background-color: color-mix(in oklab, var(--bg-2) 50%, transparent);
  }

  .expanded-content {
    padding: 16px;
    display: grid;
    gap: 16px;
  }

  .expanded-section {
    display: grid;
    gap: 8px;
  }

  .expanded-section h4 {
    margin: 0;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted);
  }

  .stages-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 8px;
  }

  .stage-item {
    display: flex;
  }

  .stage-tag {
    width: 100%;
  }

  .badges-expanded {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .expanded-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid var(--border);
  }
</style>
