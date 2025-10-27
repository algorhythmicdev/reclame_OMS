<script lang="ts">
  import PdfViewer from '$lib/pdf/PdfViewer.svelte';
  export let src = '';
</script>

<div class="pdf-frame card">
  <div class="frame-head">
    <strong>PDF</strong>
    {#if src}
      <a class="tag" href={src} target="_blank" rel="noreferrer">Open</a>
    {/if}
  </div>
  {#if src}
    <PdfViewer {src} />
  {:else}
    <div class="placeholder muted">Add a PDF path to preview.</div>
  {/if}
</div>

<style>
.pdf-frame{
  padding:0;
  display:flex;
  flex-direction:column;
  gap:0;
}
.frame-head{
  display:flex;
  justify-content:space-between;
  align-items:center;
  padding:8px 10px;
  border-bottom:1px solid var(--border);
  background:var(--bg-2);
}
.placeholder{
  padding:16px;
}
</style>
