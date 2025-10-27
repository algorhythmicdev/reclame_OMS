<script lang="ts">
  import { base } from '$app/paths';
  import { t } from 'svelte-i18n';
  import { Grid, Calendar, PackageSearch, FolderOpen, Settings, KanbanSquare } from 'lucide-svelte';
  import ThemeSwitch from '$lib/ui/ThemeSwitch.svelte';
  import LanguageSwitch from '$lib/ui/LanguageSwitch.svelte';

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
</section>

<section class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); gap: 10px; margin-top: 10px;">
  <ThemeSwitch />
  <LanguageSwitch />
</section>
