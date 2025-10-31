<script lang="ts">
  import { onMount } from 'svelte';
  
  const opts = ['compact','cozy','comfortable'];
  let v = 'cozy';
  
  onMount(() => {
    const stored = localStorage.getItem('rf_density');
    if (stored && opts.includes(stored)) {
      v = stored;
    }
    document.documentElement.dataset.density = v;
  });
  
  function set(d: string) { 
    v = d; 
    document.documentElement.dataset.density = d; 
    localStorage.setItem('rf_density', d); 
  }
</script>

<div class="menu">
  <button class="icon" aria-haspopup="menu" aria-expanded="false" title="Density">T</button>
  <div class="dropdown" role="menu">
    {#each opts as d}
      <button role="menuitem" aria-pressed={v===d} on:click={()=>set(d)}>
        {d.charAt(0).toUpperCase() + d.slice(1)}
      </button>
    {/each}
  </div>
</div>
