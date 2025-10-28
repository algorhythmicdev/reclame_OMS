<script>
  import { onMount } from 'svelte';
  import { t } from 'svelte-i18n';

  export let src = '';
  let canvasEl;
  let pageNum = 1;
  let pageCount = 1;
  let scale = 1.1;
  let pdfjsLib;
  let mounted = false;
  let pdfDoc;
  let renderTask;
  let currentSrc = '';
  let loading = false;
  let error = '';
  let lastSrc = '';

  async function ensurePdf() {
    if (pdfjsLib) return;
    const [{ default: workerSrc }, pdfModule] = await Promise.all([
      import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url'),
      import('pdfjs-dist/legacy/build/pdf.mjs')
    ]);
    pdfjsLib = pdfModule;
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
  }

  async function render(forceReload = false) {
    if (!mounted || !src || !canvasEl) return;
    await ensurePdf();
    loading = true;
    error = '';
    try {
      if (forceReload || currentSrc !== src) {
        renderTask?.cancel();
        await pdfDoc?.destroy?.();
        const task = pdfjsLib.getDocument(src);
        pdfDoc = await task.promise;
        currentSrc = src;
        lastSrc = src;
        pageCount = pdfDoc.numPages;
        pageNum = 1;
      }

      const page = await pdfDoc.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const context = canvasEl.getContext('2d');
      canvasEl.height = viewport.height;
      canvasEl.width = viewport.width;
      renderTask?.cancel();
      renderTask = page.render({ canvasContext: context, viewport });
      await renderTask.promise;
      renderTask = undefined;
    } catch (err) {
      if (err?.name === 'RenderingCancelledException') {
        renderTask = undefined;
        return;
      }
      console.error('Unable to render PDF', err);
      error = $t('pdf.error');
      renderTask = undefined;
    } finally {
      loading = false;
    }
  }

  const prev = async () => {
    if (pageNum > 1) {
      pageNum--;
      await render();
    }
  };

  const next = async () => {
    if (pageNum < pageCount) {
      pageNum++;
      await render();
    }
  };

  onMount(() => {
    mounted = true;
    render(true);
    return () => {
      mounted = false;
      renderTask?.cancel();
      renderTask = undefined;
      currentSrc = '';
      lastSrc = '';
      pdfDoc?.destroy?.();
      pdfDoc = undefined;
      pdfjsLib = undefined;
    };
  });

  $: if (mounted && src && src !== lastSrc) {
    lastSrc = src;
    render(true);
  }
</script>
<div class="row" style="justify-content:space-between;margin-bottom:8px">
  <div class="row">
    <button class="tag" on:click={prev}>{$t('pdf.prev')}</button>
    <div class="tag">{$t('pdf.page', { current: pageNum, total: pageCount })}</div>
    <button class="tag" on:click={next}>{$t('pdf.next')}</button>
  </div>
  <div class="row">
    <button
      class="tag"
      on:click={async () => {
        scale = Math.max(0.5, scale - 0.2);
        await render();
      }}>-
    </button>
    <div class="tag">{Math.round(scale * 100)}%</div>
    <button
      class="tag"
      on:click={async () => {
        scale = Math.min(3, scale + 0.2);
        await render();
      }}>+
    </button>
  </div>
</div>
{#if error}
  <div class="tag tag-error" style="margin-bottom:8px">{error}</div>
{/if}
<canvas
  class="viewer"
  bind:this={canvasEl}
  aria-busy={loading}
></canvas>

<style>
.tag-error{
  background: color-mix(in oklab, var(--danger) 18%, transparent);
  color: var(--danger);
  border-color: color-mix(in oklab, var(--danger) 40%, transparent);
}
.viewer{
  width:100%;
  height:auto;
  border-radius:12px;
  border:1px solid color-mix(in oklab,var(--border) 85%, transparent);
  background:var(--bg-0);
}
</style>
