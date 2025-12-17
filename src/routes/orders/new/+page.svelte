<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { t } from 'svelte-i18n';
  import { Save, ArrowLeft, AlertCircle, Plus, Trash2, Upload, FileText } from 'lucide-svelte';
  import Profile7stVisual from '$lib/profiles/components/Profile7stVisual.svelte';
  import { createId } from '$lib/utils/id';

  let saving = false;
  let error = '';
  
  // Order Details
  let clientName = '';
  let poNumber = '';
  let deadline = '';
  let notes = '';
  
  // Files
  let files: File[] = [];
  
  // Profiles
  type ProfileItem = {
    id: string;
    quantity: number;
    configuration: any;
  };

  const defaultConfiguration = {
    profileName: 'New Profile',
    signType: 'EXTERIOR' as 'INTERIOR' | 'EXTERIOR',
    CNC_FREZER: { face: 'OPAL', back: 'ALU 1.5' },
    BENDER: { sides: 'ALU 1.2', depth: 140 },
    FRONT: { opal: true, oracalCodes: ['8500-031', '8500-020', '8500-052'] },
    PAINTING: { 
      sides: true, sidesColor: { system: 'RAL', code: '9016', hex: '#F7F7F2' },
      back: false, backColor: { system: '', code: '', hex: '' },
      frame: true, frameColor: { system: 'RAL', code: '9005', hex: '#0A0A0A' }
    },
    ASSEMBLING: { 
      led: true, ledType: 'Balt LED', ledTemp: '6500K',
      trafo: true, trafoType: 'REGULAR' as 'REGULAR' | 'DIMMABLE', trafoMounting: 'SEPARATE' as 'SEPARATE' | 'ON_FRAME',
      cables: true, cablesLength: '2m',
      frame: true, frameWaterholes: true, frameMountingHoles: true
    },
    DELIVERY: { date: '', carrier: '', address: '' }
  };

  let profiles: ProfileItem[] = [
    { id: createId(), quantity: 1, configuration: JSON.parse(JSON.stringify(defaultConfiguration)) }
  ];

  onMount(async () => {
    await generatePONumber();
    // Set default deadline to 2 weeks from now
    const date = new Date();
    date.setDate(date.getDate() + 14);
    deadline = date.toISOString().split('T')[0];
    
    // Update all profiles with default date
    profiles = profiles.map(p => {
      p.configuration.DELIVERY.date = deadline;
      return p;
    });
  });

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
    const newProfile = {
      id: createId(),
      quantity: 1,
      configuration: JSON.parse(JSON.stringify(defaultConfiguration))
    };
    newProfile.configuration.DELIVERY.date = deadline;
    profiles = [...profiles, newProfile];
  }

  function removeProfile(id: string) {
    if (profiles.length > 1) {
      profiles = profiles.filter(p => p.id !== id);
    }
  }

  function handleFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      files = [...files, ...Array.from(input.files)];
    }
  }

  function removeFile(index: number) {
    files = files.filter((_, i) => i !== index);
  }

  async function saveOrder() {
    if (!clientName.trim()) {
      error = 'Client Name is required';
      return;
    }
    if (!poNumber.trim()) {
      error = 'PO Number is required';
      return;
    }
    if (files.length === 0) {
      error = 'Please upload at least one file (CDR or PDF)';
      return;
    }

    saving = true;
    error = '';

    try {
      const orderData = {
        clientName,
        poNumber,
        deadline,
        notes,
        priority: 'NORMAL',
        status: 'DRAFT',
        profiles: profiles.map(p => ({
          profileCode: 'P7st',
          quantity: p.quantity,
          configuration: p.configuration
        })),
        // In a real app, we would upload files first and send IDs
        // For now we just simulate it
        files: files.map(f => ({ name: f.name, size: f.size })) 
      };

      const response = await fetch('/api/draft-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        goto('/orders');
      } else {
        const res = await response.json();
        error = res.message || 'Failed to save order';
      }
    } catch (err) {
      console.error('Error saving order:', err);
      error = 'An unexpected error occurred';
    } finally {
      saving = false;
    }
  }
</script>

