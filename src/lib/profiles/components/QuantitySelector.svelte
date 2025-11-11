<!-- src/lib/profiles/components/QuantitySelector.svelte -->
<script lang="ts">
  export let quantity: number = 1;
  export let maxQuantity: number = 10;
  export let disabled: boolean = false;

  const colors = ['#E53E3E', '#3B82F6', '#10B981', '#9333EA', '#F59E0B', '#EC4899', '#8B5CF6', '#14B8A6', '#F97316', '#06B6D4'];

  function setQuantity(q: number) {
    if (!disabled) {
      quantity = q;
    }
  }
</script>

<div class="quantity-selector">
  {#each Array(Math.min(maxQuantity, 10)) as _, i}
    {@const q = i + 1}
    <button
      type="button"
      class="quantity-button"
      class:selected={quantity === q}
      style="background-color: {colors[i % colors.length]};"
      on:click={() => setQuantity(q)}
      {disabled}
    >
      {q} {q === 1 ? 'pc' : 'pcs'}
    </button>
  {/each}
</div>

<style>
  .quantity-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    min-width: 80px;
  }

  .quantity-button {
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    color: white;
    border: none;
    border-radius: var(--radius-md, 6px);
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 700;
    font-size: var(--text-sm, 0.875rem);
    text-align: center;
    box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }

  .quantity-button:hover:not(:disabled) {
    transform: translateX(4px);
    box-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  }

  .quantity-button.selected {
    transform: scale(1.1);
    box-shadow: 0 0 0 3px var(--primary, #3b82f6);
  }

  .quantity-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
