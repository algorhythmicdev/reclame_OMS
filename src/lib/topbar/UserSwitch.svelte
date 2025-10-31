<script lang="ts">
  import { onMount } from 'svelte';
  
  const USERS = [
    { id:'boss',   name:'Boss Director', role:'superadmin' },
    { id:'admin',  name:'Admin',         role:'admin' },
    { id:'cnc',    name:'CNC',           role:'station' },
    { id:'sand',   name:'Sanding',       role:'station' },
    { id:'paint',  name:'Paint',         role:'station' }
  ];
  let me = USERS[0];
  
  onMount(() => {
    const stored = localStorage.getItem('rf_user');
    if (stored) {
      try {
        me = JSON.parse(stored);
      } catch (e) {
        me = USERS[0];
      }
    }
  });
  
  function set(u){ me=u; localStorage.setItem('rf_user', JSON.stringify(u)); dispatchEvent(new CustomEvent('user-change',{detail:u})); }
  const initials = (n:string)=> n.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
</script>

<div class="menu">
  <button class="avatar" aria-haspopup="menu" aria-expanded="false" aria-label="User">
    <span>{initials(me.name)}</span>
  </button>
  <div class="dropdown" role="menu" style="min-width:220px">
    <div class="row" style="justify-content:space-between;align-items:center">
      <strong>{me.name}</strong><span class="muted">{me.role}</span>
    </div>
    <hr>
    {#each USERS as u}
      <button role="menuitem" on:click={()=>set(u)} aria-pressed={me.id===u.id}>
        {u.name} <span class="muted">— {u.role}</span>
      </button>
    {/each}
    <hr>
    <button role="menuitem" on:click={()=>alert('Mock: sign out')}>Sign out</button>
  </div>
</div>

<style>
.avatar{ width:34px;height:34px;border-radius:999px;border:1px solid var(--border);background:var(--bg-1); cursor:pointer; }
.avatar span{ display:grid;place-items:center;width:100%;height:100%; font-weight:700; color:var(--ink-0, var(--text)); }
</style>
