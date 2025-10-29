<script lang="ts">
  import { createItem, updateItem, type Item } from './store';
  import type { Section } from './types';
  
  export let item: Partial<Item> = {}; // new or existing
  export let onClose = () => {};
  
  const isNew = !item.id;
  
  function save() {
    if (isNew) createItem(item);
    else updateItem(item.id!, item);
    onClose();
  }
</script>

<div class="sheet" role="dialog" aria-modal="true" aria-label="Inventory item">
  <form class="card" on:submit|preventDefault={save}>
    <header class="row" style="justify-content:space-between">
      <strong>{isNew ? 'New item' : 'Edit item'}</strong>
      <div class="row">
        <button class="tag ghost" type="button" on:click={onClose}>Cancel</button>
        <button class="tag" type="submit">Save</button>
      </div>
    </header>

    <div class="grid" style="grid-template-columns:1fr 1fr">
      <label>
        Section
        <select bind:value={item.section}>
          <option value="materials">materials</option>
          <option value="leftovers">leftovers</option>
          <option value="paints">paints</option>
          <option value="tools">tools</option>
          <option value="cons">cons</option>
        </select>
      </label>
      <label>
        Group
        <input bind:value={item.group} placeholder="e.g., Acrylic / Aluminium" />
      </label>
      <label>
        SKU
        <input bind:value={item.sku} />
      </label>
      <label>
        Name
        <input bind:value={item.name} />
      </label>
      <label>
        Unit
        <input bind:value={item.unit} placeholder="pcs / m² / m / l" />
      </label>
      <label>
        Stock
        <input type="number" bind:value={item.stock} />
      </label>
      <label>
        Min
        <input type="number" bind:value={item.min} />
      </label>
      <label>
        Location
        <input bind:value={item.location} placeholder="Rack A / Bin 3" />
      </label>
    </div>
  </form>
</div>

<style>
.sheet {
  position: fixed;
  inset: 0;
  background: color-mix(in oklab, var(--bg-0) 55%, transparent);
  display: grid;
  place-items: center;
  z-index: 60;
  padding: 16px;
  backdrop-filter: blur(2px);
}
.card {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
label {
  display: grid;
  gap: 6px;
  margin: 8px 0;
}
input, textarea, select {
  background: var(--bg-0);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px;
  color: var(--text);
}
</style>
