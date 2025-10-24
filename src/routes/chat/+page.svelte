<script>
  import { onMount } from 'svelte';
  let input = '';
  let messages = [
    {user:'CNC', text:'PO-250375 done, pallets to Sanding'},
    {user:'Sanding', text:'Received. Starting in 10.'},
    {user:'Admin', text:'Note: Aluminum low in stock.'},
  ];
  onMount(()=>{
    const saved = localStorage.getItem('rf_chat');
    if(saved) messages = JSON.parse(saved);
  });
  function send(){
    if(!input.trim()) return;
    messages = [...messages, {user:'Me', text:input.trim()}];
    input = '';
    localStorage.setItem('rf_chat', JSON.stringify(messages));
  }
</script>

<section class="grid" style="grid-template-columns:2fr 1fr">
  <div class="card">
    <h2 style="margin-top:0">Team Chat</h2>
    <div class="card" style="background:var(--bg-2);max-height:420px;overflow:auto">
      {#each messages as m}
        <div class="row" style="justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.06);padding:8px 0">
          <b>{m.user}</b>
          <span>{m.text}</span>
        </div>
      {/each}
    </div>
    <div class="row" style="margin-top:8px">
      <input class="tag" style="flex:1;background:var(--bg-2)" bind:value={input} on:keydown={(e)=>e.key==='Enter'&&send()} placeholder="Type message..." />
      <button class="tag" on:click={send}>Send</button>
    </div>
  </div>

  <aside class="grid">
    <div class="card">
      <h3 style="margin:0">Notifications</h3>
      <ul>
        <li>🔔 11:05 Sanding started (PO-250375)</li>
        <li>🔔 10:55 CNC completed (PO-250375)</li>
        <li>🔔 09:20 New order PO-250501</li>
      </ul>
    </div>
    <div class="card">
      <h3 style="margin:0">Voice Commands (mock)</h3>
      <p class="muted">Telegram voice → STT → action.</p>
      <ul>
        <li>“Mark welding done for PO-250375”</li>
        <li>“Check ACP stock”</li>
      </ul>
    </div>
  </aside>
</section>
