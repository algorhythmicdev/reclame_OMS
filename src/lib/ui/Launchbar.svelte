<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { createEventDispatcher, onDestroy } from 'svelte';
  import { Search } from 'lucide-svelte';
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

  const dispatch = createEventDispatcher();
  const openSearch = () => dispatch('opensearch');
  const basePath = normalize(resolveHref(base, '/'));

  const resolveLink = (path: string) => resolveHref(base, path);

  const toRelativePath = (path: string) => toRelative(basePath, path);

  $: currentPath = toRelativePath($page.url?.pathname ?? '/');

  const navState = (href: string) => getActiveState(currentPath, href);

  const navAriaCurrent = (href: string) => ariaCurrent(navState(href));

  const themes: ThemeName[] = ['LightVim', 'DarkVim', 'HighContrastVim'];
  let currentTheme: ThemeName = 'DarkVim';
  const unsubscribeTheme = theme.subscribe((value) => (currentTheme = value));

  let currentLocale: 'en' | 'ru' | 'lv' = 'en';
  const unsubscribeLocale = locale.subscribe((value) => (currentLocale = value || 'en'));

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

  onDestroy(() => {
    unsubscribeTheme?.();
    unsubscribeLocale?.();
  });
</script>

<div class="rf-launchbar">
  <nav class="row" aria-label={$t('nav.launchpad')} style="gap:6px;flex-wrap:wrap">
    {#each navLinks as L}
      {@const resolved = resolveLink(L.href)}
      {@const state = navState(L.href)}
      {@const active = Boolean(state)}
      <a
        class="tag"
        class:is-active={active}
        href={resolved}
        aria-current={navAriaCurrent(L.href)}
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
  </div>
</div>
