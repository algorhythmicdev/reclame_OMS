<script lang="ts">
  export let leftTitle = 'Current';
  export let rightTitle = 'Proposed';
  export let leftFields: { key:string; label?:string; value?:string }[] = [];
  export let rightFields: { key:string; label?:string; value?:string }[] = [];
  export let leftMaterials: { key:string; label?:string; value?:string }[] = [];
  export let rightMaterials: { key:string; label?:string; value?:string }[] = [];
  export let leftProgress: Record<string, number> = {};
  export let rightProgress: Record<string, number> = {};

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
  function progressRow(key: string, left?: number, right?: number) {
    const toNumber = (value?: number) =>
      typeof value === 'number' && Number.isFinite(value) ? value : 0;
    const a = toNumber(left);
    const b = toNumber(right);
    const changed = a !== b;
    return { key, label: key, a, b, changed };
  }
  $: rowsProgress  = keys(leftProgress, rightProgress).map(k => progressRow(k, leftProgress[k], rightProgress[k]));
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

  <h4 style="margin-top:12px">Progress</h4>
  <table class="rf-table">
    <thead><tr><th>Stage</th><th>{leftTitle}</th><th>{rightTitle}</th></tr></thead>
    <tbody>
      {#each rowsProgress as r}
        <tr data-changed={r.changed}><td>{r.label}</td><td>{r.a}%</td><td>{r.b}%</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
tr[data-changed="true"] td { background: rgba(255,179,0,.14); }
</style>
