<script>
  const jobs=[{po:'PO-250375',client:'ABTB BIJEN',title:'4500mm Long Frame',due:'2025-10-26',progress:65,lane:'CNC → Sanding'},{po:'PO-250501',client:'Burger King',title:'Menu Lightbox',due:'2025-11-03',progress:25,lane:'CAD → CNC'},{po:'PO-250420',client:'KIA',title:'Pylon Letters',due:'2025-10-30',progress:80,lane:'Painting → Assembly'}];
  const kpi=[{label:'Active Orders',value:18},{label:'On-Time % (7d)',value:'92%'},{label:'Avg Lead Time',value:'4.3d'},{label:'Low Stock Items',value:3}];
</script>
<div class="kpi">{#each kpi as item}<div class="item"><div class="value">{item.value}</div><div class="muted">{item.label}</div></div>{/each}</div>
<div class="grid" style="grid-template-columns:2fr 1fr;margin-top:16px">
  <section class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">Active Jobs</h2><a class="btn" href="/orders">Open Orders</a></div>
    <div class="grid" style="margin-top:16px">{#each jobs as j}<div class="card" style="background:var(--bg-2)"><div class="row" style="justify-content:space-between"><div><div style="font-weight:800">{j.po} • {j.client}</div><div class="muted">{j.title} • Due {j.due} • {j.lane}</div></div><div style="min-width:240px"><div class="progress"><span style={`width:${j.progress}%`}></span></div><div class="muted" style="font-size:.8rem;text-align:right">{j.progress}%</div></div></div></div>{/each}</div>
  </section>
  <aside class="grid"><div class="card"><h3 style="margin-top:0">Notifications</h3><ul><li>✅ CNC finished for PO-250375</li><li>⚠️ Aluminum low in stock</li><li>🗓️ Load date approaching (Oct 26)</li></ul></div>
    <div class="card"><h3 style="margin-top:0">Material Stock</h3><div class="row"><span class="tag">Acrylic</span><span class="muted">OK</span></div><div class="row"><span class="tag">Aluminum</span><span style="color:#ffb300">Low</span></div><div class="row"><span class="tag">ACP</span><span class="muted">OK</span></div></div>
  </aside>
</div>
