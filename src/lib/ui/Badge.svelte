<script lang="ts">
  export let tone: 'neutral'|'info'|'success'|'warn'|'danger'|'primary' = 'neutral';
  export let label = '';
</script>

<span class="badge" data-tone={tone} role="status" aria-label={label || tone}><slot /></span>

<style>
.badge{
  padding:6px 10px;
  border-radius:999px;
  font-size:.82rem;
  border:1px solid var(--border);
  background:var(--bg-2);
  color:var(--text);
}
.badge[data-tone="primary"]{
  background:color-mix(in oklab, var(--accent-1) 18%, transparent);
  color:var(--accent-1);
  border-color:color-mix(in oklab, var(--accent-1) 40%, transparent);
}
.badge[data-tone="info"]{
  background:color-mix(in oklab, var(--accent-2) 18%, transparent);
  color:var(--accent-2);
  border-color:color-mix(in oklab, var(--accent-2) 40%, transparent);
}
.badge[data-tone="success"]{
  background:color-mix(in oklab, var(--ok) 18%, transparent);
  color:var(--ok);
  border-color:color-mix(in oklab, var(--ok) 40%, transparent);
}
.badge[data-tone="warn"]{
  background:color-mix(in oklab, var(--warn) 18%, transparent);
  color:var(--warn);
  border-color:color-mix(in oklab, var(--warn) 40%, transparent);
}
.badge[data-tone="danger"]{
  background:color-mix(in oklab, var(--danger) 18%, transparent);
  color:var(--danger);
  border-color:color-mix(in oklab, var(--danger) 40%, transparent);
}
</style>
