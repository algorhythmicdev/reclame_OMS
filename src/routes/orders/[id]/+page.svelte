<script lang="ts">
  import { base } from '$app/paths';
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { t } from 'svelte-i18n';

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
  import CompareView from '$lib/order/CompareView.svelte';
  import StationQuickLogger from '$lib/order/StationQuickLogger.svelte';
  import BadgesManager from '$lib/order/BadgesManager.svelte';
  import GanttLine from '$lib/order/GanttLine.svelte';
  import { announce } from '$lib/a11y/live';

  import type { Order, StationLog, Field, Badge } from '$lib/order/types.signage';
  import {
    getOrder,
    createOrder,
    setDefaultRevision,
    addRevision,
    setBadges as setOrderBadges,
    openChangeRequest,
    approveChangeRequest,
    declineChangeRequest
  } from '$lib/order/signage-store';

  export let params;
  const id = params.id;

  let order: Order | null = getOrder(id);
  if (!order) {
    order = createOrder({
      id,
      title: '4500mm Long Frame',
      client: 'ABTB BIJEN',
      due: '2025-10-26',
      badges: ['OPEN', 'IN_PROGRESS'],
      fields: [{ key: 'priority', label: 'Priority', value: 'Normal' }],
      materials: [{ key: 'face', label: 'Face', value: 'Acrylic 3mm White' }],
      progress: { CAD: 100, CNC: 100, SANDING: 40, BENDING: 0, WELDING: 0, PAINT: 0, ASSEMBLY: 0, QC: 0, LOGISTICS: 0 },
      file: { id: 'f1', name: 'PO-250375_ABTB-BIJEN_4500mm.pdf', path: `${base}/files/PO-250375_ABTB-BIJEN_4500mm.pdf`, kind: 'pdf' }
    });
  }

  $: o = getOrder(id)!;
  $: pdf = o.revisions.find((r) => r.id === o.defaultRevisionId)?.file;

  let tab = 'overview';
  let tabs: { id: string; label: string }[] = [];
  $: tabs = [
    { id: 'overview', label: $t('order.overview') },
    { id: 'revisions', label: $t('order.revisions') },
    { id: 'changes', label: $t('order.changes') },
    { id: 'logs', label: $t('order.logs') },
    { id: 'workstreams', label: $t('order.workstreams') }
  ];

  function setTabFromHash(hash: string) {
    const target = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!target) return;
    if (tabs.some((t) => t.id === target)) {
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
    const names: Record<string, string> = {
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
    return Object.entries(o.progress).map(([key, value]) => ({ name: names[key] || key, value: value as number }));
  }

  let newPath = '';
  function attach() {
    if (!newPath.trim()) return;
    addRevision(o.id, { id: crypto.randomUUID(), name: newPath.split('/').pop()!, path: newPath, kind: 'pdf' }, 'admin');
    o = getOrder(id)!;
    newPath = '';
    announce(get(t)('toast.revision_attached'));
  }
  function useRevision(revisionId: string) {
    setDefaultRevision(o.id, revisionId, 'admin');
    o = getOrder(id)!;
    announce(get(t)('toast.revision_switched'));
  }

  function createCR(title: string, changes: StationLog['changes'], message?: string) {
    openChangeRequest(o.id, { title, author: 'Station', proposed: changes, message });
    o = getOrder(id)!;
  }
  function approve(crId: string) {
    approveChangeRequest(o.id, crId, 'admin');
    o = getOrder(id)!;
    selectedChangeRequestId = null;
    announce(get(t)('toast.approved'));
  }
  function decline(crId: string) {
    declineChangeRequest(o.id, crId);
    o = getOrder(id)!;
    selectedChangeRequestId = null;
    announce(get(t)('toast.declined'));
  }

  function updateBadges(badges: Badge[]) {
    setOrderBadges(o.id, badges);
    o = getOrder(id)!;
  }

  const ganttItems = [
    { label: 'CAD', planned: [Date.parse('2025-10-20'), Date.parse('2025-10-21')], actual: [Date.parse('2025-10-20'), Date.parse('2025-10-20T18:00')] },
    { label: 'CNC', planned: [Date.parse('2025-10-21'), Date.parse('2025-10-22')], actual: [Date.parse('2025-10-21T09:00'), Date.parse('2025-10-21T16:00')] },
    { label: 'SANDING', planned: [Date.parse('2025-10-22'), Date.parse('2025-10-23')] }
  ];

  const mergeFields = (base: Field[], proposed?: Field[]) => {
    const map = new Map(base.map((field) => [field.key, { ...field }]));
    proposed?.forEach((field) => {
      const existing = map.get(field.key) || { key: field.key };
      map.set(field.key, { ...existing, ...field });
    });
    return Array.from(map.values());
  };

  let selectedChangeRequestId: string | null = null;
  $: selectedChangeRequest = selectedChangeRequestId
    ? o.prs.find((item) => item.id === selectedChangeRequestId) ?? null
    : null;
  $: compareFieldsRight = mergeFields(o.fields, selectedChangeRequest?.proposed.fields);
  $: compareMaterialsRight = mergeFields(o.materials, selectedChangeRequest?.proposed.materials);

  function handleQuickLog(payload: { station: string; progress?: number; note?: string }) {
    const changes: StationLog['changes'] = {};
    if (payload.progress != null) {
      changes.progress = { [payload.station]: payload.progress } as StationLog['changes']['progress'];
    }
    if (payload.note) {
      changes.fields = [
        {
          key: 'station_note',
          label: get(t)('order.station_note'),
          value: payload.note
        }
      ];
    }
    if (!changes.progress && !changes.fields) return;
    const translate = get(t);
    const title = `${payload.station} ${translate('terms.changeRequest')}`;
    createCR(title, changes, payload.note);
  }
</script>

<RepoHeader id={o.id} title={o.title} client={o.client} badges={o.badges} />

{#if $role === 'Admin'}
  <div style="margin-top:12px">
    <BadgesManager value={o.badges} onChange={updateBadges} />
  </div>
{/if}

<div style="margin:10px 0"><Tabs {tabs} bind:active={tab} /></div>

<section id="overview" hidden={tab!=='overview'} aria-label={$t('order.overview')}>
  <div class="grid" style="grid-template-columns:1.6fr 1fr;align-items:start;gap:16px">
    <section class="card" aria-label={$t('order.currentPdf')}>
      <h3 style="margin:0 0 8px 0">{$t('order.currentPdf')}</h3>
      {#if pdf}
        <PdfViewer src={pdf.path} />
      {:else}
        <div class="muted">{$t('order.no_file')}</div>
      {/if}
    </section>

    <aside class="grid" style="gap:12px">
      <section class="card">
        <h3 style="margin:0 0 8px 0">{$t('order.fields')}</h3>
        <ul>{#each o.fields as field}<li><b>{field.label}:</b> {field.value}</li>{/each}</ul>
        <h3 style="margin:10px 0 8px">{$t('order.materials')}</h3>
        <ul>{#each o.materials as material}<li><b>{material.label}:</b> {material.value}</li>{/each}</ul>
      </section>
      <section class="card" aria-labelledby="progress-legend">
        <h3 id="progress-legend" style="margin:0 0 8px 0">{$t('order.progress')}</h3>
        <ProgressLegend stages={stages()} />
      </section>
      <GanttLine items={ganttItems} />
    </aside>
  </div>
</section>

<section id="revisions" hidden={tab!=='revisions'} aria-label={$t('order.revisions')}>
  <div class="grid" style="grid-template-columns:2fr 1fr;align-items:start;gap:16px">
    <RevisionsList items={o.revisions} currentId={o.defaultRevisionId} onUse={useRevision} />
    {#if $role==='Admin'}
      <section class="card">
        <h3 style="margin:0 0 8px 0">{$t('order.attach_admin_heading')}</h3>
        <input class="rf-input" placeholder={$t('order.attach_help')} bind:value={newPath} aria-label={$t('order.attach_help')} />
        <div class="row" style="margin-top:8px"><button class="tag" on:click={attach}>{$t('order.attach')}</button></div>
      </section>
    {/if}
  </div>
</section>

<section id="changes" hidden={tab!=='changes'} aria-label={$t('order.changes')}>
  <div class="grid" style="grid-template-columns:2fr 1fr;gap:16px">
    <div class="grid" style="gap:12px">
      <ChangeRequestList
        items={o.prs}
        isAdmin={$role==='Admin'}
        onApprove={approve}
        onDecline={decline}
        bind:selectedId={selectedChangeRequestId}
      />
      {#if selectedChangeRequest}
        <CompareView
          headingKey="order.compare.fields"
          fieldLabelKey="compare.field"
          leftTitleKey="compare.before"
          rightTitleKey="compare.after"
          leftFields={o.fields}
          rightFields={compareFieldsRight}
        />
        <CompareView
          headingKey="order.compare.materials"
          fieldLabelKey="compare.field"
          leftTitleKey="compare.before"
          rightTitleKey="compare.after"
          leftFields={o.materials}
          rightFields={compareMaterialsRight}
        />
      {:else}
        <div class="card">
          <h3 style="margin:0 0 8px 0">{$t('order.changeRequests.selected')}</h3>
          <div class="muted">{$t('order.changeRequests.select_prompt')}</div>
        </div>
      {/if}
    </div>

    <div class="grid" style="gap:12px">
      {#if $role!=='Admin'}
        <ChangeRequestForm onCreate={createCR} />
        <StationQuickLogger onSubmit={handleQuickLog} />
      {:else}
        <section class="card">
          <h3 style="margin:0">{$t('order.create_change_request')}</h3>
          <div class="muted">{$t('order.create_change_request_hint')}</div>
        </section>
      {/if}
    </div>
  </div>
</section>

<section id="logs" hidden={tab!=='logs'} aria-label={$t('order.logs')}>
  <StationLogTimeline logs={o.branches.find((b) => b.name === o.defaultBranch)?.commits || []} />
</section>

<section id="workstreams" hidden={tab!=='workstreams'} aria-label={$t('order.workstreams')} style="width:100%">
  <BranchesTable branches={o.branches} defaultBranch={o.defaultBranch} onSetDefault={() => {}} onDelete={() => {}} onRollback={() => {}} />
</section>
