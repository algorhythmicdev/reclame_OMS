<script>
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  let theme = 'dark';
  onMount(()=>{
    const saved = localStorage.getItem('rf_theme');
    if(saved) theme = saved;
    document.documentElement.setAttribute('data-theme', theme);
  });
  function setTheme(t){
    theme = t;
    localStorage.setItem('rf_theme', t);
    document.documentElement.setAttribute('data-theme', t);
  }
</script>

<link rel="stylesheet" href="/brand.css" />

<div style="display:flex;min-height:100vh">
  <aside class="sidebar" style="width:280px;padding:20px;background:var(--bg-1);border-right:1px solid rgba(255,255,255,.08)">
    <div class="row" style="justify-content:space-between">
      <div>
        <div style="font-weight:900;font-size:1.1rem;letter-spacing:.2px">Reclame&nbsp;Fabriek</div>
        <div class="muted" style="font-size:.8rem">Production Console</div>
      </div>
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,var(--brand-magenta),var(--brand-cyan))"></div>
    </div>

    <nav style="margin-top:24px;display:grid;gap:8px">
      <a href="/" class:active={$page.url.pathname==='/' }>🏠 Dashboard</a>
      <a href="/calendar" class:active={$page.url.pathname.startsWith('/calendar')}>🗓️ Calendar</a>
      <a href="/orders" class:active={$page.url.pathname.startsWith('/orders')}>📦 Orders</a>
      <a href="/files" class:active={$page.url.pathname.startsWith('/files')}>📁 Files</a>
      <a href="/chat" class:active={$page.url.pathname.startsWith('/chat')}>💬 Chat</a>
      <a href="/inventory" class:active={$page.url.pathname.startsWith('/inventory')}>📦 Inventory</a>
      <a href="/settings" class:active={$page.url.pathname.startsWith('/settings')}>⚙️ Settings</a>
    </nav>

    <div style="margin-top:auto">
      <div class="muted" style="font-size:.8rem;margin-bottom:8px">Theme</div>
      <div class="row">
        <button class="tag" on:click={()=>setTheme('light')}>Light</button>
        <button class="tag" on:click={()=>setTheme('dark')}>Dark</button>
        <button class="tag" on:click={()=>setTheme('hc')}>High Contrast</button>
      </div>
      <div class="muted" style="margin-top:12px;font-size:.8rem">© Reclame Fabriek</div>
    </div>
  </aside>

  <div style="flex:1;display:flex;flex-direction:column">
    <header style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid rgba(255,255,255,.08);background:linear-gradient(90deg,rgba(255,45,149,.1),rgba(111,60,255,.1),rgba(0,229,255,.1))">
      <div class="row">
        <div style="font-weight:800">Reclame Fabriek — Smart Workflow</div>
        <span class="tag">WCAG 2.2</span>
      </div>
      <div class="row">
        <a class="tag" href="/chat">🔔 <span id="notif-count">3</span></a>
        <a class="tag" href="/chat">💬 1</a>
        <a class="tag" href="https://t.me" target="_blank" rel="noreferrer">Telegram</a>
      </div>
    </header>
    <main style="padding:20px;flex:1">
      <slot />
    </main>
  </div>
</div>
