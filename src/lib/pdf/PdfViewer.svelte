<script>
  import * as pdfjsLib from 'pdfjs-dist/build/pdf';
  import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs';
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker; export let src=''; let canvasEl; let pageNum=1; let pageCount=1; let scale=1.1;
  async function render(){ if(!src) return; const pdf=await pdfjsLib.getDocument(src).promise; pageCount=pdf.numPages; const page=await pdf.getPage(pageNum); const vp=page.getViewport({scale}); const ctx=canvasEl.getContext('2d'); canvasEl.height=vp.height; canvasEl.width=vp.width; await page.render({canvasContext:ctx,viewport:vp}).promise; }
  const prev=()=>{ if(pageNum>1){pageNum--; render();} }; const next=()=>{ if(pageNum<pageCount){pageNum++; render();} };
  $: src, render();
</script>
<div class="row" style="justify-content:space-between;margin-bottom:8px">
  <div class="row"><button class="tag" on:click={prev}>Prev</button><div class="tag">Page {pageNum} / {pageCount}</div><button class="tag" on:click={next}>Next</button></div>
  <div class="row"><button class="tag" on:click={()=>{scale=Math.max(.5,scale-.2);render();}}>-</button><div class="tag">{Math.round(scale*100)}%</div><button class="tag" on:click={()=>{scale=Math.min(3,scale+.2);render();}}>+</button></div>
</div>
<canvas bind:this={canvasEl} style="max-width:100%;border-radius:10px;border:1px solid rgba(255,255,255,.1)"></canvas>
