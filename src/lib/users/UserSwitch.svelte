<script lang="ts">
  import { users, currentUserId } from './user-store';
  import { t } from 'svelte-i18n';

  $: $users, $currentUserId, $t;
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{$t('users.current')}</h3>
  <select class="rf-select" bind:value={$currentUserId} aria-label={$t('users.current')}>
    {#each $users as user}
      <option value={user.id}>{user.name} — {user.role}</option>
    {/each}
  </select>
</div>
