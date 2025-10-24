<script lang="ts">
  import Input from './Input.svelte';
  import Modal from './Modal.svelte';
  export let open = false;
  export let onClose = () => {};
  let q = '';

  const items = [
    { label: 'Go: Dashboard', href: '/' },
    { label: 'Go: Launchpad', href: '/launchpad' },
    { label: 'Go: Calendar', href: '/calendar' },
    { label: 'Go: Orders', href: '/orders' },
    { label: 'Go: Files', href: '/files' },
    { label: 'Go: Chat', href: '/chat' },
    { label: 'Go: Inventory', href: '/inventory' },
    { label: 'Go: Settings', href: '/settings' }
  ];
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