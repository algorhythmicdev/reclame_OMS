<script lang="ts">
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  import Modal from '$lib/ui/Modal.svelte';
  import { createOrder } from '$lib/order/signage-store';
  import { blankStages } from '$lib/order/stages';
  import { notify } from '$lib/notifications/store';
  import { get } from 'svelte/store';
  import { t } from 'svelte-i18n';
  import type { FileRef } from '$lib/order/types';

  export let open = false;
  export let onClose: () => void = () => {};

  let id = '';
  let title = '';
  let client = '';
  let due = new Date().toISOString().slice(0, 10);
  let cdrPath = '';

  function resetForm() {
    id = '';
    title = '';
    client = '';
    due = new Date().toISOString().slice(0, 10);
    cdrPath = '';
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handleCreate() {
    const translate = get(t);
    if (!id || !title || !client) {
      notify(translate('orderform.error_required_fields') || 'Please fill in all required fields', 'error');
      return;
    }

    const cdrFile: FileRef | null = cdrPath ? {
      id: `${id}-cdr`,
      name: cdrPath.split('/').pop() || 'draft.cdr',
      path: cdrPath,
      kind: 'cdr'
    } : null;

    // For draft orders, we use a placeholder file if no CDR is provided
    const file: FileRef = cdrFile || {
      id: `${id}-placeholder`,
      name: 'draft-placeholder.pdf',
      path: '',
      kind: 'pdf'
    };

    createOrder({
      id,
      title,
      client,
      due,
      isDraft: true,
      cdrFile,
      badges: ['DRAFT'],
      fields: [],
      materials: [],
      stages: blankStages(),
      cycles: [],
      loadingDate: null,
      isRD: false,
      rdNotes: '',
      file
    });

    notify(translate('draft.notification', { id }), 'success');
    handleClose();
  }
</script>

<Modal {open} on:close={handleClose} title={$t('draft.create')}>
  <div class="form-grid">
    <div>
      <label for="draft-id">{$t('orderform.po_number')}</label>
      <Input id="draft-id" bind:value={id} placeholder="PO-001" required />
    </div>
    <div>
      <label for="draft-title">{$t('orderform.title')}</label>
      <Input id="draft-title" bind:value={title} placeholder={$t('orderform.title_placeholder')} required />
    </div>
    <div>
      <label for="draft-client">{$t('orderform.client')}</label>
      <Input id="draft-client" bind:value={client} placeholder={$t('orderform.client_placeholder')} required />
    </div>
    <div>
      <label for="draft-due">{$t('orderform.due_date')}</label>
      <Input id="draft-due" type="date" bind:value={due} required />
    </div>
    <div style="grid-column: span 2;">
      <label for="draft-cdr">{$t('draft.cdr_file')}</label>
      <Input id="draft-cdr" bind:value={cdrPath} placeholder={$t('draft.cdr_file_placeholder')} />
    </div>
  </div>
  <div class="actions" slot="actions">
    <Button on:click={handleClose} variant="secondary">{$t('orderform.cancel')}</Button>
    <Button on:click={handleCreate}>{$t('draft.create')}</Button>
  </div>
</Modal>

<style>
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    padding: 16px 0;
  }

  label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted);
    margin-bottom: 6px;
  }

  .actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    padding-top: 16px;
    border-top: 1px solid var(--border);
  }
</style>
