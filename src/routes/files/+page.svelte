<script>
  import PdfViewer from '$lib/pdf/PdfViewer.svelte';
  let file = '/files/PO-250375_ABTB-BIJEN_4500mm.pdf';
</script>

<section class="card">
  <div class="row" style="justify-content:space-between">
    <h2 style="margin:0">Files</h2>
    <div class="row">
      <input class="tag" style="background:var(--bg-2)" bind:value={file} size="48" />
      <button class="tag" on:click={()=>{}}>Open</button>
    </div>
  </div>
  <div class="card" style="margin-top:12px;background:var(--bg-2)">
    <PdfViewer src={file} />
  </div>
</section>
