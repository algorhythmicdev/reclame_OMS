<script lang="ts">
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  import type { StationLog } from './types.signage';
  import { t } from 'svelte-i18n';
  import { get } from 'svelte/store';

  export let onCreate: (title:string, changes: StationLog['changes'], message?:string)=>void = ()=>{};
  const dueId = 'change-request-due';
  const sandingId = 'change-request-sanding';
  let title = ''; let message = '';
  let due = ''; let sanding = 0; let note = '';

  function submit(){
    const translate = get(t);
    const changes: StationLog['changes'] = {};
    if (due) changes.due = due;
    if (sanding>0) changes.progress = { SANDING: sanding };
    if (note) {
      const fields = [{ key:'station_note', label: translate('order.station_note'), value: note }];
      changes.fields = fields;
    }
    onCreate(title || translate('terms.changeRequest'), changes, message || undefined);
    title=''; message=''; due=''; sanding=0; note='';
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{$t('order.create_change_request')}</h3>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <Input bind:value={title} placeholder={$t('order.title_placeholder')} />
    <Input bind:value={message} placeholder={$t('order.message_optional_placeholder')} />
    <div>
      <label class="muted" for={dueId}>{$t('order.new_due_date')}</label>
      <input id={dueId} class="rf-input" type="date" bind:value={due} />
    </div>
    <div>
      <label class="muted" for={sandingId}>{$t('order.sanding_progress')}</label>
      <input id={sandingId} class="rf-input" type="number" min="0" max="100" bind:value={sanding} />
    </div>
    <div style="grid-column:span 2"><Input bind:value={note} placeholder={$t('order.station_note')} /></div>
  </div>
  <div class="row" style="margin-top:8px"><Button on:click={submit}>{$t('order.submit')}</Button></div>
</div>
