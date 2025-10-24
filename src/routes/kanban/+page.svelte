<script>
  import Kanban from '$lib/ui/Kanban.svelte';
  const lanes = [
    { name:'CAD', items:[{id:'1',title:'PO-250501 – Menu LB'}] },
    { name:'CNC', items:[{id:'2',title:'PO-250375 – Long Frame'}] },
    { name:'Sanding', items:[{id:'3',title:'PO-250420 – Pylon'}] },
    { name:'Paint', items:[] },
    { name:'Assembly', items:[] }
  ];
</script>

<section class="card">
  <h2 style="margin-top:0">Production Board</h2>
  <Kanban {lanes} />
</section>