<script lang="ts">
  import BrandBar from '$lib/brand/BrandBar.svelte';
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import Launchbar from '$lib/ui/Launchbar.svelte';
  import NotificationsFeed from '$lib/ui/NotificationsFeed.svelte';
  import ChatPane from '$lib/ui/ChatPane.svelte';
  import Toaster from '$lib/ui/Toaster.svelte';
  import LiveRegion from '$lib/ui/LiveRegion.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';
  import { seed } from '$lib/dev/seed';
  import CommandPalette from '$lib/ui/CommandPalette.svelte';

  if (import.meta.env.DEV) {
    seed(base);
  }

  let searchOpen = false;

  const openSearch = () => {
    searchOpen = true;
  };

  const closeSearch = () => {
    searchOpen = false;
  };

  onMount(() => {
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
      if (!e.shiftKey) return;
      if (adm && key === 'a') window.dispatchEvent(new CustomEvent('rf-approve-selected'));
      if (adm && key === 'd') window.dispatchEvent(new CustomEvent('rf-decline-selected'));
      if (adm && key === 'u') window.dispatchEvent(new CustomEvent('rf-attach-revision'));
      if (!adm && key === 'n') window.dispatchEvent(new CustomEvent('rf-open-cr'));
      if (!adm && key === 'l') window.dispatchEvent(new CustomEvent('rf-focus-quicklog'));
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
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
  <link rel="preload" href={`${base}/brand/logo-reclame-cube.webp`} as="image">
  <link rel="stylesheet" href={`${base}/brand.css`}>
</svelte:head>

<a href="#main" class="tag" style="position:absolute;left:-9999px;top:-9999px"
  on:focus={() => (event.currentTarget.style.cssText='position:static')}
  on:blur={() => (event.currentTarget.style.cssText='position:absolute;left:-9999px;top:-9999px')}>
  Skip to content
</a>

<BrandBar>
  <Launchbar on:opensearch={openSearch} />
</BrandBar>

<div class="rf-shell">
  <!-- Main content + right rail -->
  <main id="main" class="rf-main">
    <slot />
  </main>

  <aside class="rf-right">
    <!-- Notifications panel -->
    <section class="rf-panel">
      <header class="row" style="justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--border)">
        <strong>Notifications</strong>
      </header>
      <div class="rf-scroll" aria-live="polite">
        <NotificationsFeed />
      </div>
    </section>
    <!-- Chat panel -->
    <section class="rf-panel">
      <header class="row" style="justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--border)">
        <strong>Chat</strong>
      </header>
      <div class="rf-scroll">
        <ChatPane />
      </div>
    </section>
  </aside>
</div>

<Toaster />
<LiveRegion />
<CommandPalette open={searchOpen} onClose={closeSearch} />

<style>
.rf-shell{
  display:grid; grid-template-columns: 1fr minmax(340px, 380px); gap:12px;
  padding: 12px;
}
.rf-main{ min-width:0; }
</style>
