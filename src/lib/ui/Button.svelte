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
  font-weight:700;
  cursor:pointer;
  border:1px solid var(--border);
  border-radius:.8rem;
  padding:.65rem 1rem;
  background:var(--bg-2);
  color:var(--text);
  transition:filter .15s ease;
}
.btn-root[data-variant="primary"]{
  background:linear-gradient(90deg,var(--accent-1),var(--accent-2));
  color:var(--ink-0, var(--text));
  border:none;
}
.btn-root[data-variant="ghost"]{
  background:transparent;
  border:1px solid var(--border);
  color:var(--text);
}
.btn-root[data-variant="danger"]{
  background:var(--danger);
  color:var(--ink-0, var(--text));
  border:none;
}
.btn-root:disabled{ opacity:.6; cursor:not-allowed; }
.btn-root:not(:disabled):hover{ filter:brightness(1.06); }
</style>
