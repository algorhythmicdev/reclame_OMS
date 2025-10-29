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
  import { announce as announceToast } from '$lib/stores/toast';
  import { announce } from '$lib/a11y/live';
  import MaterialsEditor from '$lib/order/MaterialsEditor.svelte';
  import { TERMS } from '$lib/order/names';
  import LoadingDatePicker from '$lib/order/LoadingDatePicker.svelte';
  import LoadingPicker from '$lib/calendar/LoadingPicker.svelte';
  import StageLegend from '$lib/order/StageLegend.svelte';
  import StageEditor from '$lib/order/StageEditor.svelte';
  import ReworkQuick from '$lib/order/ReworkQuick.svelte';
  import { adminSendToRework, adminApplyStage, trackStageProposal } from '$lib/order/signage-actions';
  import { ClipboardList, Boxes, CalendarDays } from 'lucide-svelte';

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
  import { getOrderSeed } from '$lib/order/order-seeds';

  export let params;
  const id = params.id;

  let existing = getOrder(id);
  if (!existing) {
    const seed = getOrderSeed(id);
    if (seed) {
      const stages = seed.stages ? { ...blankStages(), ...seed.stages } : blankStages();
      existing = createOrder({
        id: seed.id,
        title: seed.title,
        client: seed.client,
        due: seed.due,
        loadingDate: seed.loadingDate,
        badges: seed.badges,
        fields: seed.fields,
        materials: seed.materials,
        stages,
        cycles: [],
        isRD: seed.isRD,
        rdNotes: seed.rdNotes,
        file: {
          id: `${seed.id}-file`,
          name: seed.fileName,
          path: `${base}/files/${seed.fileName}`,
          kind: 'pdf'
        }
      });
    } else {
      const fallbackName = 'PO-250375_ABTB-BIJEN_4500mm.pdf';
      const stages = blankStages();
      stages.CAD = 'COMPLETED';
      stages.CNC = 'COMPLETED';
      stages.SANDING = 'IN_PROGRESS';
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
        file: { id: 'f1', name: fallbackName, path: `${base}/files/${fallbackName}`, kind: 'pdf' }
      });
    }
  }

  let o = getOrder(id)!;
  $: pdf = o.revisions.find((r) => r.id === o.defaultRevisionId)?.file;
  let loadingSelection = o.loadingDate ?? '';
  let showPicker = false;

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
    trackStageProposal(o.id, station, state, note);
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

  function setLoading(d: string) {
    setLoadingDate(o.id, d, 'admin');
    refreshOrder();
    announceToast(`Loading date set to ${d}`, 'success');
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

{#if $role === 'Admin' && o.loadingDate}
  <div class="card" style="margin-top:12px;display:flex;justify-content:space-between;align-items:center">
    <div>
      <span class="tag">Load: {o.loadingDate}</span>
    </div>
    <button class="tag ghost" on:click={() => (showPicker = true)}>Change loading date…</button>
  </div>
{/if}

{#if $role === 'Admin'}
  <div style="margin-top:12px">
    <BadgesManager value={o.badges} onChange={updateBadges} />
  </div>
{/if}

{#if showPicker}
  <LoadingPicker
    po={o.id}
    onPick={(d) => {
      setLoading(d);
      showPicker = false;
    }}
  />
{/if}

<div style="margin:10px 0"><Tabs {tabs} bind:active={tab} /></div>

<section id="overview" hidden={tab!=='overview'} aria-label={$t('order.overview')}>
  <div class="order-overview">
    <div class="order-overview__preview" aria-label={$t('order.currentPdf')}>
      {#if pdf}
        <PdfFrame src={pdf.path} />
      {:else}
        <section class="card order-preview--empty">
          <h3>{$t('order.currentPdf')}</h3>
          <p class="muted">{$t('order.no_file')}</p>
        </section>
      {/if}
    </div>

    <div class="order-overview__details">
      {#if $role === 'Admin'}
        <section class="card order-detail">
          <header class="order-detail__title">
            <CalendarDays size={18} aria-hidden="true" />
            <h3>{$t('orderPage.loading.title')}</h3>
          </header>
          <LoadingDatePicker bind:selected={loadingSelection} />
          <div class="order-detail__meta">
            <span class="muted">{$t('orderPage.loading.current')} {o.loadingDate || '—'}</span>
            <div class="order-detail__actions">
              <button class="tag" type="button" on:click={assignLoadingDate}>{$t('loading.assign')}</button>
              <button class="tag" type="button" on:click={clearLoadingDate} disabled={!o.loadingDate}>{$t('orderPage.loading.clear')}</button>
            </div>
          </div>
        </section>
      {/if}

      <section class="card order-detail order-detail--fields">
        <h3 class="order-detail__heading">
          <ClipboardList size={16} aria-hidden="true" />
          {$t('order.fields')}
        </h3>
        <ul class="order-list">{#each o.fields as field}<li><span>{field.label}</span><strong>{field.value}</strong></li>{/each}</ul>
        <h3 class="order-detail__heading">
          <Boxes size={16} aria-hidden="true" />
          {$t('order.materials')}
        </h3>
        <ul class="order-list">{#each o.materials as material}<li><span>{material.label}</span><strong>{material.value}</strong></li>{/each}</ul>
      </section>

      {#if o.isRD}
        <section class="card order-detail order-detail--rd">
          <h3>{$t('rd.flag')}</h3>
          <p class="muted">{o.rdNotes || '—'}</p>
        </section>
      {/if}
    </div>

    <div class="order-overview__modules">
      <MaterialsEditor items={o.materials} onPropose={proposeMaterials} onApplyAdmin={applyMaterialsAdmin} />
      <StageLegend stages={o.stages} cycles={o.cycles ?? []} />
      <StageEditor value={o.stages} onApplyAdmin={applyStage} onPropose={proposeStage} />
      <GanttLine items={ganttItems} />
    </div>
  </div>
</section>

<style>
  .order-overview{ display:grid; gap:24px }
  .order-overview__preview{ display:grid; gap:12px }
  .order-preview--empty{ min-height:260px; display:flex; flex-direction:column; gap:8px; justify-content:center }
  .order-preview--empty h3{ margin:0 }
  .order-preview--empty p{ margin:0 }
  .order-overview__details{ display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(260px,1fr)); align-items:start }
  .order-overview__modules{ display:grid; gap:16px; grid-template-columns:repeat(auto-fit,minmax(320px,1fr)); align-items:start }
  .order-detail h3{ margin:0 0 8px }
  .order-detail__title{ display:flex; align-items:center; gap:8px }
  .order-detail__title h3{ margin:0; font-size:1rem }
  .order-detail__heading{ display:flex; align-items:center; gap:8px; margin:0 0 8px; font-size:1rem }
  .order-detail__heading :global(svg){ flex:0 0 auto }
  .order-detail__meta{ display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap }
  .order-detail__actions{ display:flex; gap:8px; flex-wrap:wrap }
  .order-list{ list-style:none; padding:0; margin:0; display:grid; gap:6px }
  .order-list li{ display:flex; justify-content:space-between; gap:12px; border-bottom:1px solid color-mix(in oklab,var(--border) 60%, transparent); padding:6px 0 }
  .order-list li:last-child{ border-bottom:none }
  .order-list li span{ color:var(--muted); font-weight:500 }
  .order-list li strong{ font-weight:600 }
  .order-detail--rd{ background:color-mix(in oklab,var(--accent-2) 14%, var(--bg-1)) }
  .order-detail--rd p{ margin:0; white-space:pre-wrap }

  @media (max-width: 960px){
    .order-overview__modules{ grid-template-columns:1fr }
  }
</style>

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
