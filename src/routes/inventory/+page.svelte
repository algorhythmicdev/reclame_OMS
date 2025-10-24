<script>
  let items=[{sku:'ALU-3MM',name:'Aluminum sheet 3mm',qty:22,min:20},{sku:'ACP-3MM',name:'ACP 3mm',qty:58,min:30},{sku:'ACR-3MM',name:'Acrylic 3mm white',qty:12,min:25}];
  $: status=items.map(i=>({...i,ok:i.qty>=i.min}));
</script>
<section class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Inventory</h2><button class="tag" disabled>Add item</button></div>
  <div class="grid" style="margin-top:12px">{#each status as i}<div class="card" style="background:var(--bg-2)"><div class="row" style="justify-content:space-between">
    <div><b>{i.sku}</b> — {i.name}</div><div class="row"><span class="tag">Qty {i.qty}</span><span class="tag">Min {i.min}</span><span class="tag" style="background:{i.ok?'#163d2b':'#3d1616'}">{i.ok?'OK':'LOW'}</span></div>
  </div></div>{/each}</div>
</section>
