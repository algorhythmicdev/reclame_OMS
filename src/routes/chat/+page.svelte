<script lang="ts">
  import ChatPane from '$lib/ui/ChatPane.svelte';
  import NotificationsFeed from '$lib/ui/NotificationsFeed.svelte';
  import UserSwitch from '$lib/users/UserSwitch.svelte';
</script>

<section class="grid" style="grid-template-columns:2fr 1fr; gap:16px">
  <ChatPane />
  <aside class="grid" style="gap:12px">
    <UserSwitch />
    <NotificationsFeed />
  </aside>
</section>
