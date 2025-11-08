<script lang="ts">
  export let quantity: number = 1;

  const quantities = [
    { value: 1, label: '1 pc', color: '#FF0000' },
    { value: 2, label: '2 pcs', color: '#0066FF' },
    { value: 3, label: '3 pcs', color: '#00CC66' },
    { value: 4, label: '4 pcs', color: '#9933FF' }
  ];

  function selectQuantity(value: number) {
    quantity = value;
  }
</script>

<div class="quantity-selector">
  {#each quantities as q}
    <button
      class="quantity-btn"
      class:active={quantity === q.value}
      style="background-color: {q.color};"
      on:click={() => selectQuantity(q.value)}
      type="button"
    >
      {q.label}
    </button>
  {/each}
</div>

<style>
  .quantity-selector {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quantity-btn {
    width: 80px;
    height: 40px;
    border: 2px solid transparent;
    border-radius: 4px;
    color: white;
    font-weight: bold;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .quantity-btn:hover {
    filter: brightness(1.1);
  }

  .quantity-btn.active {
    border-color: black;
    box-shadow: 0 0 0 2px white, 0 0 0 4px black;
  }
</style>
