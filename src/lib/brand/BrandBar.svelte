<script lang="ts">
  import { base } from '$app/paths';
  import { theme, type ThemeName } from '$lib/stores/theme';
  import { currentUser, users, currentUserId } from '$lib/users/user-store';
  import { unseenCount } from '$lib/notifications/count';

  let c = 0;
  unseenCount.subscribe(v => c = v);

  let t: ThemeName; theme.subscribe(v => t=v);
  let showUserMenu = false;
  $: $currentUser, $users, $currentUserId;

  function logoSrc() {
    if (t === 'LightVim') return `${base}/brand/logo-reclame-cube-dark.webp`; // darker art
    return `${base}/brand/logo-reclame-cube.webp`;
  }

  function pickUser(e: Event) {
    const id = (e.target as HTMLSelectElement).value;
    currentUserId.set(id);
  }
</script>

<header class="brandbar" role="banner">
  <a href={`${base}/`} class="brand-link" aria-label="ReclamFabrik home">
    <img src={logoSrc()} alt="Reclamefabriek · cube" class="brand-logo" width="220" height="64" decoding="async" />
  </a>

  <!-- actions -->
  <div class="actions" role="group" aria-label="Header actions">
    <a class="notif" aria-label={`Notifications${c? ` (${c})`:''}`} href={`${base}/notifications`}>
      {#if c}<span class="dot" aria-hidden="true"></span>{/if}
      <span class="sr-only">{c} notifications</span>
    </a>

    <div class="user">
      <button class="user-btn" aria-haspopup="menu" aria-expanded={showUserMenu} on:click={() => showUserMenu = !showUserMenu}>
        <img src={`${base}/brand/avatar-default.svg`} alt="" class="avatar" />
        <span class="name">{$currentUser?.name}</span>
      </button>

      {#if showUserMenu}
        <div class="menu" role="menu" aria-label="User menu">
          <div class="menu-row"><b>User</b></div>
          <div class="menu-row">
            <select class="rf-input" on:change={pickUser} bind:value={$currentUserId} aria-label="Switch user">
              {#each $users as u}<option value={u.id}>{u.name} — {u.role}</option>{/each}
            </select>
          </div>
          <a class="menu-row tag" href={`${base}/settings`} role="menuitem">Settings</a>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
.brandbar{background:var(--bg-1);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;padding:8px 12px}
.brand-link{display:inline-flex;align-items:center;gap:10px;text-decoration:none}
.brand-logo{height:40px;width:auto;object-fit:contain}
.actions{display:flex;align-items:center;gap:12px}
.notif{position:relative;width:28px;height:28px;display:grid;place-items:center;border:1px solid var(--border);border-radius:999px;background:var(--bg-0)}
.notif .dot{width:8px;height:8px;border-radius:999px;background:var(--accent-1);position:absolute;top:2px;right:2px}
.user{position:relative}
.user-btn{display:flex;align-items:center;gap:8px;background:transparent;border:1px solid var(--border);border-radius:999px;padding:4px 8px;color:var(--text)}
.avatar{width:22px;height:22px;border-radius:999px;background:var(--bg-2)}
.menu{position:absolute;right:0;margin-top:6px;min-width:240px;background:var(--bg-1);border:1px solid var(--border);border-radius:10px;padding:8px;z-index:50}
.menu-row{margin:6px 0}
.sr-only{position:absolute;clip:rect(1px,1px,1px,1px);padding:0;border:0;height:1px;width:1px;overflow:hidden;white-space:nowrap}
</style>
