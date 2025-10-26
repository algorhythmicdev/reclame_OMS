<script lang="ts">
  import type { Branch } from './order-model';
  export let branches: Branch[] = [];
  export let defaultBranch = 'main';
  export let onSetDefault: (name:string)=>void = ()=>{};
  export let onDelete: (name:string)=>void = ()=>{};
  export let onRollback: (name:string, commitId:string)=>void = ()=>{};
  export let id: string | undefined = undefined;
</script>

<div class="card" id={id}>
  <h3 style="margin:0 0 8px 0">Branches</h3>
  <table class="rf-table">
    <thead><tr><th>Name</th><th>Head</th><th>Commits</th><th>Actions</th></tr></thead>
    <tbody>
      {#each branches as b}
        <tr>
          <td>{b.name} {#if b.name===defaultBranch}<span class="muted">(default)</span>{/if}</td>
          <td style="font-family:monospace">{b.head.slice(0,8)}</td>
          <td>{b.commits.length}</td>
          <td class="row" style="gap:6px">
            {#if b.name!==defaultBranch}
              <button class="tag" on:click={()=>onSetDefault(b.name)}>Make default</button>
              <button class="tag" on:click={()=>onDelete(b.name)}>Delete</button>
            {/if}
            {#if b.commits.length>0}
              <button
                class="tag"
                on:click={() => onRollback(b.name, b.commits[b.commits.length - 1].id)}>
                Rollback to oldest
              </button>
            {/if}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
