<script>
  import { base } from '$app/paths';
  import PdfViewer from '$lib/pdf/PdfViewer.svelte';
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  let file = `${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`;
  let valid = true;
  async function check() {
    try {
      const res = await fetch(file, { method:'HEAD' });
      valid = res.ok;
    } catch {
      valid = false;
    }
  }
  $: file, check();
</script>

<div class="row" style="justify-content:space-between">
  <h2 style="margin:0">Files</h2>
  <div class="row" role="search">
    <div style="width:420px"><Input bind:value={file} ariaLabel="File path" /></div>
    <a class="tag" href={file} download>Download</a>
  </div>
</div>

{#if !valid}
  <div class="card" style="margin-top:10px;background:#3d1616">
    Cannot load file. Check path or upload to <code>static/files</code>.
  </div>
{/if}

<div class="card" style="margin-top:12px;background:var(--bg-2)">
  <PdfViewer src={file} />
</div>