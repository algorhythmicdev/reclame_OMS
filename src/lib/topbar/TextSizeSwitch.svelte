<script>
  import Type from 'lucide-svelte/icons/type';
  const browser = typeof window !== 'undefined';
  let v = browser ? localStorage.getItem('rf_text') || 'md' : 'md'; // sm/md/lg/xl
  const map={sm:'0.95', md:'1', lg:'1.1', xl:'1.25'};
  function set(t){
    v=t;
    if (!browser) return;
    document.documentElement.style.setProperty('--text-zoom', map[t]);
    localStorage.setItem('rf_text',t);
  }
  $: if (browser && !document.documentElement.style.getPropertyValue('--text-zoom')) set(v);
</script>
<div class="menu">
  <button class="icon" aria-haspopup="menu" aria-expanded="false" aria-label="Text size"><Type aria-hidden="true"/></button>
  <div class="dropdown" role="menu">
    <button role="menuitem" on:click={()=>set('sm')}>Small</button>
    <button role="menuitem" on:click={()=>set('md')}>Medium</button>
    <button role="menuitem" on:click={()=>set('lg')}>Large</button>
    <button role="menuitem" on:click={()=>set('xl')}>X-Large</button>
  </div>
</div>
