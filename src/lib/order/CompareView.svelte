<script lang="ts">
  import { STATE_LABEL } from '$lib/order/stages';
  import { TERMS } from '$lib/order/names';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';
  export let leftTitle = 'Current';
  export let rightTitle = 'Proposed';
  export let leftFields: { key:string; label?:string; value?:string }[] = [];
  export let rightFields: { key:string; label?:string; value?:string }[] = [];
  export let leftMaterials: { key:string; label?:string; value?:string }[] = [];
  export let rightMaterials: { key:string; label?:string; value?:string }[] = [];
  export let leftStages: Record<string, string> = {};
  export let rightStages: Record<string, string> = {};

  type FieldEntry = { label?: string; value: string | undefined };
  function map(arr: { key: string; label?: string; value?: string }[]){
    const result: Record<string, FieldEntry> = {};
    for (const item of arr) {
      result[item.key] = { label: item.label, value: item.value };
    }
    return result;
  }
  function keys(a:Record<string,any>, b:Record<string,any>){
    return [...new Set([...Object.keys(a), ...Object.keys(b)])];
  }
  $: fL = map(leftFields);    $: fR = map(rightFields);
  $: mL = map(leftMaterials); $: mR = map(rightMaterials);

  function row(
    key:string,
    a: FieldEntry | undefined,
    b: FieldEntry | undefined
  ){
    const left = a?.value;
    const right = b?.value;
    const changed = left !== right;
    const label = a?.label || b?.label || key;
    return { key, label, a: left, b: right, changed };
  }
  $: rowsFields    = keys(fL, fR).map(k => row(k, fL[k], fR[k]));
  $: rowsMaterials = keys(mL, mR).map(k => row(k, mL[k], mR[k]));
  function stageRow(key: string, left?: string, right?: string) {
    const normalize = (value?: string) => value ?? 'NOT_STARTED';
    const a = normalize(left);
    const b = normalize(right);
    const changed = a !== b;
    const label = TERMS.stations?.[key as keyof typeof TERMS.stations] ?? key;
    return { key, label, a, b, changed };
  }
  $: rowsStages = keys(leftStages, rightStages).map((k) => stageRow(k, leftStages[k], rightStages[k]));
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Compare</h3>

  <h4>Fields</h4>
  <table class="rf-table">
    <thead><tr><th>Field</th><th>{leftTitle}</th><th>{rightTitle}</th></tr></thead>
    <tbody>
      {#each rowsFields as r}
        <tr data-changed={r.changed}><td>{r.label}</td><td>{r.a ?? ''}</td><td>{r.b ?? ''}</td></tr>
      {/each}
    </tbody>
  </table>

  <h4 style="margin-top:12px">Materials</h4>
  <table class="rf-table">
    <thead><tr><th>Item</th><th>{leftTitle}</th><th>{rightTitle}</th></tr></thead>
    <tbody>
      {#each rowsMaterials as r}
        <tr data-changed={r.changed}><td>{r.label}</td><td>{r.a ?? ''}</td><td>{r.b ?? ''}</td></tr>
      {/each}
    </tbody>
  </table>

  <h4 style="margin-top:12px">Stages</h4>
  <table class="rf-table">
    <thead><tr><th>Stage</th><th>{leftTitle}</th><th>{rightTitle}</th></tr></thead>
    <tbody>
      {#each rowsStages as r}
        <tr data-changed={r.changed}>
          <td>{r.label}</td>
          <td>{get(t)(`stages.${r.a}`)}</td>
          <td>{get(t)(`stages.${r.b}`)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
tr[data-changed="true"] td { background: color-mix(in oklab, var(--warn) 18%, transparent); }
</style>
