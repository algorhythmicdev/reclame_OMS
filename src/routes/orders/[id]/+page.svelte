<script lang="ts">
  import { base } from '$app/paths';
  import RepoHeader from '$lib/order/RepoHeader.svelte';
  import Tabs from '$lib/ui/Tabs.svelte';
  import PdfViewer from '$lib/pdf/PdfViewer.svelte';
  import CommitTimeline from '$lib/order/CommitTimeline.svelte';
  import BranchesTable from '$lib/order/BranchesTable.svelte';
  import ProgressLegend from '$lib/ui/ProgressLegend.svelte';
  import Badge from '$lib/ui/Badge.svelte';

  import type { OrderRepo, Station } from '$lib/order/order-model';
  import { getRepo, initRepo, commit, branch, setDefaultBranch, deleteBranch, rollback } from '$lib/order/order-store';

  export let params; // SvelteKit
  const id = params.id;

  // --- seed repo if empty
  const seed: OrderRepo = {
    id, title:'4500mm Long Frame', client:'ABTB BIJEN',
    defaultBranch:'main',
    branches:[{ name:'main', head:'seed', commits:[{ id:'seed', ts:new Date().toISOString(), author:'System', message:'Initial import', changes:{} }] , isDefault:true}],
    badges:['OPEN','IN_PROGRESS'],
    progress:{ CAD:100, CNC:100, SANDING:40, BENDING:0, WELDING:0, PAINT:0, ASSEMBLY:0, QC:0, LOGISTICS:0 },
    fields:[{key:'due',label:'Due',value:'2025-10-26'},{key:'priority',label:'Priority',value:'Normal'}],
    materials:[{key:'face',label:'Face',value:'Acrylic 3mm White'},{key:'back',label:'Back',value:'ACP 3mm Brushed'},{key:'frame',label:'Face Frame',value:'Aluminum 2mm'}],
    files:[{ id:'f1', name:'PO-250375_ABTB-BIJEN_4500mm.pdf', path:`${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`, kind:'pdf' }]
  };
  initRepo(seed);

  let repo = getRepo(id)!;
  let tab = 'overview';
  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'files', label:'Files' },
    { id:'commits', label:'Commits' },
    { id:'branches', label:'Branches' },
    { id:'settings', label:'Settings' }
  ];

  // helpers
  function stageList() {
    const map = repo.progress;
    const names: Record<Station,string> = { CAD:'CAD', CNC:'CNC', SANDING:'Sanding', BENDING:'Bending', WELDING:'Welding', PAINT:'Paint', ASSEMBLY:'Assembly', QC:'QC', LOGISTICS:'Logistics' };
    return Object.entries(map).map(([k,v]) => ({ name: names[k as Station], value: v as number }));
  }

  function newCommitFromForm() {
    // Example: toggle Sanding +10% to simulate station commit
    const v = Math.min(100, (repo.progress.SANDING || 0) + 10);
    commit(repo.id, repo.defaultBranch, {
      author:'SANDING', station:'SANDING', message:'Sanding progress +10%',
      changes: { progress: { SANDING: v } }
    });
    repo = getRepo(id)!;
  }

  function createBranch() {
    const name = prompt('Branch name?'); if (!name) return;
    branch(repo.id, name, repo.defaultBranch);
    repo = getRepo(id)!;
  }
  function makeDefault(name:string){ setDefaultBranch(repo.id, name); repo = getRepo(id)!; }
  function delBranch(name:string){ deleteBranch(repo.id, name); repo = getRepo(id)!; }
  function doRollback(name:string, commitId:string){ rollback(repo.id, name, commitId); repo = getRepo(id)!; }

</script>

<RepoHeader id={repo.id} title={repo.title} client={repo.client} badges={repo.badges} />

<div style="margin:10px 0"><Tabs {tabs} bind:active={tab} /></div>

<section
  class="grid"
  style="grid-template-columns:1.6fr 1fr;align-items:start"
  hidden={tab!=='overview'}
  aria-hidden={tab!=='overview'}>
  <section class="card">
    <h3 style="margin:0 0 8px 0">Source PDF</h3>
    {#if repo.files[0]?.path}
      <PdfViewer src={repo.files[0].path} />
    {:else}
      <div class="muted">No file.</div>
    {/if}
  </section>

  <aside class="grid">
    <section class="card">
      <h3 style="margin:0 0 8px 0">Order Fields</h3>
      <ul>{#each repo.fields as f}<li><b>{f.label}:</b> {f.value}</li>{/each}</ul>
      <div class="row"><button class="tag" on:click={newCommitFromForm}>Simulate station commit</button></div>
    </section>

    <section class="card">
      <h3 style="margin:0 0 8px 0">Materials</h3>
      <ul>{#each repo.materials as m}<li><b>{m.label}:</b> {m.value}</li>{/each}</ul>
    </section>

    <section class="card" aria-labelledby="progress-legend">
      <h3 id="progress-legend" style="margin:0 0 8px 0">Process Progress</h3>
      <ProgressLegend stages={stageList()} />
    </section>
  </aside>
</section>

<section class="card" hidden={tab!=='files'} aria-hidden={tab!=='files'}>
  <h3 style="margin:0 0 8px 0">Files</h3>
  <ul>{#each repo.files as f}<li><a class="tag" href={f.path} target="_blank" rel="noreferrer">{f.name}</a> <span class="muted">({f.kind})</span></li>{/each}</ul>
</section>

<section id="commits" hidden={tab!=='commits'} aria-hidden={tab!=='commits'}>
  <CommitTimeline commits={repo.branches.find(b=>b.name===repo.defaultBranch)?.commits || []} />
</section>

<section
  id="branches"
  class="grid"
  style="gap:10px"
  hidden={tab!=='branches'}
  aria-hidden={tab!=='branches'}>
  <div class="row" style="justify-content:space-between;align-items:center">
    <h3 style="margin:0">Branches</h3>
    <button class="tag" on:click={createBranch}>New branch</button>
  </div>
  <BranchesTable
    id="rollback"
    branches={repo.branches}
    defaultBranch={repo.defaultBranch}
    onSetDefault={makeDefault}
    onDelete={delBranch}
    onRollback={doRollback} />
  <div class="card" id="compare">
    <h3 style="margin:0 0 6px 0">Compare</h3>
    <p class="muted" style="margin:0">Diff view coming soon—use branches above for now.</p>
  </div>
</section>

<section class="card" hidden={tab!=='settings'} aria-hidden={tab!=='settings'}>
  <h3 style="margin:0">Settings</h3>
  <div class="row" style="gap:6px">
    <Badge tone="warn">Read-only mock; wire to API later</Badge>
  </div>
</section>
