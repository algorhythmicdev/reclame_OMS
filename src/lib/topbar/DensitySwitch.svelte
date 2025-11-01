<script lang="ts">
  import { ui } from '$lib/state/ui';
  import { t } from 'svelte-i18n';
  
  let currentUi: any;
  ui.subscribe(v => currentUi = v);
  
  const opts: any[] = [
    {k:'compact',      label: () => $t('ui.density.compact','Compact')},
    {k:'cozy',         label: () => $t('ui.density.cozy','Cozy')},
    {k:'comfortable',  label: () => $t('ui.density.comfortable','Comfortable')}
  ];
  
  function set(k: string) {
    ui.update(p => ({...p, density: k as any}));
  }
</script>

<div class="menu">
  <button class="icon" aria-haspopup="menu" aria-expanded="false" title={$t('ui.density.title','Density')}>D</button>
  <div class="dropdown" role="menu">
    {#each opts as o}
      <button role="menuitem" aria-pressed={currentUi?.density===o.k} on:click={()=>set(o.k)}>{o.label()}</button>
    {/each}
  </div>
</div>
