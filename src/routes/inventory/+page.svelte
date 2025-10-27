<script>
  import { t } from 'svelte-i18n';

  let items = [
    { sku: 'ALU-3MM', name: 'Aluminum sheet 3mm', qty: 22, min: 20 },
    { sku: 'ACP-3MM', name: 'ACP 3mm', qty: 58, min: 30 },
    { sku: 'ACR-3MM', name: 'Acrylic 3mm white', qty: 12, min: 25 }
  ];
  $: status = items.map((i) => ({ ...i, ok: i.qty >= i.min }));
</script>

<section class="card">
  <div class="row" style="justify-content:space-between">
    <h2 style="margin:0">{$t('inventory.title')}</h2>
    <button class="tag" disabled>{$t('inventory.add')}</button>
  </div>
  <div class="grid" style="margin-top:12px">
    {#each status as i}
      <div class="card" style="background:var(--bg-2)">
        <div class="row" style="justify-content:space-between">
          <div><b>{i.sku}</b> — {i.name}</div>
          <div class="row" style="gap:6px">
            <span class="tag">{$t('inventory.qty')} {i.qty}</span>
            <span class="tag">{$t('inventory.min')} {i.min}</span>
            <span class="tag" class:badge-ok={i.ok} class:badge-danger={!i.ok}>
              {i.ok ? $t('inventory.ok') : $t('inventory.low')}
            </span>
          </div>
        </div>
      </div>
    {/each}
  </div>
</section>
