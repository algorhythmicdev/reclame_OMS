<script lang="ts">
  import Button from '$lib/ui/Button.svelte';
  import Input from '$lib/ui/Input.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';

  export type MaterialRow = { key: string; label: string; value: string };

  export let items: MaterialRow[] = [];
  export let onPropose: (items: MaterialRow[]) => void = () => {};
  export let onApplyAdmin: (items: MaterialRow[]) => void = () => {};

  let rows: MaterialRow[] = items.map((item) => ({ ...item }));
  let lastItems = items;

  $: if (lastItems !== items) {
    lastItems = items;
    rows = items.map((item) => ({ ...item }));
  }

  function add() {
    const nextIndex = rows.length + 1;
    rows = [...rows, { key: `mat_${nextIndex}`, label: 'Item', value: '' }];
  }

  function del(index: number) {
    rows = rows.filter((_, i) => i !== index);
  }

  function cloneRows() {
    return rows.map((row) => ({ ...row }));
  }

  function equals(a: MaterialRow[], b: MaterialRow[]) {
    if (a.length !== b.length) return false;
    return a.every((row, index) => {
      const other = b[index];
      return row.key === other.key && row.label === other.label && row.value === other.value;
    });
  }

  $: hasChanges = !equals(rows, items);

  function submitAdmin() {
    if (!hasChanges) return;
    const next = cloneRows();
    onApplyAdmin(next);
    rows = next.map((row) => ({ ...row }));
  }

  function submitCR() {
    if (!hasChanges) return;
    onPropose(cloneRows());
    rows = items.map((item) => ({ ...item }));
  }

  $: isAdmin = $role === 'Admin';
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Materials Editor</h3>
  <div class="grid" style="grid-template-columns:1fr 1fr 1fr auto; gap:8px">
    {#each rows as r, i}
      <Input bind:value={r.key} placeholder="Key" ariaLabel="Key" />
      <Input bind:value={r.label} placeholder="Label" ariaLabel="Label" />
      <Input bind:value={r.value} placeholder="Value" ariaLabel="Value" />
      <button class="tag" type="button" on:click={() => del(i)} aria-label="Delete row">–</button>
    {/each}
    <div style="grid-column:1 / -1">
      <button class="tag" type="button" on:click={add} aria-label="Add material">+ Add</button>
    </div>
  </div>
  <div class="row" style="margin-top:8px">
    {#if isAdmin}
      <Button on:click={submitAdmin} disabled={!hasChanges}>Apply (Admin)</Button>
    {:else}
      <Button on:click={submitCR} disabled={!hasChanges}>Propose Update</Button>
    {/if}
  </div>
</div>
