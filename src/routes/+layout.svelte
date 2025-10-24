<script lang="ts">
  import { onMount } from 'svelte';
  import CommandPalette from '$lib/ui/CommandPalette.svelte';
  let palette = false;
  import { page } from '$app/stores';
  import { base } from '$app/paths';
  import { Home, Rocket, Calendar, PackageSearch, Folder, MessagesSquare, Boxes, Settings, LayoutGrid } from 'lucide-svelte';
  import Button from '$lib/ui/Button.svelte';
  import { toasts } from '$lib/stores/toast';
  import Toaster from '$lib/ui/Toaster.svelte';
  import { theme } from '$lib/stores/theme';
  let showNotif = false;
  let showSidebar = true; // toggle for small screens
  const links=[{href:'/',label:'Dashboard',icon:Home},{href:'/launchpad',label:'Launchpad',icon:Rocket},{href:'/calendar',label:'Calendar',icon:Calendar},{href:'/orders',label:'Orders',icon:PackageSearch},{href:'/kanban',label:'Kanban',icon:LayoutGrid},{href:'/files',label:'Files',icon:Folder},{href:'/chat',label:'Chat',icon:MessagesSquare},{href:'/inventory',label:'Inventory',icon:Boxes},{href:'/settings',label:'Settings',icon:Settings}];
  let logoFailed=true;
  let logoSrc='';
  onMount(async()=>{
    const url=`${base}/brand/logo.png`;
    try{
      const res=await fetch(url,{method:'HEAD'});
      if(res.ok){
        logoSrc=url;
        logoFailed=false;
      }
    }catch(e){
      logoFailed=true;
    }

    const h = (e: KeyboardEvent) => {
      const isK = e.key.toLowerCase() === 'k';
      if ((e.metaKey || e.ctrlKey) && isK) { e.preventDefault(); palette = true; }
      if (e.key === 'Escape') palette = false;
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
</script>
<link rel="stylesheet" href="{base}/brand.css" />
<a href="#main" class="tag" style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">Skip to content</a>
<div style="display:flex;min-height:100vh">
  <aside class="sidebar" data-open={showSidebar} style="width:300px;padding:20px;background:var(--bg-1);border-right:1px solid rgba(255,255,255,.08)">
    <div class="row" style="justify-content:space-between">
      <div class="row">
        {#if !logoFailed && logoSrc}
          <img src={logoSrc} alt="Reclame Fabriek logo" style="width:44px;height:44px;border-radius:10px;object-fit:contain;background:#fff" />
        {:else}
          <div class="logo-fallback" role="img" aria-label="Reclame Fabriek logo" style="width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:900;background:linear-gradient(135deg,var(--brand-magenta),var(--brand-cyan));color:#000">RF</div>
        {/if}
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
      <div class="row"><button class="tag" on:click={()=>theme.set('light')}>Light</button><button class="tag" on:click={()=>theme.set('dark')}>Dark</button><button class="tag" on:click={()=>theme.set('hc')}>High Contrast</button></div>
      <div class="muted" style="margin-top:12px;font-size:.8rem">© Reclame Fabriek</div>
    </div>
  </aside>
  <div style="flex:1;display:flex;flex-direction:column">
    <header style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(90deg,rgba(255,45,149,.08),rgba(111,60,255,.08),rgba(0,229,255,.08))">
      <div class="row">
        <button class="tag" on:click={()=> showSidebar=!showSidebar} aria-label="Toggle sidebar">☰</button>
        <div style="font-weight:800">Smart Workflow</div>
        <span class="tag">WCAG 2.2</span>
      </div>

      <div class="row" style="position:relative">
        <button class="tag" on:click={()=> showNotif = !showNotif} aria-expanded={showNotif} aria-controls="notif-pop">🔔 3</button>
        <a class="tag" href="/chat" title="Messages">💬 1</a>
        <a class="tag" href="https://t.me" target="_blank" rel="noreferrer">Telegram</a>

        {#if showNotif}
          <div id="notif-pop" class="card" style="position:absolute;right:0;top:42px;min-width:260px;z-index:10">
            <b>Notifications</b>
            <ul style="margin-top:6px">
              <li>✅ CNC finished for PO-250375</li>
              <li>⚠️ Aluminum low in stock</li>
              <li>🗓️ Load date approaching (Oct 26)</li>
            </ul>
            <Button variant="ghost" on:click={() => { toasts.push({ kind:'success', message:'All caught up!' }); showNotif=false; }}>Dismiss</Button>
          </div>
        {/if}
      </div>
    </header>
    <main id="main" style="padding:20px;flex:1"><slot /></main>
  </div>
</div>
<CommandPalette bind:open={palette} onClose={() => palette=false} />
<Toaster />
<style>
@media (max-width: 980px) {
  aside.sidebar{ display: none; }
  aside.sidebar[data-open="true"]{ display:block; position:fixed; inset:0 40% 0 0; z-index:20 }
}
</style>