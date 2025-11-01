<script>
  import Languages from 'lucide-svelte/icons/languages';
  import { setLocale, locale } from '$lib/i18n';
  import { onMount } from 'svelte';
  
  let v = 'en';
  const langs=[{id:'en',label:'EN'},{id:'ru',label:'RU'},{id:'lv',label:'LV'}];
  
  onMount(() => {
    // Subscribe to locale to keep v in sync
    const unsubscribe = locale.subscribe(val => {
      if (val) v = val;
    });
    return unsubscribe;
  });
  
  function set(id){
    setLocale(id);
  }
</script>
<div class="menu">
  <button class="icon" aria-haspopup="menu" aria-expanded="false" aria-label="Language"><Languages aria-hidden="true"/><span class="badge">{v.toUpperCase()}</span></button>
  <div class="dropdown" role="menu">
    {#each langs as l}<button role="menuitem" on:click={()=>set(l.id)}>{l.label}</button>{/each}
  </div>
</div>
