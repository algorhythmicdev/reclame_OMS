<script lang="ts">
  import KpiCard from '$lib/ui/KpiCard.svelte';
  import ProgressBar from '$lib/ui/ProgressBar.svelte';
  import ApexCharts from 'svelte-apexcharts';
  import { Package, Factory, Truck, TimerReset } from 'lucide-svelte';

  const kpi = [
    { title: 'Active Orders', value: 18, icon: Package },
    { title: 'Stations Online', value: 7, icon: Factory },
    { title: 'Deliveries (7d)', value: 12, icon: Truck },
    { title: 'Avg Lead Time', value: '4.3d', icon: TimerReset }
  ];

  // Throughput line
  const lineOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    grid: { borderColor: 'rgba(255,255,255,.08)' },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
  };
  const lineSeries = [{ name: 'Jobs', data: [3, 5, 4, 6, 7, 2, 5] }];

  // Status doughnut
  const pieOptions = {
    labels: ['CAD', 'CNC', 'Sanding', 'Welding', 'Paint', 'Assembly', 'QC'],
    legend: { position: 'bottom' }
  };
  const pieSeries = [2, 3, 4, 2, 3, 2, 2];

  // Material stock bars
  const barOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6 } },
    xaxis: { categories: ['Aluminum', 'Acrylic', 'ACP', 'Paint', 'Vinyl'] }
  };
  const barSeries = [{ name: 'Qty', data: [22, 12, 58, 16, 40] }];

  const progress = [
    { label: 'PO-250375 – Long Frame', v: 65 },
    { label: 'PO-250420 – Pylon Letters', v: 80 },
    { label: 'PO-250501 – Menu Lightbox', v: 25 }
  ];
</script>

<div class="grid" style="grid-template-columns:repeat(4,1fr)">
  {#each kpi as x}
    <KpiCard title={x.title} value={x.value} icon={x.icon} />
  {/each}
</div>

<div class="grid" style="grid-template-columns:2fr 1fr; margin-top:16px">
  <section class="card">
    <h3 style="margin:0 0 6px 0">Weekly Throughput</h3>
    <ApexCharts type="line" options={lineOptions} series={lineSeries} height={260} />
  </section>

  <section class="card">
    <h3 style="margin:0 0 6px 0">Order Stages</h3>
    <ApexCharts type="donut" options={pieOptions} series={pieSeries} height={260} />
  </section>
</div>

<section class="card" style="margin-top:16px">
  <h3 style="margin:0 0 6px 0">Material Stock (key items)</h3>
  <ApexCharts type="bar" options={barOptions} series={barSeries} height={280} />
</section>

<section class="card" style="margin-top:16px">
  <h3 style="margin:0 0 12px 0">Active Orders Progress</h3>
  <div class="grid">
    {#each progress as p}
      <div>
        <div style="font-weight:700">{p.label}</div>
        <ProgressBar value={p.v} label="Progress" />
      </div>
    {/each}
  </div>
</section>
