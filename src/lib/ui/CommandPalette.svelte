<script lang="ts">
  import Input from './Input.svelte';
  import Modal from './Modal.svelte';
  import { base } from '$app/paths';
  export let open = false;
  export let onClose = () => {};
  let q = '';

  const baseItems = [
    { label: 'Go: Dashboard', path: '/' },
    { label: 'Go: Launchpad', path: '/launchpad' },
    { label: 'Go: Calendar', path: '/calendar' },
    { label: 'Go: Orders', path: '/orders' },
    { label: 'Go: Files', path: '/files' },
    { label: 'Go: Chat', path: '/chat' },
    { label: 'Go: Inventory', path: '/inventory' },
    { label: 'Go: Settings', path: '/settings' }
  ];
  const withBase = (path: string) => {
    if (!base) return path;
    if (path === '/') return base || '/';
    return `${base}${path}`;
  };
  $: items = baseItems.map((item) => ({ ...item, href: withBase(item.path) }));
  $: list = items.filter(i => i.label.toLowerCase().includes(q.toLowerCase()));
</script>

<Modal {open} title="Command Palette" {onClose}>
  <Input bind:value={q} placeholder="Type a command or page…" />
  <div style="margin-top:10px;display:grid;gap:6px;max-height:300px;overflow:auto">
    {#each list as i}
      <a class="tag" href={i.href} on:click={onClose}>{i.label}</a>
    {/each}
    {#if list.length===0}<div class="muted">No matches</div>{/if}
  </div>
  <svelte:fragment slot="footer">
    <span class="muted">Tip: Press ⌘K / Ctrl-K</span>
  </svelte:fragment>
</Modal>