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
  import { t } from 'svelte-i18n';

  const orders = listOrders();
  const metrics = summarize(orders);

  const stationKeys = Object.keys(TERMS.stations) as Station[];
  const stationLabel = (code: Station) => $t(TERMS.stations[code]);
  const stageLabel = (state: string) => $t(STATE_LABEL[state as keyof typeof STATE_LABEL]);

  const kpi = [
    { titleKey: 'dashboard.kpi.active', value: metrics.total, icon: Package },
    { titleKey: 'dashboard.kpi.rd', value: metrics.rd, icon: TimerReset },
    { titleKey: 'dashboard.kpi.blocked', value: metrics.blocked, icon: Factory },
    { titleKey: 'dashboard.kpi.rework', value: metrics.reworks, icon: Truck }
  ];

  const dayKeys = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
  const pieStationKeys: Station[] = ['CAD', 'CNC', 'SANDING', 'WELDING', 'PAINT', 'ASSEMBLY', 'QC'];

  const baseLineOptions = {
    chart: { type: 'line', toolbar: { show: false } },
    stroke: { curve: 'smooth', width: 3 }
  };
  $: lineOptions = withTheme(
    {
      ...baseLineOptions,
      xaxis: { categories: dayKeys.map((key) => $t(`calendar.days.${key}`)) }
    },
    $themeStore
  );
  $: lineSeries = [{ name: $t('dashboard.series.jobs'), data: [3, 5, 4, 6, 7, 2, 5] }];

  const basePieOptions = {
    legend: { position: 'bottom' }
  };
  $: pieOptions = withTheme(
    {
      ...basePieOptions,
      labels: pieStationKeys.map((code) => stationLabel(code))
    },
    $themeStore
  );
  const pieSeries = [2, 3, 4, 2, 3, 2, 2];

  const baseBarOptions = {
    chart: { type: 'bar', toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6 } },
    xaxis: { categories: ['Aluminum', 'Acrylic', 'ACP', 'Paint', 'Vinyl'] }
  };
  $: barOptions = withTheme(baseBarOptions, $themeStore);
  $: barSeries = [{ name: $t('dashboard.series.qty'), data: [22, 12, 58, 16, 40] }];

  $: topReworkEntry = Object.entries(metrics.reworkCounts).sort((a, b) => b[1] - a[1])[0];
  $: topReworkLabel = topReworkEntry && topReworkEntry[1] > 0
    ? `${stationLabel(topReworkEntry[0] as Station)} · ${topReworkEntry[1]}`
    : $t('dashboard.topRework.none');

  function statusFromOrder(order: Order): string {
    const stages = order.stages ?? {};
    const pending = stationKeys.find((station) => stages[station] !== 'COMPLETED');
    if (!pending) return $t(STATE_LABEL.COMPLETED);
    const state = stages[pending] ?? 'NOT_STARTED';
    return `${stationLabel(pending)} · ${stageLabel(state)}`;
  }

  const stageSummary = orders.map((order) => ({
    label: `${order.id} – ${order.title}`,
    state: statusFromOrder(order)
  }));
</script>

<div class="grid" style="grid-template-columns:repeat(4,1fr)">
  {#each kpi as x}
    <KpiCard title={$t(x.titleKey)} value={x.value} icon={x.icon} />
  {/each}
</div>

<div class="grid" style="grid-template-columns:2fr 1fr; margin-top:16px">
  <section class="card">
    <h3 style="margin:0 0 6px 0">{$t('dashboard.charts.throughput')}</h3>
    <ApexCharts type="line" options={lineOptions} series={lineSeries} height={260} />
  </section>

  <section class="card">
    <h3 style="margin:0 0 6px 0">{$t('dashboard.charts.stages')}</h3>
    <ApexCharts type="donut" options={pieOptions} series={pieSeries} height={260} />
  </section>
</div>

<section class="card" style="margin-top:16px">
  <h3 style="margin:0 0 6px 0">{$t('dashboard.charts.materials')}</h3>
  <p class="muted" style="margin:0 0 10px 0">{$t('dashboard.topRework.label')}: {topReworkLabel}</p>
  <ApexCharts type="bar" options={barOptions} series={barSeries} height={280} />
</section>

<section class="card" style="margin-top:16px">
  <h3 style="margin:0 0 12px 0">{$t('dashboard.list.title')}</h3>
  <div class="grid">
    {#each stageSummary as item}
      <div>
        <div style="font-weight:700">{item.label}</div>
        <div class="muted">{item.state}</div>
      </div>
    {/each}
  </div>
</section>
