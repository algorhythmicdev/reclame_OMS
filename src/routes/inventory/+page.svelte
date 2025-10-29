<script lang="ts">
  import { items, lowStock, createItem, updateItem, removeItem } from '$lib/inventory/store';
  import type { Item, Section } from '$lib/inventory/types';
  import { base } from '$app/paths';
  import { t } from 'svelte-i18n';
  import { onDestroy } from 'svelte';
  import { toCSV, downloadCSV } from '$lib/inventory/export';
  import Tabs from '$lib/ui/Tabs.svelte';
  import Plus from 'lucide-svelte/icons/plus';
  import Edit from 'lucide-svelte/icons/pencil';
  import Trash from 'lucide-svelte/icons/trash-2';

  let q = '';
  let list: Item[] = [];
  let low: Item[] = [];

  const unsubItems = items.subscribe((value) => (list = value));
  const unsubLow = lowStock.subscribe((value) => (low = value));

  onDestroy(() => {
    unsubItems?.();
    unsubLow?.();
  });

  const tabs = [
    {id:'materials', label: $t('inventory.materials')},
    {id:'leftovers', label: $t('inventory.leftovers')},
    {id:'paints', label: $t('inventory.paints')},
    {id:'tools', label: $t('inventory.tools')},
    {id:'cons', label: $t('inventory.consumables')}
  ];
  
  let currentTab: Section = 'materials';
  
  function handleTabChange(id: string) {
    currentTab = id as Section;
  }
  
  function sect(id: Section): Item[] {
    return list.filter(i => (i.section || 'materials') === id);
  }
  
  function groups(id: Section) {
    const sectionItems = sect(id);
    const uniqueGroups = Array.from(new Set(sectionItems.map(i => i.group || 'General')));
    return uniqueGroups.map(g => ({id: `${id}-${g}`, title: g}));
  }
  
  function handleCreateItem(section: Section, group: string) {
    createItem({ section, group });
  }

  $: filtered = list.filter((it) =>
    [it.sku, it.name, it.category, it.location, it.colorCode]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(q.toLowerCase())
  );

  function exportCSV(){ downloadCSV(`inventory-${new Date().toISOString().slice(0,10)}.csv`, toCSV(list)); }
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
      <button class="tag" on:click={exportCSV}>Export CSV</button>
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
  
  <Tabs tabs={tabs} active={currentTab} onChange={handleTabChange} />
  
  <div style="margin-top:16px">
    {#each groups(currentTab) as g}
      <div class="group-section">
        <div class="row" style="justify-content:space-between;align-items:center;margin-bottom:8px">
          <h3 class="group-title">{g.title}</h3>
          <button class="tag" on:click={()=>handleCreateItem(currentTab, g.title)}>
            <Plus size={14} aria-hidden="true"/> {$t('inventory.add')}
          </button>
        </div>
        <div class="table-wrap">
          <table class="rf-table">
            <thead>
              <tr>
                <th scope="col">{$t('inventory.headers.sku')}</th>
                <th scope="col">{$t('inventory.headers.name')}</th>
                <th scope="col">{$t('inventory.headers.unit')}</th>
                <th scope="col">{$t('inventory.headers.stock')}</th>
                <th scope="col">{$t('inventory.headers.minimum')}</th>
                <th scope="col">{$t('inventory.headers.location')}</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {#each sect(currentTab).filter(i=> (i.group||'General')===g.title) as it (it.id)}
                <tr>
                  <td data-label={$t('inventory.headers.sku')}>
                    <a href={`${base}/inventory/${it.id}`} class="link">{it.sku}</a>
                  </td>
                  <td data-label={$t('inventory.headers.name')}>{it.name}</td>
                  <td data-label={$t('inventory.headers.unit')}>{it.unit}</td>
                  <td data-label={$t('inventory.headers.stock')}>{it.stock}</td>
                  <td data-label={$t('inventory.headers.minimum')}>{it.min}</td>
                  <td data-label={$t('inventory.headers.location')}>{it.location}</td>
                  <td class="row" style="gap:6px">
                    <a href={`${base}/inventory/${it.id}`} class="icon" aria-label={`Edit ${it.name}`}>
                      <Edit size={16} aria-hidden="true"/>
                    </a>
                    <button class="icon warn" aria-label={`Delete ${it.name}`} on:click={()=>{ if(confirm(`Delete ${it.name}?`)) removeItem(it.id); }}>
                      <Trash size={16} aria-hidden="true"/>
                    </button>
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/each}
  </div>
</section>

<style>
.table-wrap{overflow:auto}
.rf-table thead th{position:sticky;top:0;background:var(--bg-1);z-index:1}
.rf-table thead th:first-child{left:0}
.link{color:inherit;text-decoration:underline}
.icon{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  padding:4px;
  border-radius:6px;
  border:1px solid var(--border);
  background:var(--bg-0);
  color:var(--text);
  cursor:pointer;
  text-decoration:none;
}
.icon:hover{
  background:var(--bg-2);
}
.icon.warn{
  color:var(--danger);
  border-color:var(--danger);
}
.group-section{
  margin-bottom:24px;
  padding-bottom:16px;
  border-bottom:1px solid var(--border);
}
.group-section:last-child{
  border-bottom:none;
}
.group-title{
  margin:0;
  font-size:1.1rem;
}
</style>
