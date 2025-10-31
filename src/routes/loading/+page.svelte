<script lang="ts">
  import { loads, linkPO, unlinkPO } from '$lib/state/loads';
  import { listOrders } from '$lib/order/signage-store';
  import { t } from 'svelte-i18n';
  
  let loadsList: any[] = [];
  const unsubL = loads.subscribe(v=>loadsList=v);
  let orders = listOrders();
  let selected = loadsList[0]?.id;

  $: current = loadsList.find(l=>l.id===selected);
  $: unassigned = orders.filter(o => !current?.pos.includes(o.id));
  
  function add(po: string){ 
    if(!selected) return; 
    linkPO(selected, po); 
  }
  
  function remove(po: string){ 
    if(!selected) return; 
    unlinkPO(selected, po); 
  }
</script>

<section class="card">
  <div class="row" style="justify-content:space-between;align-items:center">
    <h2>{$t('loading.board') || 'Loading Board'}</h2>
    <select bind:value={selected}>
      {#each loadsList as l}<option value={l.id}>{l.id} — {l.carrier||'carrier n/a'}</option>{/each}
    </select>
  </div>

  {#if current}
  <div class="grid" style="--cols:2">
    <div class="column">
      <h3>Assigned POs</h3>
      <ul class="list">
        {#each current.pos as po}
          <li class="row"><a href="/reclame_OMS/orders/{po}">{po}</a><button class="tag ghost" on:click={()=>remove(po)}>{$t('loading.remove') || 'Remove'}</button></li>
        {/each}
      </ul>
    </div>
    <div class="column">
      <h3>Unassigned</h3>
      <ul class="list">
        {#each unassigned as o}
          <li class="row"><span>{o.id} — {o.client}</span><button class="tag" on:click={()=>add(o.id)}>{$t('loading.assign') || 'Assign'}</button></li>
        {/each}
      </ul>
    </div>
  </div>
  {:else}
    <p class="muted">No loading day selected. Create one from Calendar long-press.</p>
  {/if}
</section>

<style>
.grid {
  display: grid;
  grid-template-columns: repeat(var(--cols, 1), 1fr);
  gap: 16px;
  margin-top: 16px;
}
.list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.list li {
  padding: 8px;
  border-bottom: 1px solid var(--border);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
