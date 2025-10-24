<script lang="ts">
  export let variant: 'primary' | 'ghost' | 'danger' = 'primary';
  export let disabled = false;
  export let type: 'button' | 'submit' = 'button';
</script>

<button {type} {disabled}
  class="btn-root"
  data-variant={variant}>
  <slot />
</button>

<style>
.btn-root{
  font-weight:800; cursor:pointer; border:none; border-radius:.8rem;
  padding:.65rem 1rem; background:var(--bg-2); color:var(--text);
}
.btn-root[data-variant="primary"]{ background:linear-gradient(90deg,var(--brand-magenta),var(--brand-violet),var(--brand-cyan)); color:#000; }
.btn-root[data-variant="ghost"]{ background:transparent; border:1px solid rgba(255,255,255,.12); }
.btn-root[data-variant="danger"]{ background:linear-gradient(90deg,#ff5d5d,#ffc0c0); color:#000; }
.btn-root:disabled{ opacity:.6; cursor:not-allowed; }
</style>