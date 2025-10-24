<script>
  import DataTable from '$lib/ui/DataTable.svelte';
  import Input from '$lib/ui/Input.svelte';
  let q = '';
  const cols = [
    { key: 'id', label: 'PO', width: '140px' },
    { key: 'client', label: 'Client' },
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status', width: '120px' },
    { key: 'due', label: 'Due', width: '120px' }
  ];
  const orders = [
    { id:'PO-250375', client:'ABTB BIJEN', title:'4500mm Long Frame', status:'Sanding', due:'2025-10-26' },
    { id:'PO-250420', client:'KIA', title:'Pylon Letters', status:'Painting', due:'2025-10-30' },
    { id:'PO-250501', client:'Burger King', title:'Menu Lightbox', status:'CAD', due:'2025-11-03' },
  ];
</script>

<section class="card">
  <div class="row" style="justify-content:space-between">
    <h2 style="margin:0">Orders</h2>
    <div style="width:280px"><Input bind:value={q} placeholder="Filter by client…" ariaLabel="Filter" /></div>
  </div>
  <div style="margin-top:12px">
    <DataTable {columns}={cols} {rows}={orders} filterKey="client" filterText={q} />
  </div>
</section>