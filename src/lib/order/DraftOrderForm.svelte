<script lang="ts">
  import Input from '$lib/ui/Input.svelte';
  import Button from '$lib/ui/Button.svelte';
  import { createOrder } from '$lib/order/signage-store';
  import { blankStages } from '$lib/order/stages';
  import { notify } from '$lib/notifications/store';
  import { get } from 'svelte/store';
  import { t } from 'svelte-i18n';
  import { Plus, Save, X } from 'lucide-svelte';
  import type { FileRef } from '$lib/order/types';
  import type { ProfileData } from '$lib/order/profiles/index';
  import FileUploader from '$lib/order/form-elements/FileUploader.svelte';
  import FilePreview from '$lib/order/form-elements/FilePreview.svelte';
  import Profile7st from '$lib/order/profiles/Profile7st.svelte';

  export let open = false;
  export let onClose: () => void = () => {};

  let id = '';
  let title = '';
  let client = '';
  let due = new Date().toISOString().slice(0, 10);
  
  // File handling
  let cdrFile: FileRef | null = null;
  let pdfFile: FileRef | null = null;
  let cdrPreviewUrl: string | null = null;
  let pdfPreviewUrl: string | null = null;
  let uploadedCdrFile: File | null = null;
  let uploadedPdfFile: File | null = null;

  // Profile management
  let profiles: ProfileData[] = [
    { id: generateId(), type: '7st', data: {} }
  ];

  let hasUnsavedChanges = false;

  function generateId(): string {
    return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function resetForm() {
    id = '';
    title = '';
    client = '';
    due = new Date().toISOString().slice(0, 10);
    cdrFile = null;
    pdfFile = null;
    cdrPreviewUrl = null;
    pdfPreviewUrl = null;
    uploadedCdrFile = null;
    uploadedPdfFile = null;
    profiles = [{ id: generateId(), type: '7st', data: {} }];
    hasUnsavedChanges = false;
  }

  function handleClose() {
    if (hasUnsavedChanges) {
      const confirm = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirm) return;
    }
    resetForm();
    onClose();
  }

  function handleCdrFileSelected(file: File) {
    uploadedCdrFile = file;
    cdrFile = {
      id: `${id || 'temp'}-cdr`,
      name: file.name,
      path: URL.createObjectURL(file),
      kind: 'cdr'
    };
    cdrPreviewUrl = null; // CDR files don't have preview
    hasUnsavedChanges = true;
  }

  function handlePdfFileSelected(file: File) {
    uploadedPdfFile = file;
    const url = URL.createObjectURL(file);
    pdfFile = {
      id: `${id || 'temp'}-pdf`,
      name: file.name,
      path: url,
      kind: 'pdf'
    };
    pdfPreviewUrl = url;
    hasUnsavedChanges = true;
  }

  function handleClearCdr() {
    if (cdrPreviewUrl) URL.revokeObjectURL(cdrPreviewUrl);
    if (cdrFile?.path) URL.revokeObjectURL(cdrFile.path);
    cdrFile = null;
    cdrPreviewUrl = null;
    uploadedCdrFile = null;
  }

  function handleClearPdf() {
    if (pdfPreviewUrl) URL.revokeObjectURL(pdfPreviewUrl);
    if (pdfFile?.path) URL.revokeObjectURL(pdfFile.path);
    pdfFile = null;
    pdfPreviewUrl = null;
    uploadedPdfFile = null;
  }

  function addProfile() {
    profiles = [...profiles, { id: generateId(), type: '7st', data: {} }];
    hasUnsavedChanges = true;
  }

  function removeProfile(profileId: string) {
    if (profiles.length <= 1) {
      notify('At least one profile is required', { urgency: 'normal' });
      return;
    }
    profiles = profiles.filter(p => p.id !== profileId);
    hasUnsavedChanges = true;
  }

  function validateForm(): boolean {
    const translate = get(t);
    
    // Required fields validation
    if (!id || !title || !client || !due) {
      notify(translate('orderform.error_required_fields') || 'Please fill in all required fields', { urgency: 'normal' });
      return false;
    }

    // PO number format validation
    if (!id.match(/^PO-\d+$/i)) {
      notify('PO Number must be in format PO-XXXX', { urgency: 'normal' });
      return false;
    }

    // At least one file must be uploaded
    if (!cdrFile && !pdfFile) {
      notify('Please upload at least one file (CDR or PDF)', { urgency: 'normal' });
      return false;
    }

    // Future date validation
    const dueDate = new Date(due);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dueDate < today) {
      notify('Due date must be in the future', { urgency: 'normal' });
      return false;
    }

    // At least one profile
    if (profiles.length === 0) {
      notify('At least one profile is required', { urgency: 'normal' });
      return false;
    }

    return true;
  }

  function handleCreate() {
    if (!validateForm()) return;

    const translate = get(t);

    // For draft orders, we use PDF as main file if available, otherwise CDR
    const file: FileRef = pdfFile || cdrFile || {
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
      pdfFile,
      profiles,
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

    // Notify about draft order creation
    const fileInfo = cdrFile && pdfFile 
      ? 'with CDR and PDF files'
      : cdrFile 
      ? 'with CDR file'
      : pdfFile
      ? 'with PDF file'
      : '';
    
    notify(`Draft order ${id} created ${fileInfo}`, { urgency: 'urgent' });
    
    resetForm();
    onClose();
  }

  // Track changes in input fields
  $: if (id || title || client) {
    hasUnsavedChanges = true;
  }
</script>

{#if open}
  <div class="modal-backdrop" on:click={handleClose} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && handleClose()}>
    <div class="modal-panel" on:click|stopPropagation role="dialog" aria-modal="true" aria-label={$t('draft.create')}>
      <!-- Header -->
      <header class="modal-header">
        <h2>{$t('draft.create')}</h2>
        <button class="close-btn" on:click={handleClose} aria-label="Close">
          <X size={24} />
        </button>
      </header>

      <div class="modal-body">
        <!-- File Upload Section -->
        <section class="file-section">
          <h3>Design Files</h3>
          <div class="file-grid">
            <div class="file-column">
              <label class="section-label">CDR File</label>
              <FileUploader
                accept=".cdr"
                label="Upload CDR"
                currentFile={cdrFile}
                onFileSelected={handleCdrFileSelected}
                onClear={handleClearCdr}
              />
              <FilePreview file={cdrFile} previewUrl={cdrPreviewUrl} />
            </div>
            <div class="file-column">
              <label class="section-label">PDF File</label>
              <FileUploader
                accept=".pdf"
                label="Upload PDF"
                currentFile={pdfFile}
                onFileSelected={handlePdfFileSelected}
                onClear={handleClearPdf}
              />
              <FilePreview file={pdfFile} previewUrl={pdfPreviewUrl} />
            </div>
          </div>
        </section>

        <!-- Basic Information -->
        <section class="info-section">
          <h3>Order Information</h3>
          <div class="form-grid">
            <div class="form-field">
              <label for="draft-id">
                {$t('orderform.po_number')} <span class="required">*</span>
              </label>
              <Input id="draft-id" bind:value={id} placeholder="PO-001" required />
            </div>
            <div class="form-field">
              <label for="draft-client">
                {$t('orderform.client')} <span class="required">*</span>
              </label>
              <Input id="draft-client" bind:value={client} placeholder={$t('orderform.client_placeholder')} required />
            </div>
            <div class="form-field">
              <label for="draft-title">
                {$t('orderform.title')} <span class="required">*</span>
              </label>
              <Input id="draft-title" bind:value={title} placeholder={$t('orderform.title_placeholder')} required />
            </div>
            <div class="form-field">
              <label for="draft-due">
                {$t('orderform.due_date')} <span class="required">*</span>
              </label>
              <Input id="draft-due" type="date" bind:value={due} required />
            </div>
          </div>
        </section>

        <!-- Profiles Section -->
        <section class="profiles-section">
          <div class="profiles-header">
            <h3>Product Profiles</h3>
            <button type="button" class="add-profile-btn" on:click={addProfile}>
              <Plus size={20} />
              Add Profile
            </button>
          </div>
          
          <div class="profiles-list">
            {#each profiles as profile (profile.id)}
              <Profile7st
                bind:data={profile.data}
                onRemove={() => removeProfile(profile.id)}
                showRemove={profiles.length > 1}
              />
            {/each}
          </div>
        </section>
      </div>

      <!-- Footer -->
      <footer class="modal-footer">
        <Button on:click={handleClose} variant="ghost">
          {$t('orderform.cancel')}
        </Button>
        <Button on:click={handleCreate}>
          <Save size={18} />
          {$t('draft.create')}
        </Button>
      </footer>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 99;
    overflow: auto;
    padding: var(--space-lg);
  }

  .modal-panel {
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    width: 100%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg);
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--text);
  }

  .close-btn {
    background: transparent;
    border: none;
    color: var(--text);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .close-btn:hover {
    background: var(--bg-2);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl);
  }

  .modal-footer {
    display: flex;
    gap: var(--space-sm);
    justify-content: flex-end;
    padding: var(--space-lg);
    border-top: 1px solid var(--border);
  }

  /* File Section */
  .file-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .file-section h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--text);
  }

  .file-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg);
  }

  .file-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
  }

  .section-label {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Info Section */
  .info-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: color-mix(in oklab, var(--bg-2) 50%, transparent);
    border-radius: var(--radius-md);
  }

  .info-section h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--text);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-md);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
  }

  .form-field label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--muted);
  }

  .required {
    color: var(--danger);
  }

  /* Profiles Section */
  .profiles-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  .profiles-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .profiles-header h3 {
    margin: 0;
    font-size: 1.125rem;
    color: var(--text);
  }

  .add-profile-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm) var(--space-md);
    background: var(--accent-1);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .add-profile-btn:hover {
    filter: brightness(1.1);
  }

  .profiles-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .file-grid,
    .form-grid {
      grid-template-columns: 1fr;
    }

    .modal-panel {
      max-width: 100%;
      max-height: 100vh;
      border-radius: 0;
    }

    .modal-backdrop {
      padding: 0;
    }
  }
</style>
