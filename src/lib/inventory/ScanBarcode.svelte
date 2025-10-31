<script lang="ts">
  import { updateItem, findItemBySku } from './store';
  
  let video: HTMLVideoElement; 
  let code=''; 
  let on=false;
  
  async function start(){
    try {
      const s = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}});
      video.srcObject=s; 
      await video.play(); 
      on=true;
    } catch (err) {
      alert('Camera access denied or not available');
    }
    // placeholder: no real decoder here—attach your decoder later. Allow manual code entry meanwhile.
  }
  
  function store(){
    if(!code.trim()) return;
    const item = findItemBySku(code);
    if(item){ 
      updateItem(item.id, { stock: item.stock + 1 }); 
      alert(`Added +1 stock for ${item.name} (${item.sku})`);
    } else {
      alert(`Item not found: ${code}`);
    }
    code='';
  }
</script>

<section class="card">
  <h3>Scan barcode (mock)</h3>
  <video bind:this={video} playsinline style="width:100%;max-height:40vh;border-radius:12px;border:1px solid var(--border)"></video>
  <div class="row" style="gap:6px;margin-top:8px">
    <button class="tag" on:click={start}>Start camera</button>
    <input placeholder="Type SKU…" bind:value={code}>
    <button class="tag" on:click={store}>Apply</button>
  </div>
</section>

<style>
input {
  flex: 1;
  background: var(--bg-0);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 8px;
  color: var(--text);
}
</style>
