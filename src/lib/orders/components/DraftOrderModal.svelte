<!-- src/lib/orders/components/DraftOrderModal.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { 
    X, Upload, Plus, Trash2, Calendar, AlertCircle, 
    Save, FileText, User, Hash, ChevronLeft, ChevronRight
  } from 'lucide-svelte';
  import ProfileSelectorCards from '$lib/profiles/components/ProfileSelectorCards.svelte';
  import ProfileFormRenderer from '$lib/profiles/components/ProfileFormRenderer.svelte';
  import Profile7stVisual from '$lib/profiles/components/Profile7stVisual.svelte';
  import { profileTemplates, activeTemplates } from '$lib/profiles/stores/profileTemplatesStore';
  import type { ProfileTemplate } from '$lib/profiles/types';
  import FileUploader from './FileUploader.svelte';

  export let isOpen: boolean = false;
  export let orderId: number | null = null; // For editing existing draft
  export let readonly: boolean = false;

  const dispatch = createEventDispatcher();

  let clientName: string = '';
  let clientEmail: string = '';
  let clientPhone: string = '';
  let poNumber: string = '';
  let deadline: string = '';
  let priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT' = 'NORMAL';
  let specialInstructions: string = '';
  
  let uploadedFiles: any[] = [];
  let profiles: Array<{ 
    id: string; 
    code: string; 
    name: string;
    quantity: number;
    configuration: any;
    formRef: any;
    template?: ProfileTemplate;
  }> = [];

  let saving = false;
  let errors: Record<string, string> = {};
  
  // New: Step-based wizard
  type WizardStep = 'files' | 'info' | 'profile-select' | 'profile-form';
  let currentStep: WizardStep = 'files';
  let currentProfileIndex = 0;

  onMount(async () => {
    await profileTemplates.loadTemplates();
    if (orderId) {
      await loadDraftOrder();
    } else {
      generatePONumber();
      // Auto-add first profile
      addProfile();
    }
  });

  async function loadDraftOrder() {
    try {
      const response = await fetch(`/api/draft-orders/${orderId}`);
      const data = await response.json();
      
      clientName = data.clientName;
      clientEmail = data.clientEmail;
      clientPhone = data.clientPhone;
      poNumber = data.poNumber;
      deadline = data.deadline;
      priority = data.priority;
      specialInstructions = data.specialInstructions;
      uploadedFiles = data.files || [];
      profiles = data.profiles || [];
    } catch (err) {
      console.error('Failed to load draft order:', err);
    }
  }

  async function generatePONumber() {
    try {
      const response = await fetch('/api/draft-orders/generate-po');
      const data = await response.json();
      poNumber = data.poNumber;
    } catch (err) {
      console.error('Failed to generate PO number:', err);
      poNumber = `PO-${Date.now()}`;
    }
  }

  function addProfile() {
    profiles = [...profiles, {
      id: `profile-${Date.now()}`,
      code: '',
      name: '',
      quantity: 1,
      configuration: {},
      formRef: null,
      template: undefined
    }];
    currentProfileIndex = profiles.length - 1;
    currentStep = 'profile-select';
  }

  function removeProfile(profileId: string) {
    profiles = profiles.filter(p => p.id !== profileId);
  }

  function onProfileSelected(event: CustomEvent<ProfileTemplate>) {
    const template = event.detail;
    if (currentProfileIndex >= 0 && currentProfileIndex < profiles.length) {
      profiles[currentProfileIndex].code = template.code;
      profiles[currentProfileIndex].name = template.name;
      profiles[currentProfileIndex].template = template;
      profiles[currentProfileIndex].configuration = {};
      profiles = [...profiles];
      currentStep = 'profile-form';
    }
  }
  
  function nextStep() {
    if (currentStep === 'files') {
      if (uploadedFiles.length === 0) {
        errors.files = 'Please upload at least one file';
        return;
      }
      currentStep = 'info';
    } else if (currentStep === 'info') {
      if (!clientName.trim()) {
        errors.clientName = 'Client name is required';
        return;
      }
      if (!poNumber.trim()) {
        errors.poNumber = 'PO number is required';
        return;
      }
      // Go to profile selection for first profile
      currentStep = 'profile-select';
    }
  }
  
  function prevStep() {
    if (currentStep === 'profile-form') {
      currentStep = 'profile-select';
    } else if (currentStep === 'profile-select') {
      currentStep = 'info';
    } else if (currentStep === 'info') {
      currentStep = 'files';
    }
  }

  function onFilesUploaded(files: any[]) {
    uploadedFiles = [...uploadedFiles, ...files];
  }

  function removeFile(fileId: string) {
    uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
  }

  function validateForm(): boolean {
    errors = {};

    if (!clientName.trim()) {
      errors.clientName = 'Client name is required';
    }

    if (!poNumber.trim()) {
      errors.poNumber = 'PO number is required';
    }

    if (profiles.length === 0) {
      errors.profiles = 'At least one profile is required';
    }

    // Validate each profile configuration
    for (const profile of profiles) {
      if (!profile.code) {
        errors[`profile-${profile.id}`] = 'Profile must be selected';
      }
      if (profile.formRef && !profile.formRef.validate()) {
        errors[`profile-${profile.id}-config`] = 'Profile configuration has errors';
      }
    }

    return Object.keys(errors).length === 0;
  }

  async function saveDraft() {
    if (!validateForm()) {
      return;
    }

    saving = true;

    try {
      // Collect configuration from all profile forms
      const profilesData = profiles.map(profile => ({
        profileCode: profile.code,
        quantity: profile.quantity,
        configuration: profile.formRef ? profile.formRef.getData() : profile.configuration
      }));

      const orderData = {
        clientName,
        clientEmail,
        clientPhone,
        poNumber,
        deadline,
        priority,
        specialInstructions,
        profiles: profilesData,
        files: uploadedFiles.map(f => f.id),
        status: 'DRAFT'
      };

      const url = orderId 
        ? `/api/draft-orders/${orderId}` 
        : '/api/draft-orders';
      
      const method = orderId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const savedOrder = await response.json();
        dispatch('saved', savedOrder);
        closeModal();
      } else {
        const error = await response.json();
        errors.form = error.message || 'Failed to save order';
      }
    } catch (err) {
      console.error('Failed to save draft order:', err);
      errors.form = 'An error occurred while saving';
    } finally {
      saving = false;
    }
  }

  function closeModal() {
    isOpen = false;
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={closeModal} role="button" tabindex="0" on:keydown={(e) => e.key === 'Escape' && closeModal()}>
    <div class="modal-container" on:click|stopPropagation role="dialog" aria-modal="true" aria-label={orderId ? 'Edit Draft Order' : 'New Draft Order'}>
      <div class="modal-header">
        <div class="header-content">
          <FileText size={24} class="header-icon" />
          <div>
            <h2>{orderId ? 'Edit Draft Order' : 'New Draft Order'}</h2>
            <p class="po-number">PO: {poNumber}</p>
          </div>
        </div>
        <div class="step-indicator">
          <span class="step" class:active={currentStep === 'files'}>1. Files</span>
          <span class="step-separator">→</span>
          <span class="step" class:active={currentStep === 'info'}>2. Info</span>
          <span class="step-separator">→</span>
          <span class="step" class:active={currentStep === 'profile-select'}>3. Profile</span>
          <span class="step-separator">→</span>
          <span class="step" class:active={currentStep === 'profile-form'}>4. Details</span>
        </div>
        <button class="close-button" on:click={closeModal} disabled={saving} type="button">
          <X size={24} />
        </button>
      </div>

      <div class="modal-body">
        <!-- Step 1: File Upload -->
        {#if currentStep === 'files'}
          <section class="form-section">
            <h3 class="section-title">
              <Upload size={18} />
              Upload Design Files
            </h3>
            <FileUploader
              on:uploaded={e => onFilesUploaded(e.detail)}
              disabled={readonly || saving}
            />
            
            {#if uploadedFiles.length > 0}
              <div class="uploaded-files">
                {#each uploadedFiles as file}
                  <div class="file-item">
                    <div class="file-info">
                      <FileText size={16} />
                      <span>{file.name}</span>
                      <span class="file-size">{file.size}</span>
                    </div>
                    {#if !readonly}
                      <button
                        class="remove-file-btn"
                        on:click={() => removeFile(file.id)}
                        disabled={saving}
                        type="button"
                      >
                        <Trash2 size={14} />
                      </button>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
            
            {#if errors.files}
              <div class="error-banner">
                <AlertCircle size={16} />
                {errors.files}
              </div>
            {/if}
          </section>

        <!-- Step 2: Order Information -->
        {:else if currentStep === 'info'}
          <section class="form-section">
            <h3 class="section-title">
              <User size={18} />
              Client Information
            </h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="clientName">
                  Client Name <span class="required">*</span>
                </label>
                <input
                  id="clientName"
                  type="text"
                  bind:value={clientName}
                  placeholder="Enter client name..."
                  disabled={readonly || saving}
                  class:error={errors.clientName}
                />
                {#if errors.clientName}
                  <span class="error-message">{errors.clientName}</span>
                {/if}
              </div>

              <div class="form-field">
                <label for="clientEmail">Email</label>
                <input
                  id="clientEmail"
                  type="email"
                  bind:value={clientEmail}
                  placeholder="client@example.com"
                  disabled={readonly || saving}
                />
              </div>

              <div class="form-field">
                <label for="clientPhone">Phone</label>
                <input
                  id="clientPhone"
                  type="tel"
                  bind:value={clientPhone}
                  placeholder="+371 12345678"
                  disabled={readonly || saving}
                />
              </div>
            </div>
          </section>

          <section class="form-section">
            <h3 class="section-title">
              <Hash size={18} />
              Order Details
            </h3>
            <div class="form-grid">
              <div class="form-field">
                <label for="poNumber">
                  PO Number <span class="required">*</span>
                </label>
                <input
                  id="poNumber"
                  type="text"
                  bind:value={poNumber}
                  placeholder="PO-XXXX"
                  disabled={readonly || saving}
                  class:error={errors.poNumber}
                />
                {#if errors.poNumber}
                  <span class="error-message">{errors.poNumber}</span>
                {/if}
              </div>

              <div class="form-field">
                <label for="deadline">
                  <Calendar size={14} />
                  Deadline
                </label>
                <input
                  id="deadline"
                  type="date"
                  bind:value={deadline}
                  disabled={readonly || saving}
                />
              </div>

              <div class="form-field">
                <label for="priority">Priority</label>
                <select
                  id="priority"
                  bind:value={priority}
                  disabled={readonly || saving}
                >
                  <option value="LOW">Low</option>
                  <option value="NORMAL">Normal</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
          </section>

        <!-- Step 3: Profile Selection -->
        {:else if currentStep === 'profile-select'}
          <section class="form-section">
            <ProfileSelectorCards
              templates={$activeTemplates}
              selectedCode={profiles[currentProfileIndex]?.code || ''}
              on:select={onProfileSelected}
            />
          </section>

        <!-- Step 4: Profile Configuration Form -->
        {:else if currentStep === 'profile-form' && profiles[currentProfileIndex]?.template}
          <section class="form-section">
            <div class="profile-quantity-row">
              <label>Quantity for this profile:</label>
              <input
                type="number"
                bind:value={profiles[currentProfileIndex].quantity}
                min="1"
                max="4"
                disabled={readonly || saving}
                class="quantity-input"
              />
            </div>

            {#if profiles[currentProfileIndex].code === 'P7st'}
              <Profile7stVisual
                bind:configuration={profiles[currentProfileIndex].configuration}
                deliveryDate={deadline}
                {readonly}
                on:change={() => profiles = [...profiles]}
              />
            {:else}
              <ProfileFormRenderer
                bind:this={profiles[currentProfileIndex].formRef}
                template={profiles[currentProfileIndex].template}
                bind:configuration={profiles[currentProfileIndex].configuration}
                {readonly}
              />
            {/if}
          </section>
        {/if}

        
        {#if errors.form}
          <div class="error-banner">
            <AlertCircle size={16} />
            {errors.form}
          </div>
        {/if}
      </div>

      <div class="modal-footer">
        <div class="footer-left">
          {#if currentStep !== 'files'}
            <button class="btn-secondary" on:click={prevStep} disabled={saving} type="button">
              <ChevronLeft size={18} />
              Back
            </button>
          {/if}
        </div>
        
        <div class="footer-right">
          <button class="btn-secondary" on:click={closeModal} disabled={saving} type="button">
            Cancel
          </button>
          
          {#if currentStep === 'profile-form'}
            {#if !readonly}
              <button class="btn-primary" on:click={saveDraft} disabled={saving} type="button">
                {#if saving}
                  <span class="spinner"></span>
                  Saving...
                {:else}
                  <Save size={18} />
                  Save Draft
                {/if}
              </button>
            {/if}
          {:else}
            <button class="btn-primary" on:click={nextStep} disabled={saving} type="button">
              Next
              <ChevronRight size={18} />
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-lg, 16px);
    overflow-y: auto;
  }

  .modal-container {
    background: var(--bg-1, #ffffff);
    border-radius: var(--radius-lg, 8px);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 1200px;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-lg, 16px);
    border-bottom: 2px solid var(--border, #e5e7eb);
    background: linear-gradient(135deg, #ff6b35, #f7931e);
    color: white;
    border-radius: var(--radius-lg, 8px) var(--radius-lg, 8px) 0 0;
    gap: var(--space-md, 12px);
  }

  .header-content {
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
  }

  .step-indicator {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    font-size: var(--text-sm, 0.875rem);
    flex: 1;
    justify-content: center;
  }

  .step {
    opacity: 0.6;
    transition: opacity 0.2s ease;
    white-space: nowrap;
  }

  .step.active {
    opacity: 1;
    font-weight: 700;
  }

  .step-separator {
    opacity: 0.4;
  }

  .modal-header :global(.header-icon) {
    padding: var(--space-sm, 8px);
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-md, 6px);
  }

  .modal-header h2 {
    margin: 0;
    font-size: var(--text-xl, 1.25rem);
    font-weight: 700;
  }

  .po-number {
    margin: 0;
    font-size: var(--text-sm, 0.875rem);
    opacity: 0.9;
    font-family: var(--font-mono, monospace);
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: var(--radius-md, 6px);
    color: white;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .close-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  .modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-lg, 16px);
    display: flex;
    flex-direction: column;
    gap: var(--space-xl, 24px);
  }

  .form-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 12px);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    font-size: var(--text-lg, 1.125rem);
    font-weight: 600;
    margin: 0;
    color: #ff6b35;
  }

  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-md, 12px);
  }

  .form-field {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
  }

  .form-field label {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
  }

  .required {
    color: var(--danger, #dc2626);
  }

  input, select, textarea {
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--bg-2, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-md, 6px);
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-primary, #1a1a1a);
    transition: all 0.15s ease;
    font-family: inherit;
  }

  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  input.error {
    border-color: var(--danger, #dc2626);
  }

  .error-message {
    color: var(--danger, #dc2626);
    font-size: var(--text-xs, 0.75rem);
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--danger-bg, #fee2e2);
    color: var(--danger, #dc2626);
    border-radius: var(--radius-md, 6px);
    font-size: var(--text-sm, 0.875rem);
  }

  .add-profile-btn {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: #ff6b35;
    color: white;
    border: none;
    border-radius: var(--radius-md, 6px);
    cursor: pointer;
    font-weight: 600;
    transition: background 0.15s ease;
  }

  .add-profile-btn:hover:not(:disabled) {
    background: #f7931e;
  }

  .profile-card {
    padding: var(--space-lg, 16px);
    background: var(--bg-2, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 8px);
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 12px);
  }

  .profile-card-header {
    display: flex;
    gap: var(--space-md, 12px);
    align-items: flex-end;
  }

  .profile-quantity {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    min-width: 100px;
  }

  .profile-quantity input {
    text-align: center;
    font-weight: 600;
  }

  .remove-profile-btn, .remove-file-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-sm, 8px);
    background: var(--danger-bg, #fee2e2);
    color: var(--danger, #dc2626);
    border: 1px solid var(--danger, #dc2626);
    border-radius: var(--radius-md, 6px);
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .remove-profile-btn:hover:not(:disabled),
  .remove-file-btn:hover:not(:disabled) {
    background: var(--danger, #dc2626);
    color: white;
  }

  .uploaded-files {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--bg-2, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-md, 6px);
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    font-size: var(--text-sm, 0.875rem);
  }

  .file-size {
    color: var(--text-muted, #6b7280);
    font-size: var(--text-xs, 0.75rem);
  }

  .profile-quantity-row {
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
    padding: var(--space-md, 12px);
    background: var(--bg-3, #f3f4f6);
    border-radius: var(--radius-md, 6px);
    margin-bottom: var(--space-md, 12px);
  }

  .profile-quantity-row label {
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
  }

  .quantity-input {
    width: 80px;
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    text-align: center;
    font-weight: 600;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-sm, 4px);
  }

  .modal-footer {
    display: flex;
    justify-content: space-between;
    gap: var(--space-sm, 8px);
    padding: var(--space-lg, 16px);
    border-top: 1px solid var(--border, #e5e7eb);
  }

  .footer-left,
  .footer-right {
    display: flex;
    gap: var(--space-sm, 8px);
  }

  .btn-primary, .btn-secondary {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    padding: var(--space-sm, 8px) var(--space-lg, 16px);
    border-radius: var(--radius-md, 6px);
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-primary {
    background: #ff6b35;
    color: white;
    border: none;
  }

  .btn-primary:hover:not(:disabled) {
    background: #f7931e;
  }

  .btn-secondary {
    background: var(--bg-3, #f3f4f6);
    color: var(--text-primary, #1a1a1a);
    border: 1px solid var(--border, #e5e7eb);
  }

  .btn-secondary:hover:not(:disabled) {
    background: var(--bg-4, #e5e7eb);
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
