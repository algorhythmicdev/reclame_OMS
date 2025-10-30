<script>
  import Languages from 'lucide-svelte/icons/languages';
  const browser = typeof window !== 'undefined';
  let v = browser ? localStorage.getItem('rf_lang') || 'en' : 'en';
  const langs=[{id:'en',label:'EN'},{id:'ru',label:'RU'},{id:'lv',label:'LV'}];
  function set(id){
    v=id;
    if (!browser) return;
    document.documentElement.lang=id;
    localStorage.setItem('rf_lang',id);
  }
  $: if (browser && !document.documentElement.lang) set(v);
</script>
<div class="menu">
  <button class="icon" aria-haspopup="menu" aria-expanded="false" aria-label="Language"><Languages aria-hidden="true"/><span class="badge">{v.toUpperCase()}</span></button>
  <div class="dropdown" role="menu">
    {#each langs as l}<button role="menuitem" on:click={()=>set(l.id)}>{l.label}</button>{/each}
  </div>
</div>
