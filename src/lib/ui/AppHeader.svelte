<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { createEventDispatcher, onDestroy } from 'svelte';
import { Search } from 'lucide-svelte';
import { currentUser, users, currentUserId } from '$lib/users/user-store';
import { unseenCount } from '$lib/notifications/count';
import RoleSwitch from './RoleSwitch.svelte';
import { t, locale } from 'svelte-i18n';
  import { setLocale } from '$lib/i18n';
  import { theme, type ThemeName } from '$lib/stores/theme';
  import { savePrefs } from '$lib/settings/service';
  import {
    navLinks,
    resolveHref,
    normalize,
    toRelative,
    getActiveState,
    ariaCurrent
  } from '$lib/navigation/nav';

  const dispatch = createEventDispatcher<{ opensearch: void }>();
  const openSearch = () => dispatch('opensearch');

  let showUserMenu = false;
  let notificationCount = 0;

  const unsubscribeUnseen = unseenCount.subscribe((value) => (notificationCount = value));
  onDestroy(() => unsubscribeUnseen?.());

  $: $currentUser, $users, $currentUserId;

  const logo = () => `${base}/logo.png`;
  const pickUser = (event: Event) => currentUserId.set((event.target as HTMLSelectElement).value);

  const basePath = normalize(resolveHref(base, '/'));

  const resolveLink = (path: string) => resolveHref(base, path);

  const toRelativePath = (path: string) => toRelative(basePath, path);

  $: currentPath = toRelativePath($page.url?.pathname ?? '/');

const navState = (href: string) => getActiveState(currentPath, href);

const navAriaCurrent = (href: string) => ariaCurrent(navState(href));

const themes: ThemeName[] = ['LightVim', 'DarkVim', 'HighContrastVim'];
  let currentTheme: ThemeName = 'DarkVim';
  const unsubscribeTheme = theme.subscribe((value) => (currentTheme = value));
  onDestroy(() => unsubscribeTheme?.());

  let currentLocale: 'en' | 'ru' | 'lv' = 'en';
  const unsubscribeLocale = locale.subscribe((value) => (currentLocale = value || 'en'));
  onDestroy(() => unsubscribeLocale?.());

  const selectTheme = (value: ThemeName) => {
    theme.set(value);
    savePrefs();
  };

  const changeLocale = (code: 'en' | 'ru' | 'lv') => {
    setLocale(code);
    savePrefs();
  };

  const onLocaleChange = (event: Event) => {
    const value = (event.target as HTMLSelectElement).value as 'en' | 'ru' | 'lv';
    changeLocale(value);
  };

const toggleUserMenu = () => (showUserMenu = !showUserMenu);

$: notificationLabel = notificationCount
  ? `${$t('header.notifications.label')} (${$t('header.notifications.srCount', { count: notificationCount })})`
  : $t('header.notifications.label');

const roleLabel = (role: string) => {
  if (role === 'Admin') return $t('roles.admin');
  if (role === 'Station') return $t('roles.station');
  return role;
};
</script>

