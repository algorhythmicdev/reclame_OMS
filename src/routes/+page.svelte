<script lang="ts">
  import KpiCard from '$lib/ui/KpiCard.svelte';
  import ApexCharts from 'svelte-apexcharts';
  import { theme as themeStore } from '$lib/stores/theme';
  import { withTheme } from '$lib/charts/theme';
  import { Package, Factory, Truck, TimerReset } from 'lucide-svelte';
  import { listOrders } from '$lib/order/signage-store';
  import { summarize } from '$lib/metrics/order-metrics';
  import type { Order, Station } from '$lib/order/types';
  import { TERMS } from '$lib/order/names';
  import { STATE_LABEL } from '$lib/order/stages';

  const orders = listOrders();
  const metrics = summarize(orders);

  const stationLabels: Record<Station, string> = {
    CAD: TERMS.stations.CAD,
    CNC: TERMS.stations.CNC,
    SANDING: TERMS.stations.SANDING,
    BENDING: TERMS.stations.BENDING,
    WELDING: TERMS.stations.WELDING,
    PAINT: TERMS.stations.PAINT,
    ASSEMBLY: TERMS.stations.ASSEMBLY,
    QC: TERMS.stations.QC,
    LOGISTICS: TERMS.stations.LOGISTICS
  };

  const topReworkEntry = Object.entries(metrics.reworkCounts).sort((a, b) => b[1] - a[1])[0];
  const topReworkLabel = topReworkEntry && topReworkEntry[1] > 0
    ? `${stationLabels[topReworkEntry[0] as Station]} · ${topReworkEntry[1]}`
    : 'None';

  const kpi = [
    { title: 'Active Orders', value: metrics.total, icon: Package },
    { title: 'R&D Orders', value: metrics.rd, icon: TimerReset },
    { title: 'Blocked Orders', value: metrics.blocked, icon: Factory },
    { title: 'Total Reworks', value: metrics.reworks, icon: Truck }
  ];

  const baseLineOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] }
  };
  $: lineOptions = withTheme(baseLineOptions, $themeStore);
  const lineSeries = [{ name: 'Jobs', data: [3, 5, 4, 6, 7, 2, 5] }];

  const basePieOptions = {
    labels: ['CAD', 'CNC', 'Sanding', 'Welding', 'Paint', 'Assembly', 'QC'],
    legend: { position: 'bottom' }
  };
  $: pieOptions = withTheme(basePieOptions, $themeStore);
  const pieSeries = [2, 3, 4, 2, 3, 2, 2];

  const baseBarOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6 } },
    xaxis: { categories: ['Aluminum', 'Acrylic', 'ACP', 'Paint', 'Vinyl'] }
  };
  $: barOptions = withTheme(baseBarOptions, $themeStore);
  const barSeries = [{ name: 'Qty', data: [22, 12, 58, 16, 40] }];

  function statusFromOrder(order: Order): string {
    const stages = order.stages ?? {};
    const stations = Object.keys(stationLabels) as Station[];
    const pending = stations.find((station) => stages[station] !== 'COMPLETED');
    if (!pending) return 'Completed';
    const state = stages[pending] ?? 'NOT_STARTED';
    return `${stationLabels[pending]} · ${STATE_LABEL[state as keyof typeof STATE_LABEL]}`;
  }

  const stageSummary = orders.map((order) => ({
    label: `${order.id} – ${order.title}`,
    state: statusFromOrder(order)
  }));
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
  <p class="muted" style="margin:0 0 10px 0">Top rework station: {topReworkLabel}</p>
  <ApexCharts type="bar" options={barOptions} series={barSeries} height={280} />
</section>

<section class="card" style="margin-top:16px">
  <h3 style="margin:0 0 12px 0">Active Orders</h3>
  <div class="grid">
    {#each stageSummary as item}
      <div>
        <div style="font-weight:700">{item.label}</div>
        <div class="muted">{item.state}</div>
      </div>
    {/each}
  </div>
</section>
