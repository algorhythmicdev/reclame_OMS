<script lang="ts">
  export let title = '';
  export let value: string | number = '';
  export let icon: any = null;
</script>

<div class="card" style="display:flex;gap:12px;align-items:center">
  {#if icon}<svelte:component this={icon} size={22} />{/if}
  <div>
    <div class="value" style="font-weight:900;font-size:1.4rem">{value}</div>
    <div class="muted">{title}</div>
  </div>
</div>
