<script context="module">
  import { writable } from 'svelte/store';
  const isBrowser = typeof window !== 'undefined';
  const seed = isBrowser ? localStorage.getItem('rf_role') || 'Admin' : 'Admin';
  export const role = writable(seed);
  role.subscribe(v => { if (isBrowser) localStorage.setItem('rf_role', v); });
</script>

<script>
  $: current = $role;
</script>

<div class="row" role="group" aria-label="Role">
  <button class="tag" aria-pressed={current==='Admin'} on:click={()=>role.set('Admin')}>Admin</button>
  <button class="tag" aria-pressed={current==='Station'} on:click={()=>role.set('Station')}>Station</button>
</div>
