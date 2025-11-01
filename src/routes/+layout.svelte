<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import Logo from '$lib/brand/Logo.svelte';
  import NotificationsBell from '$lib/topbar/NotificationsBell.svelte';
  import ChatPopover from '$lib/topbar/ChatPopover.svelte';
  import ThemeSwitch from '$lib/topbar/ThemeSwitch.svelte';
  import LangSwitch from '$lib/topbar/LangSwitch.svelte';
  import TextSizeSwitch from '$lib/topbar/TextSizeSwitch.svelte';
  import DensitySwitch from '$lib/topbar/DensitySwitch.svelte';
  import UserSwitch from '$lib/topbar/UserSwitch.svelte';
  import MobileNav from '$lib/topbar/MobileNav.svelte';
  import Toaster from '$lib/ui/Toaster.svelte';
  import LiveRegion from '$lib/ui/LiveRegion.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';
  import { seed } from '$lib/dev/seed';
  import CommandPalette from '$lib/ui/CommandPalette.svelte';
  import Keybindings from '$lib/help/Keybindings.svelte';
  import { t } from 'svelte-i18n';
  import { startPreferenceUrlSync } from '$lib/settings/url-sync';
  import { ui } from '$lib/state/ui';
  import { setLocale } from '$lib/i18n';

  let searchOpen = false;
  let showKb = false;

  const openSearch = () => {
    searchOpen = true;
  };

  const closeSearch = () => {
    searchOpen = false;
  };

  onMount(() => {
    seed(base);
    
    // Apply query params for deep-linking preferences
    const q = new URLSearchParams(location.search);
    const theme   = q.get('theme') as any;
    const density = q.get('density') as any;
    const lang    = q.get('lang');
    const font    = q.get('font');

    if(lang) setLocale(lang);
    ui.update(p=>({
      ...p,
      theme:   theme   || p.theme,
      density: density || p.density,
      fontScale: font ? Math.max(0.85, Math.min(1.3, +font)) : p.fontScale
    }));
    
    const stopPreferenceSync = startPreferenceUrlSync();
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.isContentEditable) return;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const adm = $role === 'Admin';
      const key = e.key?.toLowerCase();
      if (!key) return;
      if ((e.metaKey || e.ctrlKey) && key === 'k') {
        e.preventDefault();
        openSearch();
        return;
      }
      if (key === '?') {
        e.preventDefault();
        showKb = !showKb;
        return;
      }
      if (!e.shiftKey) return;
      if (adm && key === 'a') window.dispatchEvent(new CustomEvent('rf-approve-selected'));
      if (adm && key === 'd') window.dispatchEvent(new CustomEvent('rf-decline-selected'));
      if (adm && key === 'u') window.dispatchEvent(new CustomEvent('rf-attach-revision'));
      if (!adm && key === 'n') window.dispatchEvent(new CustomEvent('rf-open-cr'));
      if (!adm && key === 'l') window.dispatchEvent(new CustomEvent('rf-focus-quicklog'));
    };

    window.addEventListener('keydown', handler);
    return () => {
      stopPreferenceSync?.();
      window.removeEventListener('keydown', handler);
    };
  });

  onMount(async () => {
    if (import.meta.env.DEV) {
      // axe is ~300KB — load only in dev
      const axe = await import('axe-core'); // npm i axe-core -D
      // Check only color contrast + focusable/focus-visible
      axe.default
        .run(document, {
          runOnly: { type: 'rule', values: ['color-contrast', 'focus-order-semantics', 'focus-visible'] }
        })
        .then((results) => {
          if (results.violations.length) {
            console.group('%cA11Y (axe)', 'color:#fff;background:#e11d48;padding:2px 6px;border-radius:4px');
            results.violations.forEach((v) => console.warn(v.id, v.nodes.map((n) => n.target)));
            console.groupEnd();
          }
        });
    }
  });
</script>

<svelte:head>
  <link rel="stylesheet" href={`${base}/brand.css`}>
</svelte:head>

<a href="#main" class="tag" style="position:absolute;left:-9999px;top:-9999px"
  on:focus={() => (event.currentTarget.style.cssText='position:static')}
  on:blur={() => (event.currentTarget.style.cssText='position:absolute;left:-9999px;top:-9999px')}>
  {$t('a11y.skip')}
</a>

<header class="rf-topbar">
  <a href="{base}/" class="brand"><Logo /></a>
  <nav class="main">
    <a href="{base}/orders">{$t('nav.orders') || 'Заказы'}</a>
    <a href="{base}/calendar">{$t('nav.calendar') || 'Календарь'}</a>
    <a href="{base}/loading">{$t('loading.board') || 'Loading'}</a>
    <a href="{base}/inventory">{$t('nav.inventory') || 'Склад'}</a>
    <a href="{base}/stations">{$t('nav.stations') || 'Станции'}</a>
    <a href="{base}/assets">{$t('nav.assets') || 'Активы'}</a>
    <a href="{base}/settings">{$t('nav.settings') || 'Настройки'}</a>
  </nav>
  <div class="actions">
    <LangSwitch />
    <TextSizeSwitch />
    <DensitySwitch />
    <ThemeSwitch />
    <NotificationsBell />
    <ChatPopover />
    <UserSwitch />
  </div>
</header>

<main id="main" class="rf-page"><slot /></main>

<MobileNav />

<Toaster />
<LiveRegion />
<CommandPalette open={searchOpen} onClose={closeSearch} />
<Keybindings bind:open={showKb} />

<style>
.rf-topbar{
  position:sticky;
  top:0;
  z-index:100;
  display:flex;
  align-items:center;
  gap:24px;
  padding:12px clamp(16px,3vw,28px);
  background:var(--bg-1);
  border-bottom:1px solid var(--border);
}

.rf-topbar .brand{
  display:inline-flex;
  align-items:center;
  text-decoration:none;
}

.rf-topbar nav.main{
  flex:1;
  display:flex;
  gap:16px;
  overflow-x:auto;
  scrollbar-width:none;
}
.rf-topbar nav.main::-webkit-scrollbar{display:none}

.rf-topbar nav.main a{
  padding:8px 12px;
  border-radius:999px;
  text-decoration:none;
  color:var(--text);
  white-space:nowrap;
  transition:background .2s ease;
}
.rf-topbar nav.main a:hover,.rf-topbar nav.main a:focus-visible{
  background:color-mix(in oklab,var(--bg-2) 70%,var(--bg-1) 30%);
}

.rf-topbar .actions{
  display:flex;
  align-items:center;
  gap:8px;
}

@media (max-width: 1280px){
  .rf-topbar{
    gap:16px;
  }
  .rf-topbar nav.main{
    gap:12px;
  }
}

@media (max-width: 720px){
  .rf-topbar{
    flex-wrap:wrap;
    padding:10px 16px;
    gap:12px;
  }
  .rf-topbar .brand{
    order:1;
  }
  .rf-topbar nav.main{
    order:3;
    width:100%;
  }
  .rf-topbar .actions{
    order:2;
  }
}
</style>
