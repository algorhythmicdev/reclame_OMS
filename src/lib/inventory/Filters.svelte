<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  const d = createEventDispatcher();
  export let query=''; 
  export let section='all'; 
  export let group=''; 
  export let subgroup='';
  
  const FILTER_SECTIONS = ['all', 'materials', 'leftovers', 'paints', 'tools', 'cons'];
  
  function fire(){ 
    d('change',{ query, section, group, subgroup }); 
  }
</script>

<div class="row" style="align-items:center">
  <div class="row" role="tablist" aria-label="Sections">
    {#each FILTER_SECTIONS as s}
      <button role="tab" class="tag ghost" aria-selected={section===s} on:click={()=>{section=s;fire();}}>{s}</button>
    {/each}
  </div>
  <input style="min-width:260px" placeholder="Search by name/SKU…" bind:value={query} on:input={fire} aria-label="Search">
  <input placeholder="Group…" bind:value={group} on:input={fire} aria-label="Group">
  <input placeholder="Subgroup…" bind:value={subgroup} on:input={fire} aria-label="Subgroup">
</div>
