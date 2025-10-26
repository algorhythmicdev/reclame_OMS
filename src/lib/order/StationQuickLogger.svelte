<script lang="ts">
  import { t } from 'svelte-i18n';
  import Select from '$lib/ui/Select.svelte';
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';

  export let onSubmit: (payload: { station: string; progress?: number; note?: string }) => void = () => {};

  let station = 'SANDING';
  let progress = 0;
  let note = '';
  const progressId = 'station-quick-progress';

  const STATIONS = ['CAD', 'CNC', 'SANDING', 'BENDING', 'WELDING', 'PAINT', 'ASSEMBLY', 'QC', 'LOGISTICS'].map((code) => ({
    label: code,
    value: code
  }));

  function send() {
    onSubmit({
      station,
      progress: progress > 0 ? progress : undefined,
      note: note || undefined
    });
    progress = 0;
    note = '';
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{$t('station.quick_log_heading')}</h3>
  <div class="grid" style="grid-template-columns:1fr 1fr;gap:12px">
    <Select bind:value={station} options={STATIONS} ariaLabel={$t('station.station_label')} />
    <div>
      <label class="muted" for={progressId}>{$t('station.progress_label')}</label>
      <input id={progressId} class="rf-input" type="number" min="0" max="100" bind:value={progress} />
    </div>
    <div style="grid-column:span 2">
      <Input bind:value={note} placeholder={$t('station.quick_log_note_placeholder')} />
    </div>
  </div>
  <div class="row" style="margin-top:8px">
    <Button on:click={send}>{$t('station.log')}</Button>
  </div>
</div>
