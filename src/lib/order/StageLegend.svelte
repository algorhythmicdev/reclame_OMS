<script lang="ts">
  import { STATE_TONE, STATIONS, type StageCycle, type StageMap, type StationTag } from './stages';
  import { TERMS } from '$lib/order/names';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';
  import Badge from '$lib/ui/Badge.svelte';

  export let stages: StageMap = {} as StageMap;
  export let cycles: StageCycle[] = [];

  function count(station: StationTag) {
    return cycles.filter((cycle) => cycle.station === station).length;
  }

  function detail(station: StationTag) {
    const translate = get(t);
    return cycles
      .filter((cycle) => cycle.station === station)
      .map((cycle) => {
        const label = translate(`rework.reasons.${cycle.reason}`);
        const suffix = cycle.note ? ` – ${cycle.note}` : '';
        return `${cycle.idx}. ${label}${suffix}`;
      })
      .join('\n');
  }

  const stationLabel = (station: StationTag) =>
    TERMS.stations[station as keyof typeof TERMS.stations] ?? station;
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Process</h3>
  <ul class="list">
    {#each STATIONS as station}
      {@const state = stages?.[station] ?? 'NOT_STARTED'}
      <li class="row" style="justify-content:space-between; align-items:center">
        <span class="row" style="gap:6px">
          <b>{stationLabel(station)}</b>
          {#if count(station) > 0}
            <span class="tag badge-warn" title={detail(station)}>x{count(station)} {$t('rework.x_repeat')}</span>
          {/if}
        </span>
        <Badge tone={STATE_TONE[state]}>{get(t)(`stages.${state}`)}</Badge>
      </li>
    {/each}
  </ul>
</div>

<style>
.list{
  display:grid;
  gap:8px;
  padding:0;
  margin:0;
  list-style:none;
}
</style>
