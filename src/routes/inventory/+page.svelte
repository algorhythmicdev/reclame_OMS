<script lang="ts">
  import { items, lowStock } from '$lib/inventory/store';
  import type { Item } from '$lib/inventory/types';
  import { base } from '$app/paths';
  import { t } from 'svelte-i18n';
  import { onDestroy } from 'svelte';

  let q = '';
  let list: Item[] = [];
  let low: Item[] = [];

  const unsubItems = items.subscribe((value) => (list = value));
  const unsubLow = lowStock.subscribe((value) => (low = value));

  onDestroy(() => {
    unsubItems?.();
    unsubLow?.();
  });

  $: filtered = list.filter((it) =>
    [it.sku, it.name, it.category, it.location, it.colorCode]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q.toLowerCase())
  );
</script>

<section class="card">
  <div class="row" style="justify-content:space-between;align-items:end">
    <div style="flex:1;min-width:220px">
      <label class="muted" for="inventory-search">{$t('inventory.search')}</label>
      <input
        id="inventory-search"
        class="rf-input"
        bind:value={q}
        placeholder={$t('inventory.search_placeholder')}
        type="search"
      />
    </div>
    <div class="row">
      <a class="tag" href={`${base}/inventory/new`}>{$t('inventory.add_item')}</a>
      <a class="tag" href={`${base}/inventory/movements`}>{$t('inventory.movements')}</a>
    </div>
  </div>
</section>

{#if low.length}
  <section class="card">
    <strong>{$t('inventory.low_stock')}</strong>
    <div class="row" style="flex-wrap:wrap;gap:8px">
      {#each low as it}
        <span class="tag" title={$t('inventory.minimum_label', { value: it.min })}>
          {it.sku}: {it.stock} {it.unit}
        </span>
      {/each}
    </div>
  </section>
{/if}

<section class="card">
  <header class="row" style="justify-content:space-between;align-items:center;margin-bottom:12px">
    <h1 style="margin:0">{$t('inventory.title')}</h1>
    <span class="muted">{$t('inventory.count', { count: filtered.length })}</span>
  </header>
  <div class="table-wrap">
    <table class="rf-table">
      <thead>
        <tr>
          <th scope="col">{$t('inventory.headers.sku')}</th>
          <th scope="col">{$t('inventory.headers.name')}</th>
          <th scope="col">{$t('inventory.headers.category')}</th>
          <th scope="col">{$t('inventory.headers.unit')}</th>
          <th scope="col">{$t('inventory.headers.stock')}</th>
          <th scope="col">{$t('inventory.headers.minimum')}</th>
          <th scope="col">{$t('inventory.headers.location')}</th>
          <th scope="col">{$t('inventory.headers.updated')}</th>
        </tr>
      </thead>
      <tbody>
        {#each filtered as it}
          <tr>
            <td data-label={$t('inventory.headers.sku')}>
              <a href={`${base}/inventory/${it.id}`} class="link">{it.sku}</a>
            </td>
            <td data-label={$t('inventory.headers.name')}>{it.name}</td>
            <td data-label={$t('inventory.headers.category')}>{it.category}</td>
            <td data-label={$t('inventory.headers.unit')}>{it.unit}</td>
            <td data-label={$t('inventory.headers.stock')}>{it.stock}</td>
            <td data-label={$t('inventory.headers.minimum')}>{it.min}</td>
            <td data-label={$t('inventory.headers.location')}>{it.location}</td>
            <td data-label={$t('inventory.headers.updated')} class="muted">
              {new Date(it.updatedAt).toLocaleString()}
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
</section>

<style>
.table-wrap{overflow:auto}
.rf-table thead th{position:sticky;top:0;background:var(--bg-1);z-index:1}
.rf-table thead th:first-child{left:0}
.link{color:inherit;text-decoration:underline}
</style>
