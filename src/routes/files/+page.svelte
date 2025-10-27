<script>
  import { base } from '$app/paths';
import PdfFrame from '$lib/pdf/PdfFrame.svelte';
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
  <div class="card file-error" style="margin-top:10px">
    Cannot load file. Check path or upload to <code>static/files</code>.
  </div>
{/if}

<div style="margin-top:12px">
  <PdfFrame src={file} />
</div>

<style>
.file-error{
  background: color-mix(in oklab, var(--danger) 12%, var(--bg-1));
  color: var(--danger);
  border-color: color-mix(in oklab, var(--danger) 35%, transparent);
}
</style>
