<script lang="ts">
  import DraftOrderForm from '$lib/order/DraftOrderForm.svelte';
  
  let draftFormOpen = true;
  
  function handleClose() {
    draftFormOpen = false;
    // Reopen after a delay to keep testing
    setTimeout(() => draftFormOpen = true, 500);
  }
</script>

<div style="padding: 2rem;">
  <h1>Draft Order Form Test</h1>
  <p>Testing the new draft order form design</p>
  
  <button on:click={() => draftFormOpen = true} style="padding: 1rem; margin: 1rem 0; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer;">
    Open Draft Form
  </button>
</div>

<DraftOrderForm bind:open={draftFormOpen} onClose={handleClose} />