<header class="app-header">
  <a href={`${base}/`} class="brand-link" aria-label={$t('app.brand.aria')}>
    <img src={logo()} alt={$t('app.brand.aria')} class="brand-logo" width="220" height="64" decoding="async" />
  </a>

  <nav class="app-header__nav" aria-label={$t('nav.launchpad')}>
    {#each navLinks as link}
      {@const resolved = resolveLink(link.href)}
      {@const state = navState(link.href)}
      {@const active = Boolean(state)}
      <a
        class="tag"
        class:is-active={active}
        href={resolved}
        aria-current={navAriaCurrent(link.href)}
      >
        <svelte:component this={link.icon} size={16} /> {$t(link.labelKey)}
      </a>
    {/each}
  </nav>

  <div class="app-header__actions" role="group" aria-label={$t('header.actions')}>
    <button
      class="tag"
      type="button"
      on:click={openSearch}
      aria-label={$t('a11y.search')}
    >
      <span class="row" style="gap:6px;align-items:center">
        <Search size={16} />
        <span>{$t('a11y.search')}</span>
      </span>
      <span class="muted shortcut">⌘K</span>
    </button>

    <div class="tag-group" role="group" aria-label={$t('header.theme.label')}>
      {#each themes as option}
        <button
          type="button"
          class="tag"
          class:is-active={currentTheme === option}
          on:click={() => selectTheme(option)}
        >{$t(`header.theme.options.${option}`)}</button>
      {/each}
    </div>

    <select
      class="rf-input rf-input--compact"
      bind:value={currentLocale}
      aria-label={$t('header.language.label')}
      on:change={onLocaleChange}
    >
      <option value="en">{$t('header.language.options.en')}</option>
      <option value="ru">{$t('header.language.options.ru')}</option>
      <option value="lv">{$t('header.language.options.lv')}</option>
    </select>

    <RoleSwitch />

    <a class="notif" aria-label={notificationLabel} href={`${base}/notifications`}>
      {#if notificationCount}<span class="dot" aria-hidden="true"></span>{/if}
      <span class="sr-only">{$t('header.notifications.srCount', { count: notificationCount })}</span>
    </a>

    <div class="user">
      <button class="user-btn" aria-haspopup="menu" aria-expanded={showUserMenu} on:click={toggleUserMenu}>
        <img src={`${base}/brand/avatar-default.svg`} alt="" class="avatar" />
        <span class="name">{$currentUser?.name}</span>
      </button>

      {#if showUserMenu}
        <div class="menu" role="menu" aria-label={$t('header.user.label')}>
          <div class="menu-row"><b>{$t('header.user.label')}</b></div>
          <div class="menu-row">
            <select class="rf-input" on:change={pickUser} bind:value={$currentUserId} aria-label={$t('header.user.switch')}>
              {#each $users as u}
                <option value={u.id}>{u.name} — {roleLabel(u.role)}</option>
              {/each}
            </select>
          </div>
          <a class="menu-row tag" href={`${base}/launchpad`} role="menuitem">{$t('nav.launchpad')}</a>
          <a class="menu-row tag" href={`${base}/settings`} role="menuitem">{$t('nav.settings')}</a>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  .app-header {
    display: flex;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    padding: 12px;
    background: var(--bg-1);
    border-bottom: 1px solid var(--border);
  }

  .brand-link {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
  }

  .brand-logo {
    height: 40px;
    width: auto;
    object-fit: contain;
  }

  .notif {
    position: relative;
    width: 28px;
    height: 28px;
    display: grid;
    place-items: center;
    border: 1px solid var(--border);
    border-radius: 999px;
    background: var(--bg-0);
  }

  .notif .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: var(--accent-1);
    position: absolute;
    top: 2px;
    right: 2px;
  }

  .user {
    position: relative;
  }

  .user-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 4px 8px;
    color: var(--text);
  }

  .avatar {
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--bg-2);
  }

  .menu {
    position: absolute;
    right: 0;
    margin-top: 6px;
    min-width: 240px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 8px;
    z-index: 50;
  }

  .menu-row {
    margin: 6px 0;
  }

  .app-header__nav {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    flex: 1 1 auto;
  }

  .app-header__actions {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .app-header__actions .tag {
    transition: background 0.2s ease, color 0.2s ease;
  }

  .sr-only {
    position: absolute;
    clip: rect(1px, 1px, 1px, 1px);
    padding: 0;
    border: 0;
    height: 1px;
    width: 1px;
    overflow: hidden;
    white-space: nowrap;
  }

  @media (max-width: 900px) {
    .app-header {
      gap: 12px;
    }

    .app-header__nav {
      flex: 1 1 100%;
    }

    .app-header__actions {
      width: 100%;
      justify-content: flex-start;
    }
  }
</style>
