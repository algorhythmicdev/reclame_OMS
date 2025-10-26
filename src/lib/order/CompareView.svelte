<script lang="ts">
  import { t } from 'svelte-i18n';
  import { diffKeyValues } from '$lib/diff/diff';

  export let headingKey = 'compare.heading';
  export let leftTitleKey = 'compare.before';
  export let rightTitleKey = 'compare.after';
  export let fieldLabelKey = 'compare.field';
  export let leftFields: { key: string; label?: string; value?: string }[] = [];
  export let rightFields: { key: string; label?: string; value?: string }[] = [];

  const toMap = (fields: { key: string; value?: string }[]) =>
    Object.fromEntries(fields.map((field) => [field.key, field.value]));

  $: leftMap = toMap(leftFields ?? []);
  $: rightMap = toMap(rightFields ?? []);
  $: labelMap = new Map<string, string>();
  $: [...leftFields, ...rightFields].forEach((field) => {
    if (field?.label) labelMap.set(field.key, field.label);
  });
  $: rows = diffKeyValues(leftMap, rightMap).map((row) => ({
    ...row,
    label: labelMap.get(row.key) || row.key
  }));
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{$t(headingKey)}</h3>
  {#if rows.length}
    <table class="rf-table">
      <thead>
        <tr>
          <th>{$t(fieldLabelKey)}</th>
          <th>{$t(leftTitleKey)}</th>
          <th>{$t(rightTitleKey)}</th>
        </tr>
      </thead>
      <tbody>
        {#each rows as row (row.key)}
          <tr data-changed={row.changed}>
            <td>{row.label}</td>
            <td>{row.before ?? ''}</td>
            <td>{row.after ?? ''}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="muted">{$t('compare.empty')}</div>
  {/if}
</div>

<style>
  .rf-table {
    width: 100%;
    border-collapse: collapse;
  }
  .rf-table th,
  .rf-table td {
    padding: 6px 8px;
    text-align: left;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
  tr[data-changed='true'] td {
    background: rgba(255, 179, 0, 0.14);
  }
</style>
