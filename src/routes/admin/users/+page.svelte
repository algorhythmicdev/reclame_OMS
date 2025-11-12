<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';

  onMount(() => {
    const user = $page.data.user;
    if (!user || user.role !== 'SuperAdmin') {
      goto('/orders');
    }
  });
</script>

<svelte:head>
  <title>User Management - Admin</title>
</svelte:head>

<div class="users-page">
  <h1>User Management</h1>
  <p>Coming soon - full user management system</p>
  <a href="/orders">← Back to Orders</a>
</div>

<style>
  .users-page {
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
