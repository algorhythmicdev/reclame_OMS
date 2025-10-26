<script lang="ts">
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  import type { StationLog } from './types.signage';
  import { TERMS } from './names';

  export let onCreate: (title:string, changes: StationLog['changes'], message?:string)=>void = ()=>{};
  const dueId = 'change-request-due';
  const sandingId = 'change-request-sanding';
  let title = ''; let message = '';
  let due = ''; let sanding = 0; let note = '';

  function submit(){
    const changes: StationLog['changes'] = {};
    if (due) changes.due = due;
    if (sanding>0) changes.progress = { SANDING: sanding };
    if (note) {
      const fields = [{ key:'station_note', label:'Station Note', value: note }];
      changes.fields = fields;
    }
    onCreate(title || TERMS.changeRequest, changes, message || undefined);
    title=''; message=''; due=''; sanding=0; note='';
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Create {TERMS.changeRequest}</h3>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <Input bind:value={title} placeholder="Title" />
    <Input bind:value={message} placeholder="Message (optional)" />
    <div>
      <label class="muted" for={dueId}>New due date</label>
      <input id={dueId} class="rf-input" type="date" bind:value={due} />
    </div>
    <div>
      <label class="muted" for={sandingId}>Sanding progress (%)</label>
      <input id={sandingId} class="rf-input" type="number" min="0" max="100" bind:value={sanding} />
    </div>
    <div style="grid-column:span 2"><Input bind:value={note} placeholder="Station note" /></div>
  </div>
  <div class="row" style="margin-top:8px"><Button on:click={submit}>Submit</Button></div>
</div>
