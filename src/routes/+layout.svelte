<script>
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { Home, Rocket, Calendar, PackageSearch, Folder, MessagesSquare, Boxes, Settings } from 'lucide-svelte';
  let theme='dark';
  const links=[{href:'/',label:'Dashboard',icon:Home},{href:'/launchpad',label:'Launchpad',icon:Rocket},{href:'/calendar',label:'Calendar',icon:Calendar},{href:'/orders',label:'Orders',icon:PackageSearch},{href:'/files',label:'Files',icon:Folder},{href:'/chat',label:'Chat',icon:MessagesSquare},{href:'/inventory',label:'Inventory',icon:Boxes},{href:'/settings',label:'Settings',icon:Settings}];
  if(typeof window!=='undefined'){const s=localStorage.getItem('rf_theme'); if(s) theme=s; document.documentElement.setAttribute('data-theme',theme);}
  const setTheme=(t)=>{theme=t;localStorage.setItem('rf_theme',t);document.documentElement.setAttribute('data-theme',t);}
</script>
<link rel="stylesheet" href="{base}/brand.css" />
<a href="#main" class="tag" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to content</a>
<div style="display:flex;min-height:100vh">
  <aside class="sidebar" style="width:300px;padding:20px;background:var(--bg-1);border-right:1px solid rgba(255,255,255,.08)">
    <div class="row" style="justify-content:space-between">
      <div class="row">
        <img src="{base}/brand/logo.png" alt="Reclame Fabriek logo" style="width:44px;height:44px;border-radius:10px;object-fit:contain;background:#fff" />
        <div><div style="font-weight:900">Reclame Fabriek</div><div class="muted" style="font-size:.8rem">Production Console</div></div>
      </div>
      <div class="tag" style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--brand-magenta),var(--brand-cyan))"></div>
    </div>
    <nav style="margin-top:24px;display:grid;gap:6px" aria-label="Primary">
      {#each links as L}
        <a href={L.href} class:active={$page.url.pathname===L.href || ($page.url.pathname.startsWith(L.href) && L.href!=='/')}>
          <svelte:component this={L.icon} size={18} /> {L.label}
        </a>
      {/each}
    </nav>
    <div style="margin-top:auto">
      <div class="muted" style="font-size:.8rem;margin-bottom:8px">Theme</div>
      <div class="row"><button class="tag" on:click={()=>setTheme('light')}>Light</button><button class="tag" on:click={()=>setTheme('dark')}>Dark</button><button class="tag" on:click={()=>setTheme('hc')}>High Contrast</button></div>
      <div class="muted" style="margin-top:12px;font-size:.8rem">© Reclame Fabriek</div>
    </div>
  </aside>
  <div style="flex:1;display:flex;flex-direction:column">
    <header style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(90deg,rgba(255,45,149,.08),rgba(111,60,255,.08),rgba(0,229,255,.08))">
      <div class="row"><div style="font-weight:800">Smart Workflow</div><span class="tag">WCAG 2.2</span></div>
      <div class="row"><a class="tag" href="/chat">🔔 3</a><a class="tag" href="/chat">💬 1</a><a class="tag" href="https://t.me" target="_blank" rel="noreferrer">Telegram</a></div>
    </header>
    <main id="main" style="padding:20px;flex:1"><slot /></main>
  </div>
</div>
