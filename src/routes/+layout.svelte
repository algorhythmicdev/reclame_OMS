<script>
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import Launchbar from '$lib/ui/Launchbar.svelte';
  import NotificationsFeed from '$lib/ui/NotificationsFeed.svelte';
  import ChatPane from '$lib/ui/ChatPane.svelte';
  import Toaster from '$lib/ui/Toaster.svelte';
  import LiveRegion from '$lib/ui/LiveRegion.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';
  import { seed } from '$lib/dev/seed';

  onMount(() => {
    if (import.meta.env.DEV) {
      seed(base);
    }

    const handler = (e) => {
      const target = e.target;
      if (target?.isContentEditable) return;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const adm = $role === 'Admin';
      const key = e.key?.toLowerCase();
      if (!key || !e.shiftKey) return;
      if (adm && key === 'a') window.dispatchEvent(new CustomEvent('rf-approve-selected'));
      if (adm && key === 'd') window.dispatchEvent(new CustomEvent('rf-decline-selected'));
      if (adm && key === 'u') window.dispatchEvent(new CustomEvent('rf-attach-revision'));
      if (!adm && key === 'n') window.dispatchEvent(new CustomEvent('rf-open-cr'));
      if (!adm && key === 'l') window.dispatchEvent(new CustomEvent('rf-focus-quicklog'));
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });
</script>

<link rel="stylesheet" href={`${base}/brand.css`} />

<a
  href="#main"
  class="tag"
  style="position:absolute;left:-9999px;top:-9999px"
  on:focus={(e) => (e.currentTarget.style.cssText = 'position:static')}
  on:blur={(e) => (e.currentTarget.style.cssText = 'position:absolute;left:-9999px;top:-9999px')}
>
  Skip to content
</a>

<div id="main" class="rf-shell">
  <!-- Top launch bar -->
  <Launchbar />

  <!-- Main page contents -->
  <div class="rf-content">
    <slot />
  </div>

  <!-- Right rail: notifications + chat -->
  <div class="rf-right" aria-label="Right rail">
    <NotificationsFeed />
    <ChatPane />
  </div>
</div>

<Toaster />
<LiveRegion />
