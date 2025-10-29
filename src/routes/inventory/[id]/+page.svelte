<script lang="ts">
  import { items, move } from '$lib/inventory/store';
  import type { Item } from '$lib/inventory/types';
  import { onDestroy } from 'svelte';
  import { base } from '$app/paths';
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { t } from 'svelte-i18n';

  export let params: { id: string };

  let item: Item | undefined;
  const unsubscribe = items.subscribe((list) => {
    item = list.find((x) => x.id === params.id);
  });

  onDestroy(() => unsubscribe?.());

  $: if (!item && browser) {
    goto(`${base}/inventory`);
  }

  function adjust(kind: 'IN' | 'OUT') {
    if (!item) return;
    const promptLabel = kind === 'IN' ? $t('inventory.prompt.add') : $t('inventory.prompt.consume');
    const value = Number(prompt(promptLabel, '1'));
    if (!Number.isFinite(value) || value <= 0) return;
    move(item.id, kind, value);
  }
</script>

{#if item}
  <section class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">
    <div class="card">
      <h2 style="margin:0 0 8px 0">{item.sku} — {item.name}</h2>
      <div class="row" style="flex-wrap:wrap;gap:8px">
        <span class="tag">{item.category}</span>
        <span class="tag">{item.unit}</span>
        {#if item.vendor}<span class="tag">{$t('inventory.labels.vendor')}: {item.vendor}</span>{/if}
      </div>
      {#if item.colorCode}
        <div class="row" style="margin-top:8px">
          <span class="tag">{$t('inventory.labels.color')}: {item.colorCode}</span>
        </div>
      {/if}
      {#if item.thicknessMM}
        <div class="row" style="margin-top:8px">
          <span class="tag">{$t('inventory.labels.thickness')}: {item.thicknessMM} mm</span>
        </div>
      {/if}
      {#if item.leftover}
        <div class="row" style="margin-top:8px;flex-wrap:wrap;gap:8px">
          <span class="tag">
            {$t('inventory.labels.offcut')}: {item.leftover.lengthMM ?? '–'}×{item.leftover.widthMM ?? '–'}×{item.leftover.heightMM ?? '–'} mm
          </span>
          {#if item.leftover.bin}
            <span class="tag">{$t('inventory.labels.bin')}: {item.leftover.bin}</span>
          {/if}
          {#if item.leftover.weightKG}
            <span class="tag">{$t('inventory.labels.weight')}: {item.leftover.weightKG} kg</span>
          {/if}
        </div>
      {/if}
      {#if item.note}
        <p class="muted" style="margin-top:12px">{item.note}</p>
      {/if}
    </div>

    <div class="card">
      <strong>{$t('inventory.labels.stock')}</strong>
      <div class="row" style="flex-wrap:wrap;gap:8px;margin-top:8px">
        <span class="tag">{$t('inventory.labels.on_hand')}: {item.stock} {item.unit}</span>
        <span class="tag">{$t('inventory.labels.min')}: {item.min}</span>
        {#if item.location}
          <span class="tag">{$t('inventory.labels.location')}: {item.location}</span>
        {/if}
        <span class="tag">{$t('inventory.labels.updated')}: {new Date(item.updatedAt).toLocaleString()}</span>
      </div>
      <div class="row" style="margin-top:12px;gap:8px">
        <button class="tag" type="button" on:click={() => adjust('IN')}>{$t('inventory.actions.add')}</button>
        <button class="tag" type="button" on:click={() => adjust('OUT')}>{$t('inventory.actions.consume')}</button>
        <a class="tag" href={`${base}/inventory`}>{$t('inventory.actions.back')}</a>
      </div>
    </div>
  </section>
{/if}
