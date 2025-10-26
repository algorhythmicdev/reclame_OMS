<script>
  import { base } from '$app/paths';
  import Launchbar from '$lib/ui/Launchbar.svelte';
  import NotificationsFeed from '$lib/ui/NotificationsFeed.svelte';
  import ChatPane from '$lib/ui/ChatPane.svelte';
  import Toaster from '$lib/ui/Toaster.svelte';
  import LiveRegion from '$lib/ui/LiveRegion.svelte';
</script>

<link rel="stylesheet" href={`${base}/brand.css`} />

<div class="rf-shell">
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
