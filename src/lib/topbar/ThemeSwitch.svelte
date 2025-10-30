<script>
  import Sun from 'lucide-svelte/icons/sun'; import Moon from 'lucide-svelte/icons/moon'; import Contrast from 'lucide-svelte/icons/contrast';
  const browser = typeof window !== 'undefined';
  let v = browser ? localStorage.getItem('rf_theme') || 'LightVim' : 'LightVim';
  function set(t){
    v=t;
    if (!browser) return;
    document.documentElement.dataset.theme=t;
    localStorage.setItem('rf_theme',t);
  }
  $: if (browser && !document.documentElement.dataset.theme) set(v);
</script>
<div class="menu">
  <button class="icon" aria-haspopup="menu" aria-expanded="false" aria-label="Theme"><Contrast aria-hidden="true"/></button>
  <div class="dropdown" role="menu">
    <button role="menuitem" on:click={()=>set('LightVim')}><Sun /> Light</button>
    <button role="menuitem" on:click={()=>set('DarkVim')}><Moon /> Dark</button>
    <button role="menuitem" on:click={()=>set('HighContrast')}>HC</button>
  </div>
</div>
