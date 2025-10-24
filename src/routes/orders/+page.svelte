<script>
  const orders=[{id:'PO-250375',client:'ABTB BIJEN',title:'4500mm Long Frame',status:'Sanding',due:'2025-10-26'},{id:'PO-250420',client:'KIA',title:'Pylon Letters',status:'Painting',due:'2025-10-30'},{id:'PO-250501',client:'Burger King',title:'Menu Lightbox',status:'CAD',due:'2025-11-03'}];
</script>
<section class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Orders</h2><a class="btn" href="/calendar">Open Calendar</a></div>
  <div class="grid" style="margin-top:12px">{#each orders as o}<div class="card" style="background:var(--bg-2)"><div class="row" style="justify-content:space-between">
    <div><div style="font-weight:800">{o.id} • {o.client}</div><div class="muted">{o.title}</div></div><div class="row"><span class="tag">{o.status}</span><a class="tag" href={'/orders/'+o.id}>Open</a></div>
  </div></div>{/each}</div>
</section>
