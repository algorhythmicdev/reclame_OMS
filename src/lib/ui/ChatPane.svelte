<script lang="ts">
  import { onMount } from 'svelte';
  import Input from './Input.svelte';
  let messages = [
    { u:'CNC', m:'PO-250375 done, pallets to Sanding', t:'10:55' },
    { u:'Sanding', m:'Received. Starting in 10.', t:'11:05' }
  ];
  let text = '';

  onMount(() => {
    try {
      const saved = localStorage.getItem('rf_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          messages = parsed;
        }
      }
    } catch (error) {
      console.warn('Unable to restore chat history from localStorage', error);
    }
  });

  function persist() {
    try {
      localStorage.setItem('rf_chat', JSON.stringify(messages));
    } catch (error) {
      console.warn('Unable to persist chat history to localStorage', error);
    }
  }

  function send() {
    const m = text.trim();
    if (!m) return;
    messages = [...messages, { u:'Me', m, t: new Date().toLocaleTimeString() }];
    persist();
    text = '';
  }
</script>

<div class="rf-panel">
  <header style="font-weight:900;margin-bottom:8px">Team Chat</header>
  <div class="rf-scroll" style="display:grid;gap:6px;min-height:0" role="log" aria-live="polite" aria-atomic="false">
    {#each messages as r, i (i)}
      <div class="card" style="background:var(--bg-2);padding:10px">
        <div style="display:flex;justify-content:space-between"><b>{r.u}</b><span class="muted" style="font-size:.8rem">{r.t}</span></div>
        <div style="margin-top:4px">{r.m}</div>
      </div>
    {/each}
  </div>
  <form class="row" style="margin-top:8px" on:submit|preventDefault={send}>
    <Input bind:value={text} placeholder="Type message…" ariaLabel="Message input" />
    <button class="tag" type="submit">Send</button>
  </form>
</div>
