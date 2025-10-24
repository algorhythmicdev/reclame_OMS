<script>
  import { base } from '$app/paths';
  import { page } from '$app/stores';
  import Stepper from '$lib/ui/Stepper.svelte';
  $: id=$page.params.id;
  const chatHref = `${base}/chat`;
  const sample={'PO-250375':{client:'ABTB BIJEN',title:'4500mm Long Frame',due:'2025-10-26',progress:65,
    materials:[{part:'Face',material:'Acrylic',thickness:'3mm',color:'White'},{part:'Back',material:'ACP',thickness:'3mm',color:'Brushed aluminum'},{part:'Face Frame',material:'Aluminum',thickness:'2mm',color:'Natural'}],
    file:`${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`,steps:[{name:'CAD',done:true},{name:'CNC',done:true},{name:'Sanding',done:false},{name:'Welding',done:false},{name:'Painting',done:false},{name:'Assembly',done:false},{name:'QC',done:false}]}};
  $: data = sample[id] ?? { client:'Unknown', title:'Order', due:'', progress:0, materials:[], steps:[], file:'' };
</script>
<section class="grid" style="grid-template-columns:1.5fr 1fr;align-items:start">
  <div class="card"><div class="row" style="justify-content:space-between"><h2 style="margin:0">{id} • {data.client}</h2><span class="tag">Due {data.due}</span></div>
    <div class="progress" style="margin-top:8px"><span style={`width:${data.progress}%`}></span></div>
    <div class="grid" style="grid-template-columns:1fr 1fr;margin-top:16px">
      <div><h3>Materials</h3><ul>{#each data.materials as m}<li>{m.part}: {m.material} {m.thickness} • {m.color}</li>{/each}</ul></div>
      <div><h3>Steps</h3>
        <Stepper steps={data.steps} />
      </div>
    </div>
    {#if data.file}
      <div class="card" style="margin-top:16px;background:var(--bg-2)">
        <h3>Source PDF</h3>
        <iframe
          src={data.file}
          title={`Preview of ${data.title ?? 'source document'}`}
          style="width:100%;height:420px;border:1px solid rgba(255,255,255,.1);border-radius:10px"
        ></iframe>
      </div>
    {/if}
  </div>
  <aside class="grid"><div class="card"><h3>Comments</h3><p class="muted">Mocked chat for this order. See <a href={chatHref}>global chat</a>.</p></div>
    <div class="card"><h3>Quick Actions</h3><div class="row"><button class="tag">Mark step done</button><button class="tag">Notify team</button></div></div></aside>
</section>
