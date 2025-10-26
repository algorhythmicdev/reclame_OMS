<script lang="ts">
  import { base, assets } from '$app/paths';
  import RepoHeader from '$lib/order/RepoHeader.svelte';
  import Tabs from '$lib/ui/Tabs.svelte';
  import PdfViewer from '$lib/pdf/PdfViewer.svelte';
  import CommitTimeline from '$lib/order/CommitTimeline.svelte';
  import BranchesTable from '$lib/order/BranchesTable.svelte';
  import ProgressLegend from '$lib/ui/ProgressLegend.svelte';
  import RevisionsList from '$lib/order/RevisionsList.svelte';
  import PRList from '$lib/order/PRList.svelte';
  import PRCreateForm from '$lib/order/PRCreateForm.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';

  import type { Order, Station, Commit } from '$lib/order/types';
  import { getOrder, createOrder, addRevision, setDefaultRevision,
           openPR, mergePR, closePR } from '$lib/order/vcs-store';

  export let params; const id = params.id;

  const assetPath = (name: string) => (assets && assets !== '.' ? `${assets}/files/${name}` : `/files/${name}`);

  // Seed if missing (admin-created order)
  let order: Order | null = getOrder(id);
  if (!order) {
    order = createOrder({
      id, title:'4500mm Long Frame', client:'ABTB BIJEN', due:'2025-10-26',
      badges:['OPEN','IN_PROGRESS'],
      fields:[{key:'priority',label:'Priority',value:'Normal'}],
      materials:[{key:'face',label:'Face',value:'Acrylic 3mm White'}],
      progress:{ CAD:100, CNC:100, SANDING:40, BENDING:0, WELDING:0, PAINT:0, ASSEMBLY:0, QC:0, LOGISTICS:0 },
      file: { id:'f1', name:'PO-250375_ABTB-BIJEN_4500mm.pdf', path: assetPath('PO-250375_ABTB-BIJEN_4500mm.pdf'), kind:'pdf' }
    });
  }
  $: o = getOrder(id)!;                  // reactive snapshot
  $: pdf = o.revisions.find(r=>r.id===o.defaultRevisionId)?.file;

  let tab = 'overview';
  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'revisions', label:'Revisions' },
    { id:'pulls', label:'Pull requests' },
    { id:'commits', label:'Commits' },
    { id:'branches', label:'Branches' }
  ];

  function stages() {
    const names: Record<Station, string> = {
      CAD: 'CAD',
      CNC: 'CNC',
      SANDING: 'Sanding',
      BENDING: 'Bending',
      WELDING: 'Welding',
      PAINT: 'Paint',
      ASSEMBLY: 'Assembly',
      QC: 'QC',
      LOGISTICS: 'Logistics'
    };
    return Object.entries(o.progress).map(([k, v]) => ({ name: names[k as Station] || k, value: v as number }));
  }

  // Admin: attach a new "revision" (simulate by typing a path)
  let newPath = '';
  function attachRevision() {
    if (!newPath.trim()) return;
    addRevision(o.id, { id: crypto.randomUUID(), name: newPath.split('/').pop()!, path: newPath, kind:'pdf' }, 'admin');
    o = getOrder(id)!; newPath = '';
  }

  // Stations: open PR
  function createPR(title: string, changes: Commit['changes'], message?: string) {
    openPR(o.id, { title, author: 'Station', proposed: changes, message });
    o = getOrder(id)!;
  }
  function doMerge(prId: string){ mergePR(o.id, prId, 'admin'); o = getOrder(id)!; }
  function doClose(prId: string){ closePR(o.id, prId); o = getOrder(id)!; }
  function useRevision(revId: string){ setDefaultRevision(o.id, revId, 'admin'); o = getOrder(id)!; }
</script>

<RepoHeader id={o.id} title={o.title} client={o.client} badges={o.badges} />

<div style="margin:10px 0"><Tabs {tabs} bind:active={tab} /></div>

<section
  class="grid"
  style="grid-template-columns:1.6fr 1fr;align-items:start"
  hidden={tab!=='overview'}
  aria-hidden={tab!=='overview'}>
  <section class="card">
    <h3 style="margin:0 0 8px 0">Current Order PDF</h3>
    {#if pdf}<PdfViewer src={pdf.path} />{:else}<div class="muted">No file.</div>{/if}
  </section>

  <aside class="grid">
    <section class="card">
      <h3 style="margin:0 0 8px 0">Fields</h3>
      <ul>{#each o.fields as f}<li><b>{f.label}:</b> {f.value}</li>{/each}</ul>
      <h3 style="margin:10px 0 8px">Materials</h3>
      <ul>{#each o.materials as m}<li><b>{m.label}:</b> {m.value}</li>{/each}</ul>
    </section>

    <section class="card" aria-labelledby="progress-legend">
      <h3 id="progress-legend" style="margin:0 0 8px 0">Process Progress</h3>
      <ProgressLegend stages={stages()} />
    </section>
  </aside>
</section>

<section
  class="grid"
  style="grid-template-columns:2fr 1fr;align-items:start"
  id="revisions"
  hidden={tab!=='revisions'}
  aria-hidden={tab!=='revisions'}>
  <RevisionsList
    items={o.revisions}
    currentId={o.defaultRevisionId}
    onUse={useRevision}
    canManage={$role==='Admin'}
  />
  {#if $role==='Admin'}
    <section class="card">
      <h3 style="margin:0 0 8px 0">Attach new revision (Admin)</h3>
      <input class="rf-input" placeholder="Paste PDF path under static/files/..." bind:value={newPath} />
      <div class="row" style="margin-top:8px"><button class="tag" on:click={attachRevision}>Attach</button></div>
      <div class="muted" style="margin-top:6px">Demo: static hosting can’t upload; paste a path like <code>{assetPath('PO-250375_v2.pdf')}</code>.</div>
    </section>
  {/if}
</section>

<section
  class="grid"
  style="grid-template-columns:2fr 1fr"
  hidden={tab!=='pulls'}
  aria-hidden={tab!=='pulls'}>
  <PRList prs={o.prs} isAdmin={$role==='Admin'} onMerge={doMerge} onClose={doClose} />
  {#if $role!=='Admin'}
    <PRCreateForm onCreate={createPR} />
  {:else}
    <section class="card"><h3 style="margin:0">Create PR</h3><div class="muted">Switch role to Station to open a PR.</div></section>
  {/if}
</section>

<section id="commits" hidden={tab!=='commits'} aria-hidden={tab!=='commits'}>
  <CommitTimeline commits={o.branches.find(b=>b.name===o.defaultBranch)?.commits || []} />
</section>

<section
  id="branches"
  class="grid"
  style="gap:10px"
  hidden={tab!=='branches'}
  aria-hidden={tab!=='branches'}>
  <BranchesTable branches={o.branches} defaultBranch={o.defaultBranch}
    onSetDefault={() => {}} onDelete={() => {}} onRollback={() => {}} />
  <section class="card" id="compare">
    <h3 style="margin:0 0 6px 0">Compare</h3>
    <p class="muted" style="margin:0">Diff view coming soon—use commits to review changes.</p>
  </section>
  <section class="card" id="rollback">
    <h3 style="margin:0 0 6px 0">Rollback</h3>
    <p class="muted" style="margin:0">Rollback controls will be wired once backend hooks are ready.</p>
  </section>
</section>
