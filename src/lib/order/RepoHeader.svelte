<script lang="ts">
  import Badge from '$lib/ui/Badge.svelte';
  import { GitBranch, GitCommit, GitCompare, ArchiveRestore } from 'lucide-svelte';
  export let id = ''; export let title=''; export let client=''; export let badges:string[]=[];
</script>

<div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px">
  <div>
    <div style="font-size:1.2rem;font-weight:900">{id} <span class="muted">/</span> {title}</div>
    <div class="muted">{client}</div>
    <div class="row" style="margin-top:6px;gap:6px">
      {#each badges as b}<Badge tone={b==='URGENT'?'danger':b==='READY_TO_SHIP'?'success':b==='BLOCKED'?'warn':'primary'}>{b}</Badge>{/each}
    </div>
  </div>
  <div class="row">
    <a class="tag" href="#commits" title="Commits"><GitCommit size={16}/> Commits</a>
    <a class="tag" href="#branches" title="Branches"><GitBranch size={16}/> Branches</a>
    <a class="tag" href="#compare" title="Compare"><GitCompare size={16}/> Compare</a>
    <a class="tag" href="#rollback" title="Rollback"><ArchiveRestore size={16}/> Rollback</a>
  </div>
</div>
