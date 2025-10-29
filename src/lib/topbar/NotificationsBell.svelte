<script lang="ts">
  import Bell from 'lucide-svelte/icons/bell';
  import { notices } from '$lib/notify/bus';
  let open=false, btn:HTMLButtonElement; let noticesList=[]; const u=notices.subscribe(v=>noticesList=v);
  function onKey(e:KeyboardEvent){ if(e.key==='Escape'){ open=false; btn?.focus(); } }
  $: count = noticesList.length;
</script>

<div class="menu">
  <button bind:this={btn} class="icon" aria-haspopup="menu" aria-expanded={open}
          aria-label={`Notifications ${count}`} on:click={()=>open=!open}>
    <Bell aria-hidden="true"/>{#if count}<span class="badge" aria-hidden="true">{count}</span>{/if}
  </button>

  {#if open}
  <div class="dropdown" role="menu" on:keydown={onKey}>
    {#if noticesList.length===0}<div class="muted">No notifications.</div>{/if}
    {#each noticesList as n}
      <button role="menuitem" class="row">
        <span class="tag" data-kind={n.kind}>{n.text}</span>
        <span class="muted">{new Date(n.time).toLocaleTimeString()}</span>
      </button>
    {/each}
  </div>
  {/if}
</div>

<style>
.menu{position:relative}
.icon{position:relative;border:1px solid var(--border);border-radius:999px;padding:8px;background:var(--bg-0)}
.badge{position:absolute;top:-4px;right:-4px;min-width:18px;height:18px;border-radius:999px;padding:0 4px;
       display:grid;place-items:center;background:var(--accent);color:#fff;font-size:.75rem}
.dropdown{position:absolute;right:0;top:calc(100% + 8px);min-width:280px;background:var(--bg-0);
         border:1px solid var(--border);border-radius:12px;box-shadow:0 10px 24px color-mix(in oklab,var(--shadow-rgb) 35%,transparent);
         padding:8px;z-index:50}
.dropdown [role="menuitem"]{display:flex;justify-content:space-between;gap:8px;padding:6px;border-radius:8px}
.dropdown [role="menuitem"]:focus{outline:3px solid var(--focus)}
</style>
