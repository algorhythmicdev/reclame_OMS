<script lang="ts">
  import { base } from '$app/paths';
  import { onMount, onDestroy } from 'svelte';
  import { get } from 'svelte/store';
  import { t } from 'svelte-i18n';

  import RepoHeader from '$lib/order/RepoHeader.svelte';
  import Tabs from '$lib/ui/Tabs.svelte';
  import PdfFrame from '$lib/pdf/PdfFrame.svelte';
  import StationLogTimeline from '$lib/order/StationLogTimeline.svelte';
  import ChangeRequestList from '$lib/order/ChangeRequestList.svelte';
  import ChangeRequestForm from '$lib/order/ChangeRequestForm.svelte';
  import RevisionsList from '$lib/order/RevisionsList.svelte';
  import BranchesTable from '$lib/order/BranchesTable.svelte';
  import { role } from '$lib/ui/RoleSwitch.svelte';
  import CompareView from '$lib/order/CompareView.svelte';
  import StationQuickLogger from '$lib/order/StationQuickLogger.svelte';
  import BadgesManager from '$lib/order/BadgesManager.svelte';
  import GanttLine from '$lib/order/GanttLine.svelte';
  import { announce } from '$lib/a11y/live';
  import MaterialsEditor from '$lib/order/MaterialsEditor.svelte';
  import { TERMS } from '$lib/order/names';
  import LoadingDatePicker from '$lib/order/LoadingDatePicker.svelte';
  import StageLegend from '$lib/order/StageLegend.svelte';
  import StageEditor from '$lib/order/StageEditor.svelte';
  import ReworkQuick from '$lib/order/ReworkQuick.svelte';
  import { adminSendToRework, adminApplyStage } from '$lib/order/signage-actions';

  import type { Order, StationLog, Badge } from '$lib/order/types.signage';
  import {
    getOrder,
    createOrder,
    setDefaultRevision,
    addRevision,
    setBadges as setOrderBadges,
    openChangeRequest,
    approveChangeRequest,
    declineChangeRequest,
    setLoadingDate
  } from '$lib/order/signage-store';
  import { blankStages, type StageState, type StationTag, type ReworkReason } from '$lib/order/stages';

  export let params;
  const id = params.id;

  const fallbackFileMap: Record<string, string> = {
    'PO-250375': 'PO-250375_ABTB-BIJEN_4500mm.pdf',
    'PO-250420': 'NL REKLATEKST Wassink 7000 mm  PO-251076  Nov 14.pdf',
    'PO-250501': 'NL LEVANTO ALBERT HEIJN  Lightbox 500 mm   PO-35818  Nov 14.pdf'
  };

  let existing = getOrder(id);
  if (!existing) {
    const stages = blankStages();
    stages.CAD = 'COMPLETED';
    stages.CNC = 'COMPLETED';
    stages.SANDING = 'IN_PROGRESS';
    const fileName = fallbackFileMap[id] ?? 'PO-250375_ABTB-BIJEN_4500mm.pdf';
    existing = createOrder({
      id,
      title: '4500mm Long Frame',
      client: 'ABTB BIJEN',
      due: '2025-10-26',
      loadingDate: '2025-10-24',
      badges: ['OPEN', 'IN_PROGRESS'],
      fields: [{ key: 'priority', label: 'Priority', value: 'Normal' }],
      materials: [{ key: 'face', label: 'Face', value: 'Acrylic 3mm White' }],
      stages,
      cycles: [],
      file: { id: 'f1', name: fileName, path: `${base}/files/${fileName}`, kind: 'pdf' }
    });
  }

  let o = getOrder(id)!;
  $: pdf = o.revisions.find((r) => r.id === o.defaultRevisionId)?.file;
  let loadingSelection = o.loadingDate ?? '';

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

  $: syncHash(tab);

  function syncHash(activeTab: string) {
    if (typeof window === 'undefined') return;
    const target = `#${activeTab}`;
    if (window.location.hash === target) return;
    const { pathname, search } = window.location;
    history.replaceState(null, '', `${pathname}${search}${target}`);
  }

  const shortcutEvents = [
    'rf-approve-selected',
    'rf-decline-selected',
    'rf-open-cr',
    'rf-focus-quicklog',
    'rf-attach-revision'
  ] as const;

  let newPath = '';
  function refreshOrder() {
    o = getOrder(id)!;
    loadingSelection = o.loadingDate ?? '';
  }
  function attach() {
    if (!newPath.trim()) return;
    addRevision(o.id, { id: crypto.randomUUID(), name: newPath.split('/').pop()!, path: newPath, kind: 'pdf' }, 'admin');
    refreshOrder();
    newPath = '';
    announce(get(t)('toast.revision_attached'));
  }
  function useRevision(revisionId: string) {
    setDefaultRevision(o.id, revisionId, 'admin');
    refreshOrder();
    announce(get(t)('toast.revision_switched'));
  }

  function createCR(title: string, changes: StationLog['changes'], message?: string) {
    openChangeRequest(o.id, { title, author: 'Station', proposed: changes, message });
    refreshOrder();
  }
  function applyStage(station: StationTag, state: StageState, note?: string) {
    adminApplyStage(o.id, station, state, note, 'admin');
    refreshOrder();
  }
  function proposeStage(station: StationTag, state: StageState, note?: string) {
    createCR(`${station} → ${state}`, { stages: { [station]: state } }, note);
  }
  function sendRework(station: StationTag, reason: ReworkReason, note: string) {
    adminSendToRework(o.id, station, reason, note, 'admin');
    refreshOrder();
  }
  function approve(crId: string) {
    approveChangeRequest(o.id, crId, 'admin');
    refreshOrder();
    selectedCRId = null;
    announce(get(t)('toast.approved'));
  }
  function decline(crId: string) {
    declineChangeRequest(o.id, crId);
    refreshOrder();
    selectedCRId = null;
    announce(get(t)('toast.declined'));
  }

  function updateBadges(badges: Badge[]) {
    setOrderBadges(o.id, badges);
    refreshOrder();
  }

  function assignLoadingDate() {
    const next = loadingSelection || '';
    if ((o.loadingDate ?? '') === next) return;
    setLoadingDate(o.id, next, 'admin');
    refreshOrder();
    announce(get(t)('loading.updated'));
  }

  function clearLoadingDate() {
    loadingSelection = '';
    assignLoadingDate();
  }

  const ganttItems = [
    { label: 'CAD', planned: [Date.parse('2025-10-20'), Date.parse('2025-10-21')], actual: [Date.parse('2025-10-20'), Date.parse('2025-10-20T18:00')] },
    { label: 'CNC', planned: [Date.parse('2025-10-21'), Date.parse('2025-10-22')], actual: [Date.parse('2025-10-21T09:00'), Date.parse('2025-10-21T16:00')] },
    { label: 'SANDING', planned: [Date.parse('2025-10-22'), Date.parse('2025-10-23')] }
  ];

  let selectedCRId: string | null = null;
  function selectCR(id: string) {
    selectedCRId = id;
  }

  const handleHashChange = () => setTabFromHash(window.location.hash);

  function onKeyActions(event: Event) {
    const name = event.type;
    if (name === 'rf-approve-selected' && selectedCRId) approve(selectedCRId);
    if (name === 'rf-decline-selected' && selectedCRId) decline(selectedCRId);
    if (name === 'rf-open-cr') {
      tab = 'changes';
      setTimeout(() => document.getElementById('cr-title')?.focus(), 0);
    }
    if (name === 'rf-focus-quicklog') {
      tab = 'changes';
      setTimeout(() => document.getElementById('quicklog-note')?.focus(), 0);
    }
    if (name === 'rf-attach-revision') {
      tab = 'revisions';
      setTimeout(() => document.getElementById('attach-path')?.focus(), 0);
    }
  }

  onMount(() => {
    if (typeof window === 'undefined') return;
    setTabFromHash(window.location.hash);
    window.addEventListener('hashchange', handleHashChange);
    for (const name of shortcutEvents) {
      window.addEventListener(name, onKeyActions as EventListener);
    }
  });

  onDestroy(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('hashchange', handleHashChange);
    for (const name of shortcutEvents) {
      window.removeEventListener(name, onKeyActions as EventListener);
    }
  });

  $: openRequests = o.prs.filter((p) => p.status === 'open');
  $: if (selectedCRId && !openRequests.some((p) => p.id === selectedCRId)) {
    selectedCRId = null;
  }
  $: selectedChangeRequest = selectedCRId ? o.prs.find((item) => item.id === selectedCRId) ?? null : null;
  $: compareFieldsRight = selectedChangeRequest?.proposed.fields || o.fields;
  $: compareMaterialsRight = selectedChangeRequest?.proposed.materials || o.materials;
  $: compareStagesRight = selectedChangeRequest?.proposed.stages
    ? { ...o.stages, ...selectedChangeRequest.proposed.stages }
    : o.stages;

  function handleQuickLog(payload: { station: string; progress?: number; note?: string }) {
    const changes: StationLog['changes'] = {};
    if (payload.note) {
      changes.fields = [
        {
          key: 'station_note',
          label: get(t)('order.station_note'),
          value: payload.note
        }
      ];
    }
    if (!changes.fields) return;
    const translate = get(t);
    const title = `${payload.station} ${translate('terms.changeRequest')}`;
    createCR(title, changes, payload.note);
  }

  function proposeMaterials(items: { key: string; label: string; value: string }[]) {
    openChangeRequest(o.id, {
      title: 'Materials update',
      author: 'Station',
      proposed: { materials: items }
    });
    refreshOrder();
  }

  function applyMaterialsAdmin(items: { key: string; label: string; value: string }[]) {
    const prId = openChangeRequest(o.id, {
      title: 'Admin materials update',
      author: 'Admin',
      proposed: { materials: items }
    });
    approveChangeRequest(o.id, prId, 'admin');
    refreshOrder();
    announce(get(t)('toast.approved'));
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
    {#if pdf}
      <section aria-label={$t('order.currentPdf')}>
        <PdfFrame src={pdf.path} />
      </section>
    {:else}
      <section class="card" aria-label={$t('order.currentPdf')}>
        <h3 style="margin:0 0 8px 0">{$t('order.currentPdf')}</h3>
        <div class="muted">{$t('order.no_file')}</div>
      </section>
    {/if}

    <aside class="grid" style="gap:12px">
      {#if $role === 'Admin'}
        <section class="card">
          <h3 style="margin:0 0 8px 0">{$t('orderPage.loading.title')}</h3>
          <LoadingDatePicker bind:selected={loadingSelection} />
          <div class="row" style="margin-top:8px;gap:8px;flex-wrap:wrap;justify-content:space-between">
            <span class="muted" style="font-size:.85rem">{$t('orderPage.loading.current')} {o.loadingDate || '—'}</span>
            <div class="row" style="gap:6px">
              <button class="tag" type="button" on:click={assignLoadingDate}>{$t('loading.assign')}</button>
              <button class="tag" type="button" on:click={clearLoadingDate} disabled={!o.loadingDate}>{$t('orderPage.loading.clear')}</button>
            </div>
          </div>
        </section>
      {/if}
      <section class="card">
        <h3 style="margin:0 0 8px 0">{$t('order.fields')}</h3>
        <ul>{#each o.fields as field}<li><b>{field.label}:</b> {field.value}</li>{/each}</ul>
        <h3 style="margin:10px 0 8px">{$t('order.materials')}</h3>
        <ul>{#each o.materials as material}<li><b>{material.label}:</b> {material.value}</li>{/each}</ul>
      </section>
      {#if o.isRD}
        <section class="card" style="background:color-mix(in oklab,var(--accent-2) 12%, var(--bg-1));">
          <h3 style="margin:0 0 8px 0">{$t('rd.flag')}</h3>
          <p class="muted" style="white-space:pre-wrap">{o.rdNotes || '—'}</p>
        </section>
      {/if}
      <MaterialsEditor items={o.materials} onPropose={proposeMaterials} onApplyAdmin={applyMaterialsAdmin} />
      <StageLegend stages={o.stages} cycles={o.cycles ?? []} />
      <StageEditor value={o.stages} onApplyAdmin={applyStage} onPropose={proposeStage} />
      <GanttLine items={ganttItems} />
    </aside>
  </div>
</section>

<section id="revisions" hidden={tab!=='revisions'} aria-label={$t('order.revisions')}>
  <div class="grid" style="grid-template-columns:2fr 1fr;align-items:start;gap:16px">
    <RevisionsList
      items={o.revisions}
      currentId={o.defaultRevisionId}
      onUse={useRevision}
      canManage={$role==='Admin'}
    />
    {#if $role==='Admin'}
      <section class="card">
        <h3 style="margin:0 0 8px 0">{$t('order.attach_admin_heading')}</h3>
        <input
          id="attach-path"
          class="rf-input"
          placeholder={$t('order.attach_help')}
          bind:value={newPath}
          aria-label={$t('order.attach_help')}
        />
        <div class="row" style="margin-top:8px"><button class="tag" on:click={attach}>{$t('order.attach')}</button></div>
      </section>
    {/if}
  </div>
</section>

<section id="changes" hidden={tab!=='changes'} aria-label={$t('order.changes')}>
  <div class="grid" style="grid-template-columns:2fr 1fr;gap:16px">
    <div class="grid" style="gap:12px">
      {#if $role === 'Admin'}
        <ReworkQuick onSend={sendRework} />
      {/if}
      <div class="card" style="margin-top:10px">
        <h3 style="margin:0 0 8px 0">{$t('orderPage.requests.title')}</h3>
        <ul style="display:grid;gap:6px">
          {#each openRequests as p}
            <li class="row" style="justify-content:space-between">
              <label class="row" style="gap:8px;cursor:pointer">
                <input type="radio" name="selCR" checked={selectedCRId===p.id} on:change={() => selectCR(p.id)} />
                <span>{p.title}</span>
              </label>
              {#if $role === 'Admin'}
                <div class="row">
                  <button class="tag" on:click={() => approve(p.id)}>{$t('orderPage.requests.approve')}</button>
                  <button class="tag" on:click={() => decline(p.id)}>{$t('orderPage.requests.decline')}</button>
                </div>
              {/if}
            </li>
          {/each}
          {#if openRequests.length===0}
            <div class="muted">{$t('orderPage.requests.empty')}</div>
          {/if}
        </ul>
      </div>
      <ChangeRequestList
        items={o.prs}
        isAdmin={$role==='Admin'}
        onApprove={approve}
        onDecline={decline}
        bind:selectedId={selectedCRId}
      />
      {#if selectedChangeRequest}
        <CompareView
          leftTitle={$t('compare.before')}
          rightTitle={$t('compare.after')}
          leftFields={o.fields}
          rightFields={compareFieldsRight}
          leftMaterials={o.materials}
          rightMaterials={compareMaterialsRight}
          leftStages={o.stages}
          rightStages={compareStagesRight}
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
