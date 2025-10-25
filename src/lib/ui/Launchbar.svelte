<script lang="ts">
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import { Grid, Calendar, FolderOpen, PackageSearch, MessageSquareMore, Settings, Search, Rocket } from 'lucide-svelte';

  let q = '';
  const links = [
    { href: '/', label: 'Dashboard', icon: Grid },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/orders', label: 'Orders', icon: PackageSearch },
    { href: '/files', label: 'Files', icon: FolderOpen },
    { href: '/chat', label: 'Chat', icon: MessageSquareMore },
    { href: '/settings', label: 'Settings', icon: Settings }
  ];

  const resolveHref = (path: string) => `${base}${path}`;
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
</script>

<div class="rf-launchbar">
  <a href={resolveHref('/')} class="tag" title="Launchpad" aria-label="Launchpad">
    <Rocket size={16} />
  </a>

  <nav class="row" aria-label="Quick launch" style="gap:6px;flex-wrap:wrap">
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
        <svelte:component this={L.icon} size={16} /> {L.label}
      </a>
    {/each}
  </nav>

  <form class="row" style="margin-left:auto;min-width:300px" role="search" on:submit|preventDefault>
    <div class="tag" style="display:flex;gap:6px;align-items:center;width:100%">
      <Search size={16} />
      <input
        class="rf-input" style="border:none;background:transparent;padding:0"
        type="search" placeholder="Search orders, files, clients…" aria-label="Search"
        bind:value={q} />
    </div>
  </form>
</div>
