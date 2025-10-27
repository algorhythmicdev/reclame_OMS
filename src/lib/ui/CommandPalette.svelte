<script lang="ts">
  import Input from './Input.svelte';
  import Modal from './Modal.svelte';
  import { base } from '$app/paths';
  import { searchOrders } from '$lib/search/global-search';

  export let open = false;
  export let onClose = () => {};
  let q = '';

  const withBase = (path: string) => {
    if (!base) return path;
    if (path === '/') return base || '/';
    return `${base}${path}`;
  };

  $: trimmed = q.trim();
  $: hits = open && trimmed ? searchOrders(trimmed) : [];
  $: if (!open) q = '';

  const toHref = (id: string) => withBase(`/orders/${id}`);
</script>

<Modal {open} title="Search Orders" {onClose}>
  <Input bind:value={q} placeholder="Search orders, clients, fields…" ariaLabel="Search orders" />
  <div style="margin-top:10px;display:grid;gap:6px;max-height:300px;overflow:auto">
    {#if trimmed && hits.length===0}
      <div class="muted">No matches</div>
    {:else if !trimmed}
      <div class="muted">Start typing to search orders.</div>
    {:else}
      {#each hits as hit}
        <a
          class="tag"
          href={toHref(hit.id)}
          on:click={onClose}
          on:keydown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              onClose();
            }
          }}
        >
          <div style="display:flex;flex-direction:column;align-items:flex-start">
            <span><b>{hit.title}</b></span>
            <span class="muted">{hit.id} • {hit.client}</span>
            <span class="muted" style="font-size:0.8rem">Matched: {hit.where.join(', ')}</span>
          </div>
        </a>
      {/each}
    {/if}
  </div>
  <svelte:fragment slot="footer">
    <span class="muted">Tip: Press ⌘K / Ctrl-K</span>
  </svelte:fragment>
</Modal>