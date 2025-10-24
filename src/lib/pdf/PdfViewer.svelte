<script>
  import { onMount } from 'svelte';
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
      error = 'Unable to display PDF. Please check the file path.';
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
    <button class="tag" on:click={prev}>Prev</button>
    <div class="tag">Page {pageNum} / {pageCount}</div>
    <button class="tag" on:click={next}>Next</button>
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
  <div class="tag" style="margin-bottom:8px;color:#f87171;background:rgba(248,113,113,.12)">{error}</div>
{/if}
<canvas
  bind:this={canvasEl}
  aria-busy={loading}
  style="max-width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.1)"
></canvas>