<div class="page-container">
  <header class="page-header">
    <div class="header-left">
      <a href="/orders" class="back-link">
        <ArrowLeft size={20} />
        Back to Orders
      </a>
      <h1>New Order</h1>
    </div>
    <div class="header-actions">
      <button class="btn-primary" on:click={saveOrder} disabled={saving}>
        {#if saving}
          Saving...
        {:else}
          <Save size={18} />
          Save Order
        {/if}
      </button>
    </div>
  </header>

  {#if error}
    <div class="error-banner">
      <AlertCircle size={18} />
      {error}
    </div>
  {/if}

  <div class="content-grid">
    <!-- Left Column: Order Details & Files -->
    <div class="left-column">
      <section class="card details-card">
        <h2>Order Details</h2>
        <div class="form-group">
          <label for="poNumber">PO Number</label>
          <input type="text" id="poNumber" bind:value={poNumber} readonly class="readonly" />
        </div>
        <div class="form-group">
          <label for="clientName">Client Name <span class="required">*</span></label>
          <input type="text" id="clientName" bind:value={clientName} placeholder="Enter client name" />
        </div>
        <div class="form-group">
          <label for="deadline">Deadline</label>
          <input type="date" id="deadline" bind:value={deadline} />
        </div>
        <div class="form-group">
          <label for="notes">Notes</label>
          <textarea id="notes" bind:value={notes} rows="3" placeholder="Additional notes..."></textarea>
        </div>
      </section>

      <section class="card files-card">
        <h2>Files <span class="required">*</span></h2>
        <div class="file-upload-area">
          <input 
            type="file" 
            id="file-upload" 
            multiple 
            accept=".pdf,.cdr,.ai,.eps"
            on:change={handleFileSelect}
            style="display: none;"
          />
          <label for="file-upload" class="upload-label">
            <Upload size={24} />
            <span>Click to upload CDR or PDF</span>
          </label>
        </div>
        
        {#if files.length > 0}
          <div class="file-list">
            {#each files as file, i}
              <div class="file-item">
                <div class="file-info">
                  <FileText size={16} />
                  <span class="file-name">{file.name}</span>
                  <span class="file-size">({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
                <button class="btn-icon" on:click={() => removeFile(i)}>
                  <Trash2 size={14} />
                </button>
              </div>
            {/each}
          </div>
        {/if}
      </section>
    </div>

    <!-- Right Column: Profiles -->
    <div class="right-column">
      <div class="profiles-header">
        <h2>Profiles</h2>
        <button class="btn-secondary" on:click={addProfile}>
          <Plus size={16} />
          Add Profile
        </button>
      </div>

      {#each profiles as profile, i (profile.id)}
        <section class="card profile-card">
          <div class="profile-header">
            <h3>{profile.configuration.profileName || `Profile #${i + 1}`}</h3>
            <div class="profile-actions">
              <div class="quantity-control">
                <label>Qty:</label>
                <input type="number" bind:value={profile.quantity} min="1" max="100" class="qty-input" />
              </div>
              {#if profiles.length > 1}
                <button class="btn-icon danger" on:click={() => removeProfile(profile.id)}>
                  <Trash2 size={16} />
                </button>
              {/if}
            </div>
          </div>
          <div class="visual-wrapper">
            <Profile7stVisual 
              bind:configuration={profile.configuration}
              deliveryDate={deadline}
            />
          </div>
        </section>
      {/each}
    </div>
  </div>
</div>

<style>
  .page-container {
    padding: 24px;
    max-width: 1800px;
    margin: 0 auto;
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .back-link {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #6b7280;
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
  }

  .back-link:hover {
    color: #1a1a1a;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: #ff6b35;
    color: white;
    border: none;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .btn-primary:hover:not(:disabled) {
    background: #f7931e;
  }

  .btn-primary:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .btn-secondary {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    color: #374151;
  }

  .btn-secondary:hover {
    background: #f9fafb;
  }

  .error-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: #fee2e2;
    color: #dc2626;
    border-radius: 8px;
    margin-bottom: 24px;
    font-weight: 500;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 350px 1fr;
    gap: 24px;
    align-items: start;
  }

  .left-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
    position: sticky;
    top: 24px;
  }

  .right-column {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  }

  h2 {
    margin: 0 0 20px 0;
    font-size: 18px;
    font-weight: 600;
    color: #1a1a1a;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .form-group {
    margin-bottom: 16px;
  }

  .form-group label {
    display: block;
    margin-bottom: 6px;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
  }

  .required {
    color: #dc2626;
  }

  input, textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 14px;
    color: #1a1a1a;
    font-family: inherit;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  input.readonly {
    background: #f3f4f6;
    color: #6b7280;
    cursor: default;
  }

  /* File Upload */
  .file-upload-area {
    margin-bottom: 16px;
  }

  .upload-label {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 32px;
    border: 2px dashed #d1d5db;
    border-radius: 8px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s;
  }

  .upload-label:hover {
    border-color: #ff6b35;
    color: #ff6b35;
    background: #fff7ed;
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .file-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 12px;
    background: #f9fafb;
    border-radius: 6px;
    font-size: 13px;
  }

  .file-info {
    display: flex;
    align-items: center;
    gap: 8px;
    overflow: hidden;
  }

  .file-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 180px;
  }

  .file-size {
    color: #6b7280;
  }

  .btn-icon {
    background: transparent;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 4px;
    border-radius: 4px;
  }

  .btn-icon:hover {
    background: #e5e7eb;
    color: #1a1a1a;
  }

  .btn-icon.danger:hover {
    background: #fee2e2;
    color: #dc2626;
  }

  /* Profiles */
  .profiles-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .profile-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .profile-header h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .profile-actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .quantity-control {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
  }

  .qty-input {
    width: 60px;
    text-align: center;
  }

  .visual-wrapper {
    overflow-x: auto;
  }

  @media (max-width: 1024px) {
    .content-grid {
      grid-template-columns: 1fr;
    }
    
    .left-column {
      position: static;
    }
  }
</style>
