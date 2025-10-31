<script lang="ts">
  import { toasts, type Toast } from '$lib/stores/toast';
  let list: Toast[] = [];
const colors = {
  info: 'linear-gradient(90deg,var(--accent-2),var(--accent-1))',
  success: 'linear-gradient(90deg,var(--ok), color-mix(in oklab, var(--ok) 65%, #ffffff))',
  warning: 'linear-gradient(90deg,var(--warn), color-mix(in oklab, var(--warn) 70%, #ffffff))',
  error: 'linear-gradient(90deg,var(--danger), color-mix(in oklab, var(--danger) 65%, #ffffff))'
};
  $: $toasts, list = $toasts;
</script>

<style>
.wrap{position:fixed;right:16px;bottom:16px;display:grid;gap:10px;z-index:9999}
.box{min-width:280px;max-width:420px;border-radius:12px;padding:12px 14px;background:var(--bg-1);border:1px solid var(--border);box-shadow:0 6px 18px rgba(var(--shadow-rgb)/0.18)}
.title{font-weight:800}
.msg{opacity:.9;margin-top:4px}
.bar{height:4px;border-radius:999px;margin-top:8px;overflow:hidden}
</style>

<div id="rf-toasts" class="wrap" role="status" aria-live="polite" aria-atomic="true">
  {#each list as t (t.id)}
    <div class="box" data-kind={t.kind}>
      {#if t.title}<div class="title">{t.title}</div>{/if}
      <div class="msg">{t.message}</div>
      <div class="bar" style="background:{colors[t.kind || 'info']}"></div>
    </div>
  {/each}
</div>
