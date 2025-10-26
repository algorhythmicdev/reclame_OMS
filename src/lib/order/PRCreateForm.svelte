<script lang="ts">
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  import type { Commit } from './types';

  export let onCreate: (title:string, changes: Commit['changes'], message?:string)=>void = ()=>{};
  let title = ''; let message = '';
  // minimal form: propose due date or a progress bump
  let due = ''; let sanding = 0;
  const dueId = 'pr-due';
  const sandingId = 'pr-sanding';

  function submit(){
    const changes: Commit['changes'] = {};
    if (due) changes.due = due;
    if (sanding>0) changes.progress = { SANDING: sanding };
    onCreate(title || 'Station update', changes, message || undefined);
    title=''; message=''; due=''; sanding=0;
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Propose Change (PR)</h3>
  <div class="grid" style="grid-template-columns:1fr 1fr">
    <Input bind:value={title} placeholder="PR title" />
    <Input bind:value={message} placeholder="Message (optional)" />
    <div>
      <label class="muted" for={dueId}>New due date</label>
      <input id={dueId} class="rf-input" type="date" bind:value={due} />
    </div>
    <div>
      <label class="muted" for={sandingId}>Sanding progress (%)</label>
      <input id={sandingId} class="rf-input" type="number" min="0" max="100" bind:value={sanding} />
    </div>
  </div>
  <div class="row" style="margin-top:8px"><Button on:click={submit}>Create PR</Button></div>
</div>
