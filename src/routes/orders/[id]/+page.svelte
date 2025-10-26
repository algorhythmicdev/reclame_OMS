<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import RepoHeader from '$lib/order/RepoHeader.svelte';
  import Tabs from '$lib/ui/Tabs.svelte';
  import PdfViewer from '$lib/pdf/PdfViewer.svelte';

  import StationLogTimeline from '$lib/order/StationLogTimeline.svelte';
  import ChangeRequestList from '$lib/order/ChangeRequestList.svelte';
  import ChangeRequestForm from '$lib/order/ChangeRequestForm.svelte';
  import RevisionsList from '$lib/order/RevisionsList.svelte';
  import ProgressLegend from '$lib/ui/ProgressLegend.svelte';
  import BranchesTable from '$lib/order/BranchesTable.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';

  import type { Order, StationLog } from '$lib/order/types.signage';
  import { getOrder, createOrder, setDefaultRevision, addRevision } from '$lib/order/signage-store';
  import { openChangeRequest, approveChangeRequest, declineChangeRequest } from '$lib/order/signage-store';

  export let params; const id = params.id;

  let order: Order | null = getOrder(id);
  if (!order) {
    order = createOrder({
      id, title:'4500mm Long Frame', client:'ABTB BIJEN', due:'2025-10-26',
      badges:['OPEN','IN_PROGRESS'],
      fields:[{key:'priority',label:'Priority',value:'Normal'}],
      materials:[{key:'face',label:'Face',value:'Acrylic 3mm White'}],
      progress:{ CAD:100, CNC:100, SANDING:40, BENDING:0, WELDING:0, PAINT:0, ASSEMBLY:0, QC:0, LOGISTICS:0 },
      file: { id:'f1', name:'PO-250375_ABTB-BIJEN_4500mm.pdf', path:`${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`, kind:'pdf' }
    });
  }
  $: o = getOrder(id)!;
  $: pdf = o.revisions.find(r=>r.id===o.defaultRevisionId)?.file;

  let tab = 'overview';
  const tabs = [
    { id:'overview', label:'Overview' },
    { id:'revisions', label:'Revisions' },
    { id:'changes', label:'Change Requests' },
    { id:'logs', label:'Station Logs' },
    { id:'workstreams', label:'Workstreams' }
  ];

  function setTabFromHash(hash: string) {
    const target = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!target) return;
    if (tabs.some(t => t.id === target)) {
      tab = target;
    }
  }

  onMount(() => {
    setTabFromHash(window.location.hash);
    const handle = () => setTabFromHash(window.location.hash);
    window.addEventListener('hashchange', handle);
    return () => window.removeEventListener('hashchange', handle);
  });

  $: syncHash(tab);

  function syncHash(activeTab: string) {
    if (typeof window === 'undefined') return;
    const target = `#${activeTab}`;
    if (window.location.hash === target) return;
    const { pathname, search } = window.location;
    history.replaceState(null, '', `${pathname}${search}${target}`);
  }

  function stages() {
    const names: Record<string,string> = { CAD:'CAD', CNC:'CNC', SANDING:'Sanding', BENDING:'Bending', WELDING:'Welding', PAINT:'Paint', ASSEMBLY:'Assembly', QC:'QC', LOGISTICS:'Logistics' };
    return Object.entries(o.progress).map(([k,v])=>({ name:names[k]||k, value:v as number }));
  }

  // Admin attach revision (static demo path)
  let newPath=''; function attach() {
    if (!newPath.trim()) return;
    addRevision(o.id, { id: crypto.randomUUID(), name: newPath.split('/').pop()!, path: newPath, kind:'pdf' }, 'admin');
    o = getOrder(id)!; newPath = '';
  }
  function useRevision(id: string){ setDefaultRevision(o.id, id, 'admin'); o = getOrder(id)!; }

  // Stations create CR; Admin approves/declines
  function createCR(title: string, changes: StationLog['changes'], message?: string) {
    openChangeRequest(o.id, { title, author:'Station', proposed: changes, message });
    o = getOrder(id)!;
  }
  function approve(id: string){ approveChangeRequest(o.id, id, 'admin'); o = getOrder(id)!; }
  function decline(id: string){ declineChangeRequest(o.id, id); o = getOrder(id)!; }
</script>

<RepoHeader id={o.id} title={o.title} client={o.client} badges={o.badges} />

<div style="margin:10px 0"><Tabs {tabs} bind:active={tab} /></div>

<section id="overview" hidden={tab!=='overview'} aria-label="Overview">
  <div class="grid" style="grid-template-columns:1.6fr 1fr;align-items:start">
    <section class="card" aria-label="Current order file">
      <h3 style="margin:0 0 8px 0">Current Order PDF</h3>
      {#if pdf}<PdfViewer src={pdf.path} />{:else}<div class="muted">No file.</div>{/if}
    </section>

    <aside class="grid">
      <section class="card">
        <h3 style="margin:0 0 8px 0">Key Fields</h3>
        <ul>{#each o.fields as f}<li><b>{f.label}:</b> {f.value}</li>{/each}</ul>
        <h3 style="margin:10px 0 8px">Materials</h3>
        <ul>{#each o.materials as m}<li><b>{m.label}:</b> {m.value}</li>{/each}</ul>
      </section>
      <section class="card" aria-labelledby="progress-legend">
        <h3 id="progress-legend" style="margin:0 0 8px 0">Process Progress</h3>
        <ProgressLegend stages={stages()} />
      </section>
    </aside>
  </div>
</section>

<section id="revisions" hidden={tab!=='revisions'} aria-label="Revisions">
  <div class="grid" style="grid-template-columns:2fr 1fr;align-items:start">
    <RevisionsList items={o.revisions} currentId={o.defaultRevisionId} onUse={useRevision} />
    {#if $role==='Admin'}
      <section class="card">
        <h3 style="margin:0 0 8px 0">Attach Revision (Admin)</h3>
        <input class="rf-input" placeholder="Paste PDF path under static/files/..." bind:value={newPath} aria-label="PDF path" />
        <div class="row" style="margin-top:8px"><button class="tag" on:click={attach}>Attach</button></div>
      </section>
    {/if}
  </div>
</section>

<section id="changes" hidden={tab!=='changes'} aria-label="Change Requests">
  <div class="grid" style="grid-template-columns:2fr 1fr">
    <ChangeRequestList items={o.prs} isAdmin={$role==='Admin'} onApprove={approve} onDecline={decline} />
    {#if $role!=='Admin'}
      <ChangeRequestForm onCreate={createCR} />
    {:else}
      <section class="card"><h3 style="margin:0">Create Change Request</h3><div class="muted">Switch role to Station.</div></section>
    {/if}
  </div>
</section>

<section id="logs" hidden={tab!=='logs'} aria-label="Station Logs">
  <StationLogTimeline logs={o.branches.find(b=>b.name===o.defaultBranch)?.commits || []} />
</section>

<section id="workstreams" hidden={tab!=='workstreams'} aria-label="Workstreams" style="width:100%">
  <BranchesTable branches={o.branches} defaultBranch={o.defaultBranch}
    onSetDefault={() => {}} onDelete={() => {}} onRollback={() => {}} />
</section>
