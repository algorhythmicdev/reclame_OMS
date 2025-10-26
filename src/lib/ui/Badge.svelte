<script lang="ts">
  export let tone: 'neutral'|'info'|'success'|'warn'|'danger'|'primary' = 'neutral';
  export let label = '';
</script>

<span class="badge" data-tone={tone} role="status" aria-label={label || tone}><slot /></span>

<style>
.badge{ padding:6px 10px;border-radius:999px;font-size:.82rem;border:1px solid rgba(255,255,255,.12);background:var(--bg-2)}
.badge[data-tone="primary"]{ background:rgba(111,60,255,.18) }
.badge[data-tone="info"]{ background:rgba(0,229,255,.16) }
.badge[data-tone="success"]{ background:rgba(70,227,139,.16) }
.badge[data-tone="warn"]{ background:rgba(255,179,0,.20) }
.badge[data-tone="danger"]{ background:rgba(255,93,93,.20) }
</style>
