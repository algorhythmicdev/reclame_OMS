<script lang="ts">
  import { toasts, type Toast } from '$lib/stores/toast';
  let list: Toast[] = [];
  const colors = {
    info: 'linear-gradient(90deg,var(--brand-cyan),#8adfff)',
    success: 'linear-gradient(90deg,#46e38b,#b1ffdb)',
    warning: 'linear-gradient(90deg,var(--brand-amber),#ffe7a8)',
    error: 'linear-gradient(90deg,#ff5d5d,#ffb1b1)'
  };
  $: $toasts, list = $toasts;
</script>

<style>
.wrap{position:fixed;right:16px;bottom:16px;display:grid;gap:10px;z-index:9999}
.box{min-width:280px;max-width:420px;border-radius:12px;padding:12px 14px;background:var(--bg-1);border:1px solid rgba(255,255,255,.08)}
.title{font-weight:800}
.msg{opacity:.9;margin-top:4px}
.bar{height:4px;border-radius:999px;margin-top:8px;overflow:hidden}
</style>

<div class="wrap" role="status" aria-live="polite">
  {#each list as t (t.id)}
    <div class="box" data-kind={t.kind}>
      {#if t.title}<div class="title">{t.title}</div>{/if}
      <div class="msg">{t.message}</div>
      <div class="bar" style="background:{colors[t.kind || 'info']}"></div>
    </div>
  {/each}
</div>