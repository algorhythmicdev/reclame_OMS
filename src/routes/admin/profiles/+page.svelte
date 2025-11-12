<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  onMount(() => {
    const user = $page.data.user;
    if (!user || (user.role !== 'Admin' && user.role !== 'SuperAdmin')) {
      goto('/orders');
    }
  });
</script>

<svelte:head>
  <title>Profile Templates - Admin</title>
</svelte:head>

<div class="profiles-page">
  <h1>Profile Templates</h1>
  <p>Canvas builder coming soon</p>
  <a href="/orders">← Back to Orders</a>
</div>

<style>
  .profiles-page {
    padding: var(--space-xl);
    max-width: 1400px;
    margin: 0 auto;
  }

  h1 {
    margin: 0 0 var(--space-sm) 0;
    font-size: var(--text-3xl);
  }

  p {
    color: var(--text-muted);
  }

  a {
    display: inline-block;
    margin-top: var(--space-lg);
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
  }

  a:hover {
    text-decoration: underline;
  }
</style>
