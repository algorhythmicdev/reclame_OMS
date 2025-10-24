<script>
  import { onMount } from 'svelte';
  import * as pdfjsLib from 'pdfjs-dist/build/pdf';
  import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

  export let src = '';
  let canvasEl;
  let pageNum = 1;
  let pageCount = 1;
  let scale = 1.2;

  async function render(){
    if(!src) return;
    const loadingTask = pdfjsLib.getDocument(src);
    const pdf = await loadingTask.promise;
    pageCount = pdf.numPages;
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = canvasEl;
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport }).promise;
  }

  function prev(){ if(pageNum>1){pageNum--; render();} }
  function next(){ if(pageNum<pageCount){pageNum++; render();} }

  $: src, render();
</script>

<div class="row" style="justify-content:space-between;margin-bottom:8px">
  <div class="row">
    <button class="tag" on:click={prev}>Prev</button>
    <div class="tag">Page {pageNum} / {pageCount}</div>
    <button class="tag" on:click={next}>Next</button>
  </div>
  <div class="row">
    <button class="tag" on:click={()=>{scale=Math.max(.5,scale-.2);render();}}>-</button>
    <div class="tag">{Math.round(scale*100)}%</div>
    <button class="tag" on:click={()=>{scale=Math.min(3,scale+.2);render();}}>+</button>
  </div>
</div>
<canvas bind:this={canvasEl} style="max-width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.1)"></canvas>
