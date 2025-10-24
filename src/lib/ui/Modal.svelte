<script lang="ts">
  export let open = false;
  export let title = '';
  export let onClose: () => void = () => {};
  function backdrop(e: MouseEvent){ if(e.target === e.currentTarget) onClose(); }
</script>

{#if open}
  <div class="shade" on:click={backdrop}>
    <div class="panel" role="dialog" aria-modal="true" aria-label={title}>
      <header><h3>{title}</h3><button class="x" on:click={onClose} aria-label="Close">✕</button></header>
      <section><slot /></section>
      <footer><slot name="footer" /></footer>
    </div>
  </div>
{/if}

<style>
.shade{position:fixed;inset:0;background:rgba(0,0,0,.45);display:grid;place-items:center;z-index:99}
.panel{background:var(--bg-1);border:1px solid rgba(255,255,255,.12);border-radius:14px;min-width:360px;max-width:640px;padding:14px}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.x{background:transparent;border:none;color:var(--text);cursor:pointer;font-size:1.1rem}
footer{margin-top:10px;display:flex;gap:8px;justify-content:flex-end}
</style>