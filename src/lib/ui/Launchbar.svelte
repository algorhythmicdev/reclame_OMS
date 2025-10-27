<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { createEventDispatcher } from 'svelte';
  import { Grid, Calendar, FolderOpen, PackageSearch, Settings, Search, KanbanSquare } from 'lucide-svelte';
  import RoleSwitch from './RoleSwitch.svelte';
  import { t, locale } from 'svelte-i18n';
  import { setLocale } from '$lib/i18n';
  import { theme, type ThemeName } from '$lib/stores/theme';
  import { savePrefs } from '$lib/settings/service';

  const dispatch = createEventDispatcher();
  const openSearch = () => dispatch('opensearch');
  const links = [
    { href: '/launchpad', labelKey: 'nav.launchpad', icon: KanbanSquare },
    { href: '/', labelKey: 'nav.dashboard', icon: Grid },
    { href: '/calendar', labelKey: 'nav.calendar', icon: Calendar },
    { href: '/orders', labelKey: 'nav.orders', icon: PackageSearch },
    { href: '/files', labelKey: 'nav.files', icon: FolderOpen },
    { href: '/settings', labelKey: 'nav.settings', icon: Settings }
  ];

  const sanitizeBase = () => {
    const trimmed = (base ?? '').trim();
    if (!trimmed || trimmed === '/') return '';
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  };

  const normalizePath = (path: string) => {
    if (!path) return '/';
    return path.startsWith('/') ? path : `/${path}`;
  };

  const resolveHref = (path: string) => {
    const normalizedBase = sanitizeBase();
    const normalizedPath = normalizePath(path);
    if (!normalizedBase) {
      return normalizedPath;
    }
    if (normalizedPath === '/') {
      return normalizedBase;
    }
    return `${normalizedBase}${normalizedPath}`;
  };
  const normalize = (path: string) => {
    if (!path) return '/';
    const trimmed = path.replace(/\/+$/, '');
    if (!trimmed) return '/';
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  };

  const basePath = normalize(resolveHref('/'));

  const toRelative = (path: string) => {
    const normalized = normalize(path);
    if (basePath === '/') return normalized;
    if (normalized === basePath) return '/';
    if (normalized.startsWith(`${basePath}/`)) {
      const remainder = normalized.slice(basePath.length);
      return remainder === '' ? '/' : remainder;
    }
    return normalized;
  };

  $: currentPath = toRelative($page.url?.pathname ?? '/');

  type ActiveState = 'exact' | 'ancestor' | null;

  const getActiveState = (href: string): ActiveState => {
    const target = normalize(href);
    if (target === '/') {
      return currentPath === '/' ? 'exact' : null;
    }
    if (currentPath === target) return 'exact';
    if (currentPath.startsWith(`${target}/`)) return 'ancestor';
    return null;
  };

  const ariaCurrent = (href: string) => {
    const state = getActiveState(href);
    if (state === 'exact') return 'page';
    if (state) return 'true';
    return undefined;
  };

  const themes: ThemeName[] = ['LightVim', 'DarkVim', 'HighContrastVim'];
  let currentTheme: ThemeName = 'DarkVim';
  theme.subscribe((value) => (currentTheme = value));

  let currentLocale: 'en' | 'ru' | 'lv' = 'en';
  locale.subscribe((value) => (currentLocale = value || 'en'));

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
</script>

<div class="rf-launchbar">
  <nav class="row" aria-label={$t('nav.launchpad')} style="gap:6px;flex-wrap:wrap">
    {#each links as L}
      {@const resolved = resolveHref(L.href)}
      {@const state = getActiveState(L.href)}
      {@const active = Boolean(state)}
      <a
        class="tag"
        class:is-active={active}
        href={resolved}
        aria-current={ariaCurrent(L.href)}
      >
        <svelte:component this={L.icon} size={16} /> {$t(L.labelKey)}
      </a>
    {/each}
  </nav>

  <div class="row launchpad-controls">
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
    <div class="tag-group" role="group" aria-label="Theme">
      {#each themes as option}
        <button
          type="button"
          class="tag"
          class:is-active={currentTheme === option}
          on:click={() => selectTheme(option)}
        >{option}</button>
      {/each}
    </div>
    <select
      class="rf-input rf-input--compact"
      bind:value={currentLocale}
      aria-label="Language"
      on:change={onLocaleChange}
    >
      <option value="en">English</option>
      <option value="ru">Русский</option>
      <option value="lv">Latviešu</option>
    </select>
    <RoleSwitch />
  </div>
</div>
