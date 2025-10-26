<script lang="ts">
  import { base } from '$app/paths';
  import { t } from 'svelte-i18n';
  import { theme, type ThemeName } from '$lib/stores/theme';
  import { setLocale } from '$lib/i18n';
  import { Grid, Calendar, PackageSearch, FolderOpen, Settings, KanbanSquare } from 'lucide-svelte';

  let currentTheme: ThemeName = 'DarkVim';
  $: currentTheme = $theme as ThemeName;

  const sanitizeBase = () => {
    const trimmed = (base ?? '').trim();
    if (!trimmed || trimmed === '/') return '';
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  };

  const normalizePath = (path: string) => {
    if (!path) return '/';
    return path.startsWith('/') ? path : `/${path}`;
  };

  const toHref = (path: string) => {
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

  const links = [
    { path: '/', labelKey: 'nav.dashboard', icon: Grid },
    { path: '/calendar', labelKey: 'nav.calendar', icon: Calendar },
    { path: '/orders', labelKey: 'nav.orders', icon: PackageSearch },
    { path: '/files', labelKey: 'nav.files', icon: FolderOpen },
    { path: '/kanban', labelKey: 'nav.kanban', icon: KanbanSquare },
    { path: '/settings', labelKey: 'nav.settings', icon: Settings }
  ];

  function switchTheme(name: ThemeName) {
    theme.set(name);
  }

  function switchLang(code: 'en' | 'ru' | 'lv') {
    setLocale(code);
  }
</script>

<section class="card">
  <h2 style="margin:0 0 8px 0">{$t('nav.launchpad')}</h2>

  <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px">
    {#each links as link}
      <a class="card" style="padding:14px;display:flex;gap:10px;align-items:center" href={toHref(link.path)}>
        <svelte:component this={link.icon} size={18} />
        <div>{$t(link.labelKey)}</div>
      </a>
    {/each}
  </div>

  <div class="card" style="margin-top:12px">
    <h3 style="margin:0 0 8px 0">{$t('launchpad.themes')}</h3>
    <div class="row" role="group" aria-label={$t('launchpad.themes')}>
      <button class="tag" aria-pressed={currentTheme==='LightVim'} on:click={() => switchTheme('LightVim')}>
        {$t('themes.light')}
      </button>
      <button class="tag" aria-pressed={currentTheme==='DarkVim'} on:click={() => switchTheme('DarkVim')}>
        {$t('themes.dark')}
      </button>
      <button class="tag" aria-pressed={currentTheme==='HighContrastVim'} on:click={() => switchTheme('HighContrastVim')}>
        {$t('themes.hc')}
      </button>
    </div>

    <h3 style="margin:10px 0 8px">{$t('launchpad.language')}</h3>
    <div class="row" role="group" aria-label={$t('launchpad.language')}>
      <button class="tag" on:click={() => switchLang('en')}>English</button>
      <button class="tag" on:click={() => switchLang('ru')}>Русский</button>
      <button class="tag" on:click={() => switchLang('lv')}>Latviešu</button>
    </div>
  </div>
</section>
