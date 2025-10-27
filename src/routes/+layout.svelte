<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import AppHeader from '$lib/ui/AppHeader.svelte';
  import NotificationsFeed from '$lib/ui/NotificationsFeed.svelte';
  import ChatPane from '$lib/ui/ChatPane.svelte';
  import Toaster from '$lib/ui/Toaster.svelte';
  import LiveRegion from '$lib/ui/LiveRegion.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';
  import { seed } from '$lib/dev/seed';
  import CommandPalette from '$lib/ui/CommandPalette.svelte';
  import { t } from 'svelte-i18n';

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
  <link rel="stylesheet" href={`${base}/brand.css`}>
</svelte:head>

<a href="#main" class="tag" style="position:absolute;left:-9999px;top:-9999px"
  on:focus={() => (event.currentTarget.style.cssText='position:static')}
  on:blur={() => (event.currentTarget.style.cssText='position:absolute;left:-9999px;top:-9999px')}>
  {$t('a11y.skip')}
</a>


<div class="rf-app">
  <AppHeader on:opensearch={openSearch} />

  <div class="rf-shell">
    <!-- Main content + right rail -->
    <main id="main" class="rf-main">
      <slot />
    </main>

    <aside class="rf-right">
      <!-- Notifications panel -->
      <section class="rf-panel">
        <header class="row" style="justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--border)">
          <strong>{$t('layout.notifications')}</strong>
        </header>
        <div class="rf-scroll" aria-live="polite">
          <NotificationsFeed />
        </div>
      </section>
      <!-- Chat panel -->
      <section class="rf-panel">
        <header class="row" style="justify-content:space-between;padding:8px 10px;border-bottom:1px solid var(--border)">
          <strong>{$t('layout.chat')}</strong>
        </header>
        <div class="rf-scroll">
          <ChatPane />
        </div>
      </section>
    </aside>
  </div>
</div>

<Toaster />
<LiveRegion />
<CommandPalette open={searchOpen} onClose={closeSearch} />

<style>
.rf-app{
  min-height:100vh;
  display:flex;
  flex-direction:column;
}

.rf-shell{
  flex:1;
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(320px, 380px);
  gap:12px;
  padding:12px;
  align-items:start;
}

.rf-main{
  min-width:0;
  min-height:0;
}

.rf-right{
  align-self:start;
}

@media (max-width: 1100px){
  .rf-shell{
    grid-template-columns:1fr;
  }

  .rf-right{
    position:static;
  }
}
</style>
