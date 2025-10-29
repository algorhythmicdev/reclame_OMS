<script lang="ts">
  import type { CalEvent, EventKind } from './types';
  import { addEvent, updateEvent, removeEvent } from './store';
  export let dateISO = '';              // injected from day cell
  export let existing: CalEvent | null = null;
  export let onClose = () => {};
  
  let kind: EventKind = existing?.kind || 'loading';
  let carrier = (existing as any)?.carrier || '';
  let poList = (existing as any)?.poList || [];
  let title = (existing as any)?.title || '';
  let start = (existing as any)?.start || '';
  let end   = (existing as any)?.end   || '';
  let note  = existing?.note || '';
  let attendees = (existing as any)?.attendees || [];
  let location  = (existing as any)?.location  || '';
  
  // For input handling
  let poInput = poList.join(', ');
  let attendeesInput = attendees.join(', ');

  function commit(){
    const base = existing ?? {
      id: crypto.randomUUID(), 
      date: dateISO, 
      createdAt: new Date().toISOString(), 
      kind
    } as CalEvent;
    
    const shaped: CalEvent =
      kind==='loading' ? { ...base, kind, poList, carrier, window:{ start, end }, note } :
      kind==='meeting' ? { ...base, kind, title, start, end, attendees, location, note } :
                         { ...base, kind, title, note };
    existing ? updateEvent(shaped) : addEvent(shaped);
    onClose();
  }
  
  function handlePoInput(e: Event) {
    const val = (e.currentTarget as HTMLInputElement).value;
    poList = val.split(',').map(s=>s.trim()).filter(Boolean);
  }
  
  function handleAttendeesInput(e: Event) {
    const val = (e.currentTarget as HTMLInputElement).value;
    attendees = val.split(',').map(s=>s.trim()).filter(Boolean);
  }
</script>

<div class="sheet" role="dialog" aria-modal="true" aria-label="Calendar event">
  <form class="card" on:submit|preventDefault={commit}>
    <header class="row" style="justify-content:space-between">
      <strong>Calendar entry — {dateISO}</strong>
      <div class="row" style="gap:8px">
        {#if existing}
          <button class="tag warn" type="button" on:click={()=>{removeEvent(existing.id); onClose();}}>
            Delete
          </button>
        {/if}
        <button class="tag ghost" type="button" on:click={onClose}>Cancel</button>
        <button class="tag" type="submit">Save</button>
      </div>
    </header>

    <fieldset>
      <legend class="sr-only">Type</legend>
      <label><input type="radio" name="k" value="loading" bind:group={kind}> Loading</label>
      <label><input type="radio" name="k" value="meeting" bind:group={kind}> Meeting</label>
      <label><input type="radio" name="k" value="note" bind:group={kind}> Note</label>
    </fieldset>

    {#if kind==='loading'}
      <label>
        Carrier 
        <input type="text" bind:value={carrier} placeholder="e.g., DHL / in-house truck">
      </label>
      <label>
        POs (comma-separated) 
        <input type="text" value={poInput} on:input={handlePoInput} placeholder="PO-001, PO-002">
      </label>
      <div class="row">
        <label>From <input type="time" bind:value={start}></label>
        <label>To <input type="time" bind:value={end}></label>
      </div>
    {:else if kind==='meeting'}
      <label>
        Title 
        <input required type="text" bind:value={title}>
      </label>
      <div class="row">
        <label>Start <input type="time" bind:value={start}></label>
        <label>End <input type="time" bind:value={end}></label>
      </div>
      <label>
        Location 
        <input type="text" bind:value={location} placeholder="Room / site / online">
      </label>
      <label>
        Attendees (comma-separated) 
        <input type="text" value={attendeesInput} on:input={handleAttendeesInput} placeholder="John, Jane">
      </label>
    {:else}
      <label>
        Title 
        <input type="text" bind:value={title} placeholder="Short note title">
      </label>
    {/if}

    <label>
      Notes 
      <textarea rows="3" bind:value={note}></textarea>
    </label>
  </form>
</div>

<style>
.sheet{
  position:fixed;
  inset:0;
  background:color-mix(in oklab, var(--bg-0) 55%, transparent);
  display:grid;
  place-items:center;
  z-index:60;
  padding: 16px;
}
.card {
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}
.sr-only{
  position:absolute;
  clip:rect(1px,1px,1px,1px);
  width:1px;
  height:1px;
  overflow:hidden;
}
label{
  display:grid;
  gap:6px;
  margin:8px 0;
}
input, textarea, select{
  background:var(--bg-0);
  border:1px solid var(--border);
  border-radius:10px;
  padding:8px;
  color: var(--text);
}
fieldset {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px;
  margin: 8px 0;
  display: flex;
  gap: 16px;
}
fieldset label {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0;
}
.tag.warn {
  background: color-mix(in oklab, var(--danger) 20%, transparent);
  border-color: var(--danger);
  color: var(--danger);
}
</style>
