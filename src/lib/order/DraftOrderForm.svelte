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
  import QuantitySelector from '$lib/order/form-elements/QuantitySelector.svelte';
  import ProfileBadge from '$lib/order/form-elements/ProfileBadge.svelte';
  import SectionButton from '$lib/order/form-elements/SectionButton.svelte';
  import ColorSwatch from '$lib/order/form-elements/ColorSwatch.svelte';
  import SectionHeader from '$lib/order/form-elements/SectionHeader.svelte';

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

  // Form state for visual design
  let quantity: number = 1;
  let signType: 'OUTDOOR' | 'INDOOR' = 'OUTDOOR';
  
  // LINE FREEZER state
  let lineFreezer = {
    face: false,
    back: false,
    opal: false,
    alu13: false,
    alu15: false,
    thickness: '3mm',
    size: 60
  };

  // BENDER state
  let bender = {
    sides: false,
    opal: false,
    alu13: false,
    alu15: false
  };

  // FRONT state
  let front = {
    opal: false,
    thickness: '3mm',
    color3020a: false,
    color3020b: false,
    noFrame: false,
    print: false,
    color9005a: false,
    color9005b: false
  };

  // PAINTING state
  let painting = {
    sides: false,
    back: false,
    frame: false
  };

  // ASSEMBLING state
  let assembling = {
    led: false,
    trace: false,
    cable: false,
    frame: false,
    bellLed: false,
    regular: false,
    sloan: false,
    noFrame: false,
    sarasota: false,
    wago: false,
    noFrame2: false,
    shalon: false,
    waterholes: false
  };

  // DELIVERY state
  let deliveryDate = '2025-10-27';

  // Profile management (keeping for compatibility)
  let profiles: ProfileData[] = [
    { id: generateId(), type: '7st', data: {} }
  ];

  let hasUnsavedChanges = false;

  function generateId(): string {
    return `profile-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  function formatDeliveryDate(dateStr: string): { month: string, year: string } {
    if (!dateStr) return { month: '', year: '' };
    const date = new Date(dateStr);
    const month = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const year = date.getFullYear().toString();
    return { month, year };
  }

  $: deliveryFormatted = formatDeliveryDate(deliveryDate);

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
    
    // Reset form state
    quantity = 1;
    lineFreezer = { face: false, back: false, opal: false, alu13: false, alu15: false, thickness: '3mm', size: 60 };
    bender = { sides: false, opal: false, alu13: false, alu15: false };
    front = { opal: false, thickness: '3mm', color3020a: false, color3020b: false, noFrame: false, print: false, color9005a: false, color9005b: false };
    painting = { sides: false, back: false, frame: false };
    assembling = { led: false, trace: false, cable: false, frame: false, bellLed: false, regular: false, sloan: false, noFrame: false, sarasota: false, wago: false, noFrame2: false, shalon: false, waterholes: false };
    deliveryDate = '2025-10-27';
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

    // Construct profile data with form state
    const profileData = {
      quantity,
      signType,
      lineFreezer,
      bender,
      front,
      painting,
      assembling,
      delivery: { date: deliveryDate }
    };

    // Update profiles with the form data
    const updatedProfiles = [{ id: generateId(), type: '7st' as const, data: profileData }];

    createOrder({
      id,
      title,
      client,
      due,
      isDraft: true,
      cdrFile,
      pdfFile,
      profiles: updatedProfiles,
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

        <!-- Draft Order Form Design Section -->
        <section class="draft-form-design">
          <h3>Draft Order Form</h3>
          
          <div class="draft-form">
            <!-- Top Section -->
            <div class="form-header">
              <h1 class="invoice-label">invoice</h1>
              <h2 class="po-number">{id || 'PO-XXXX'}</h2>
            </div>
            
            <!-- Main Grid -->
            <div class="form-grid-layout">
              <!-- Left: Quantity Selector -->
              <div class="quantity-column">
                <QuantitySelector bind:quantity />
              </div>
              
              <!-- Center: Form Sections -->
              <div class="form-sections">
                <!-- Profile Header -->
                <div class="profile-header">
                  <ProfileBadge label="Profile 7st" />
                  <span class="sign-type">OUTDOOR SIGN / INDOOR SIGN</span>
                </div>
                
                <!-- Section Grid -->
                <div class="sections-grid">
                  <!-- LINE FREEZER -->
                  <div class="section">
                    <SectionHeader title="LINE FREEZER" />
                    <div class="section-content">
                      <div class="button-row">
                        <SectionButton label="FACE" variant="white" bind:active={lineFreezer.face} onClick={() => lineFreezer.face = !lineFreezer.face} />
                        <SectionButton label="BACK" variant="white" bind:active={lineFreezer.back} onClick={() => lineFreezer.back = !lineFreezer.back} />
                      </div>
                      <div class="button-row">
                        <SectionButton label="OPAL" variant="white" bind:active={lineFreezer.opal} onClick={() => lineFreezer.opal = !lineFreezer.opal} />
                        <SectionButton label="ALU 1.3" variant="black" bind:active={lineFreezer.alu13} onClick={() => lineFreezer.alu13 = !lineFreezer.alu13} />
                        <SectionButton label="ALU 1.5" variant="black" bind:active={lineFreezer.alu15} onClick={() => lineFreezer.alu15 = !lineFreezer.alu15} />
                      </div>
                      <div class="input-row">
                        <input type="text" class="thickness-input" bind:value={lineFreezer.thickness} placeholder="3mm" />
                      </div>
                      <div class="size-display">
                        <span class="size-number">{lineFreezer.size}</span>
                      </div>
                    </div>
                  </div>
                  
                  <!-- BENDER -->
                  <div class="section">
                    <SectionHeader title="BENDER" />
                    <div class="section-content">
                      <div class="button-row">
                        <SectionButton label="SIDES" variant="white" bind:active={bender.sides} onClick={() => bender.sides = !bender.sides} />
                      </div>
                      <div class="button-row">
                        <SectionButton label="OPAL" variant="white" bind:active={bender.opal} onClick={() => bender.opal = !bender.opal} />
                        <SectionButton label="ALU 1.3" variant="black" bind:active={bender.alu13} onClick={() => bender.alu13 = !bender.alu13} />
                        <SectionButton label="ALU 1.5" variant="black" bind:active={bender.alu15} onClick={() => bender.alu15 = !bender.alu15} />
                      </div>
                    </div>
                  </div>
                  
                  <!-- FRONT -->
                  <div class="section">
                    <SectionHeader title="FRONT" />
                    <div class="section-content">
                      <div class="button-row">
                        <SectionButton label="OPAL" variant="white" bind:active={front.opal} onClick={() => front.opal = !front.opal} />
                      </div>
                      <div class="input-row">
                        <input type="text" class="thickness-input" bind:value={front.thickness} placeholder="3mm" />
                      </div>
                      <div class="color-row">
                        <ColorSwatch code="3020" color="#cc2a1f" />
                        <ColorSwatch code="3020" color="#cc2a1f" />
                        <SectionButton label="NO FRAME" variant="red" />
                      </div>
                      <div class="button-row">
                        <SectionButton label="PRINT" variant="white" bind:active={front.print} onClick={() => front.print = !front.print} />
                      </div>
                      <div class="color-row">
                        <ColorSwatch code="9005" color="#0a0a0a" />
                        <ColorSwatch code="9005" color="#0a0a0a" />
                      </div>
                    </div>
                  </div>
                  
                  <!-- PAINTING -->
                  <div class="section">
                    <SectionHeader title="PAINTING" />
                    <div class="section-content">
                      <div class="button-row">
                        <SectionButton label="SIDES" variant="white" bind:active={painting.sides} onClick={() => painting.sides = !painting.sides} />
                        <SectionButton label="BACK" variant="white" bind:active={painting.back} onClick={() => painting.back = !painting.back} />
                        <SectionButton label="FRAME" variant="white" bind:active={painting.frame} onClick={() => painting.frame = !painting.frame} />
                      </div>
                    </div>
                  </div>
                  
                  <!-- ASSEMBLING -->
                  <div class="section section-tall">
                    <SectionHeader title="ASSEMBLING" />
                    <div class="section-content">
                      <div class="button-row">
                        <SectionButton label="LED" variant="white" bind:active={assembling.led} onClick={() => assembling.led = !assembling.led} />
                        <SectionButton label="TRACE" variant="white" bind:active={assembling.trace} onClick={() => assembling.trace = !assembling.trace} />
                        <SectionButton label="CABLE" variant="white" bind:active={assembling.cable} onClick={() => assembling.cable = !assembling.cable} />
                        <SectionButton label="FRAME" variant="white" bind:active={assembling.frame} onClick={() => assembling.frame = !assembling.frame} />
                      </div>
                      <div class="assembling-row">
                        <span class="assembling-text">Bell LED</span>
                        <span class="assembling-text">REGULAR</span>
                        <SectionButton label="NO FRAME" variant="red" />
                        <span class="assembling-text">SLOAN</span>
                        <SectionButton label="SARASOTA" variant="white" bind:active={assembling.sarasota} onClick={() => assembling.sarasota = !assembling.sarasota} />
                      </div>
                      <div class="button-row">
                        <SectionButton label="WAGO" variant="orange" bind:active={assembling.wago} onClick={() => assembling.wago = !assembling.wago} />
                        <SectionButton label="NO FRAME" variant="red" />
                        <SectionButton label="SHALON" variant="white" bind:active={assembling.shalon} onClick={() => assembling.shalon = !assembling.shalon} />
                      </div>
                      <div class="button-row">
                        <SectionButton label="WATERHOLES" variant="white" bind:active={assembling.waterholes} onClick={() => assembling.waterholes = !assembling.waterholes} />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- DELIVERY Section (spans below) -->
                <div class="delivery-section">
                  <SectionHeader title="DELIVERY" />
                  <div class="delivery-content">
                    <div class="date-display">
                      <div class="date-month">{deliveryFormatted.month || 'Oct 27'}</div>
                      <div class="date-year">{deliveryFormatted.year || '2025'}</div>
                    </div>
                    <input 
                      type="date" 
                      class="date-picker-hidden" 
                      bind:value={deliveryDate}
                      on:change={() => hasUnsavedChanges = true}
                    />
                  </div>
                </div>
              </div>
              
              <!-- Right: Company Info -->
              <div class="company-info">
                <h3>Reklamebst BV</h3>
                <p>Weijkoekweg 31</p>
                <p>5481 EH Spouwien</p>
                <p>THE NETHERLANDS</p>
                <p>074 - 27 66 166</p>
                <p>06 36 385 453</p>
              </div>
            </div>
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

  /* Draft Form Design Section */
  .draft-form-design {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    padding: var(--space-lg);
    background: white;
    border-radius: var(--radius-md);
  }

  .draft-form-design h3 {
    margin: 0 0 var(--space-md) 0;
    font-size: 1.125rem;
    color: var(--text);
  }

  .draft-form {
    background: white;
    padding: 2rem;
  }

  .form-header {
    margin-bottom: 2rem;
  }

  .invoice-label {
    color: #FF0000;
    font-size: 2rem;
    font-weight: bold;
    margin: 0;
    text-transform: lowercase;
  }

  .po-number {
    color: #000000;
    font-size: 2rem;
    margin: 0.5rem 0;
  }

  .form-grid-layout {
    display: grid;
    grid-template-columns: 100px 1fr 200px;
    gap: 2rem;
  }

  .quantity-column {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .profile-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .sign-type {
    font-size: 1.2rem;
    font-weight: bold;
  }

  .sections-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 1rem;
  }

  .section {
    border: 1px solid #E5E5E5;
    border-radius: 4px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .section-tall {
    grid-row: span 2;
  }

  .section-content {
    padding: 0.75rem;
    background: white;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
  }

  .button-row {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .input-row {
    display: flex;
    gap: 0.5rem;
  }

  .thickness-input {
    width: 100%;
    padding: 6px 12px;
    border: 1px solid #E5E5E5;
    border-radius: 3px;
    font-size: 14px;
    text-align: center;
    font-weight: bold;
  }

  .size-display {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
  }

  .size-number {
    font-size: 2rem;
    font-weight: bold;
    color: #000000;
  }

  .color-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
  }

  .assembling-row {
    display: flex;
    gap: 0.5rem;
    align-items: center;
    flex-wrap: wrap;
  }

  .assembling-text {
    font-size: 11px;
    color: #000000;
    padding: 4px 8px;
    white-space: nowrap;
  }

  .delivery-section {
    border: 1px solid #E5E5E5;
    border-radius: 4px;
    overflow: hidden;
    margin-top: 1rem;
  }

  .delivery-content {
    padding: 1rem;
    background: white;
    display: flex;
    justify-content: center;
    position: relative;
  }

  .date-display {
    text-align: center;
  }

  .date-month, .date-year {
    background: #000000;
    color: white;
    padding: 1rem;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 0.5rem 0;
    border-radius: 4px;
  }

  .date-picker-hidden {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }

  .company-info {
    font-size: 0.9rem;
    line-height: 1.8;
  }

  .company-info h3 {
    font-weight: bold;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .company-info p {
    margin: 0;
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

    .form-grid-layout {
      grid-template-columns: 1fr;
    }

    .sections-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
