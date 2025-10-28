<script lang="ts">
  import { assets, base } from '$app/paths';
  import { onMount } from 'svelte';
  import Input from '$lib/ui/Input.svelte';
  import type { Order, Station, Badge as BadgeCode } from '$lib/order/types';
  import { listOrders, createOrder } from '$lib/order/signage-store';
  import OrderForm from '$lib/order/OrderForm.svelte';
  import { blankStages, STATE_LABEL, type StageState } from '$lib/order/stages';
  import { TERMS } from '$lib/order/names';
  import { t } from 'svelte-i18n';
  import { ORDER_SEEDS } from '$lib/order/order-seeds';
  import { BADGE_ICONS, badgeTone } from '$lib/order/badges';
  import Badge from '$lib/ui/Badge.svelte';

  type OrderRow = {
    id: string;
    client: string;
    title: string;
    stages: [Station, StageState][];
    due: string;
    loadingDate: string;
    badges: BadgeCode[];
    href: string;
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
      href: `${base}/orders/${order.id}`
    };
  }

  let rows: OrderRow[] = [];
  let q = '';
  let formOpen = false;
  let visible: OrderRow[] = [];
  let qLower = '';

  $: qLower = q.trim().toLowerCase();
  $: visible = qLower
    ? rows.filter((row) =>
        `${row.id} ${row.client} ${row.title}`.toLowerCase().includes(qLower)
      )
    : rows;

  function refresh() {
    rows = listOrders()
      .map(toRow)
      .sort((a, b) => a.due.localeCompare(b.due));
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
  <div class="row" style="justify-content:space-between">
    <h2 style="margin:0">{$t('orderLists.title')}</h2>
    <div class="row" style="gap:8px; align-items:center">
      <button class="tag" on:click={() => (formOpen = true)}>{$t('orderLists.new')}</button>
      <div style="width:280px">
        <Input bind:value={q} placeholder={$t('orderLists.filter_placeholder')} ariaLabel={$t('orderLists.filter_label')} />
      </div>
    </div>
  </div>
  <div style="margin-top:12px">
    <div class="rf-scroll" style="max-height:60vh">
      <table class="rf-table">
        <thead>
          <tr>
            <th style="width:140px">{$t('orderLists.headers.po')}</th>
            <th>{$t('orderLists.headers.client')}</th>
            <th>{$t('orderLists.headers.title')}</th>
            <th style="width:140px">{$t('orderLists.headers.loading')}</th>
            <th style="width:120px">{$t('orderLists.headers.due')}</th>
            <th style="width:260px">{$t('orderLists.headers.summary')}</th>
          </tr>
        </thead>
        <tbody>
          {#each visible as row (row.id)}
            <tr>
              <td><a href={row.href}>{row.id}</a></td>
              <td>{row.client}</td>
              <td>{row.title}</td>
              <td>{row.loadingDate ? row.loadingDate : '—'}</td>
              <td>{row.due}</td>
              <td>
                <div class="order-meta">
                  <div class="row" style="flex-wrap:wrap;gap:6px">
                    {#each row.stages.slice(0,3) as [station, state]}
                      <span class="tag">
                        <strong>{stationLabel(station)}</strong> · {$t(STATE_LABEL[state])}
                      </span>
                    {/each}
                  </div>
                  <div class="badges">
                    {#if row.badges.length}
                      {#each row.badges as badge}
                        {@const label = badgeLabel(badge)}
                        <Badge tone={badgeTone(badge)} label={label}>
                          <svelte:component this={BADGE_ICONS[badge]} size={14} aria-hidden="true" />
                          <span>{label}</span>
                        </Badge>
                      {/each}
                    {:else}
                      <span class="muted">{$t('orderLists.no_badges')}</span>
                    {/if}
                  </div>
                </div>
              </td>
            </tr>
          {/each}
          {#if visible.length === 0}
            <tr><td colspan="5" class="muted">{$t('orderLists.empty')}</td></tr>
          {/if}
        </tbody>
      </table>
    </div>
  </div>
</section>

<OrderForm bind:open={formOpen} onClose={() => { formOpen = false; refresh(); }} />

<style>
  .order-meta {
    display: grid;
    gap: 6px;
  }

  .order-meta .badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    align-items: center;
  }
</style>
