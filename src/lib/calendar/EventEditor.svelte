<script lang="ts">
  import { upsertLoad } from '$lib/state/loads';
  export let dateISO: string;                 // yyyy-mm-dd
  export let event: any = null;               // edit path
  export let presetKind:'loading'|'meeting'|'note'='loading';
  export let onClose = () => {};

  let kind = event?.kind ?? presetKind;
  let carrier = event?.carrier ?? '';
  let title   = event?.title ?? '';
  let time    = event?.time  ?? '09:00';
  let place   = event?.place ?? '';
  let notes   = event?.notes ?? '';

  function save() {
    if(kind==='loading') upsertLoad({ id: dateISO, carrier, notes });
    // (meeting/note would write to a separate mock store as needed)
    if (onClose) onClose();
    else dispatchEvent(new CustomEvent('close'));
  }
</script>

<div class="sheet" role="dialog" aria-modal="true" aria-label="Event">
  <div class="card">
    <div class="row" style="justify-content:space-between;align-items:center">
      <strong>{event ? 'Edit' : 'Create'} — {dateISO}</strong>
      <button class="tag ghost" on:click={()=>onClose ? onClose() : dispatchEvent(new CustomEvent('close'))}>Close</button>
    </div>

    <label>Type
      <select bind:value={kind}>
        <option value="loading">Loading</option>
        <option value="meeting">Meeting</option>
        <option value="note">Note</option>
      </select>
    </label>

    {#if kind==='loading'}
      <label>Carrier <input bind:value={carrier} placeholder="DHL / Own truck"/></label>
      <label>Notes <textarea rows="3" bind:value={notes}/></label>
    {:else}
      <label>Title <input bind:value={title} placeholder="Project sync / Site visit"/></label>
      <div class="row" style="gap:6px">
        <label>Time <input type="time" bind:value={time}></label>
        <label>Location <input bind:value={place} placeholder="Workshop / Customer site"/></label>
      </div>
      <label>Notes <textarea rows="3" bind:value={notes}/></label>
    {/if}

    <div class="row" style="justify-content:flex-end;gap:8px;margin-top:8px">
      <button class="tag ghost" on:click={()=>onClose ? onClose() : dispatchEvent(new CustomEvent('close'))}>Cancel</button>
      <button class="tag" on:click={save}>Save</button>
    </div>
  </div>
</div>

<style>
.sheet{ position:fixed; inset:0; display:grid; place-items:end center; padding:12px;
        background:color-mix(in oklab,var(--bg-0) 30%, black 35%); z-index:80; }
.card{ width:min(680px, 100%); background:var(--bg-1); border:1px solid var(--border);
       border-radius:16px 16px 0 0; padding:12px; }
@media (min-width:821px){ .sheet{ place-items:center } .card{ border-radius:12px; max-height:80vh; overflow:auto } }
label{ display:grid; gap:6px; margin:8px 0; }
input, textarea, select{ background:var(--bg-0); border:1px solid var(--border); border-radius:10px; padding:8px; color:var(--text); }
</style>
