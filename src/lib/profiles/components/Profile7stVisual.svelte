<!-- src/lib/profiles/components/Profile7stVisual.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import OracalCodeStack from './fields/OracalCodeStack.svelte';
  import DeliveryDateDisplay from './fields/DeliveryDateDisplay.svelte';
  import CompactColorPicker from './fields/CompactColorPicker.svelte';
  
  // Color value interface
  interface ColorValue {
    system: string;
    code: string;
    hex: string;
  }
  
  // Configuration interface
  interface Profile7stConfiguration {
    profileName?: string;
    signType: 'INTERIOR' | 'EXTERIOR';
    CNC_FREZER: {
      face: string;
      back: string;
    };
    BENDER: {
      sides: string;
      depth: number;
    };
    FRONT: {
      opal: boolean;
      oracalCodes: string[];
    };
    PAINTING: {
      sides: boolean;
      sidesColor: ColorValue;
      back: boolean;
      backColor: ColorValue;
      frame: boolean;
      frameColor: ColorValue;
    };
    ASSEMBLING: {
      led: boolean;
      ledType: string;
      ledTemp: string;
      trafo: boolean;
      trafoType: 'REGULAR' | 'DIMMABLE';
      trafoMounting: 'SEPARATE' | 'ON_FRAME';
      cables: boolean;
      cablesLength: string;
      frame: boolean;
      frameWaterholes: boolean;
      frameMountingHoles: boolean;
    };
    DELIVERY: {
      date: string;
      carrier: string;
      address: string;
    };
  }
  
  const defaultColor: ColorValue = { system: '', code: '', hex: '' };
  
  export let configuration: Profile7stConfiguration = {
    profileName: 'Profile 7st',
    signType: 'EXTERIOR',
    CNC_FREZER: { face: 'OPAL', back: 'ALU 1.5' },
    BENDER: { sides: 'ALU 1.2', depth: 140 },
    FRONT: { opal: true, oracalCodes: ['8500-031', '8500-020', '8500-052'] },
    PAINTING: { 
      sides: true, sidesColor: { ...defaultColor },
      back: false, backColor: { ...defaultColor },
      frame: true, frameColor: { ...defaultColor }
    },
    ASSEMBLING: { 
      led: true, ledType: 'Balt LED', ledTemp: '6500K',
      trafo: true, trafoType: 'REGULAR', trafoMounting: 'SEPARATE',
      cables: true, cablesLength: '2m',
      frame: true, frameWaterholes: true, frameMountingHoles: true
    },
    DELIVERY: { date: '2025-11-14', carrier: '', address: '' }
  };
  export let readonly: boolean = false;
  export let deliveryDate: string = '';
  
  const dispatch = createEventDispatcher();
  
  // LED options
  const ledTypes = ['Balt LED', 'Samsung LED', 'Osram LED', 'Philips LED', 'Meanwell LED'];
  const ledTemps = ['3000K', '4000K', '5000K', '6000K', '6500K'];
  const carriers = ['DHL', 'UPS', 'FedEx', 'DPD', 'TNT', 'Local Delivery', 'Customer Pickup'];
  
  // Sync deliveryDate prop with configuration
  $: if (deliveryDate !== undefined && configuration && configuration.DELIVERY) {
    configuration.DELIVERY.date = deliveryDate || configuration.DELIVERY.date;
  }
  
  function emitChange() {
    dispatch('change', configuration);
  }
  
  function getMaterialBoxStyle(material: string): string {
    if (material.includes('OPAL')) {
      return 'background-color: #F5F5F0; color: #000;';
    } else if (material.includes('ALU')) {
      return 'background-color: #C0C0C0; color: #000;';
    }
    return 'background-color: #fff; color: #000;';
  }
  
  function getColorBoxStyle(color: ColorValue): string {
    if (color.hex) {
      const textColor = getTextColor(color.hex);
      return `background-color: ${color.hex}; color: ${textColor}; border-color: ${color.hex};`;
    }
    return 'background-color: #fff; color: #000;';
  }
  
  function getTextColor(hex: string): string {
    if (!hex || hex.length < 7) return '#000';
    const r = parseInt(hex.substring(1, 3), 16);
    const g = parseInt(hex.substring(3, 5), 16);
    const b = parseInt(hex.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
</script>

<div class="profile-7st-visual">
  <!-- Profile Header with Badge and Sign Type -->
  <div class="profile-header">
    <div class="profile-name-input">
      <input 
        type="text" 
        bind:value={configuration.profileName} 
        placeholder="Profile Name"
        disabled={readonly}
        on:input={emitChange}
      />
    </div>
    
    <!-- Interior/Exterior Toggle -->
    <div class="sign-type-toggle">
      <button 
        type="button"
        class="sign-type-btn"
        class:active={configuration.signType === 'INTERIOR'}
        disabled={readonly}
        on:click={() => { configuration.signType = 'INTERIOR'; emitChange(); }}
      >
        INTERIOR
      </button>
      <button 
        type="button"
        class="sign-type-btn"
        class:active={configuration.signType === 'EXTERIOR'}
        disabled={readonly}
        on:click={() => { configuration.signType = 'EXTERIOR'; emitChange(); }}
      >
        EXTERIOR
      </button>
    </div>
  </div>
  
  <!-- Sections Container -->
  <div class="sections-container">
    <!-- CNC FREZER Section -->
    <div class="section">
      <div class="section-header">CNC FREZER</div>
      <div class="section-content">
        <div class="field-group">
          <label class="field-label">FACE</label>
          <div class="value-box" style={getMaterialBoxStyle(configuration.CNC_FREZER.face)}>
            {#if readonly}
              <span>{configuration.CNC_FREZER.face}</span>
            {:else}
              <input 
                type="text" 
                class="value-input"
                style={getMaterialBoxStyle(configuration.CNC_FREZER.face)}
                bind:value={configuration.CNC_FREZER.face}
                on:input={emitChange}
              />
            {/if}
          </div>
        </div>
        
        <div class="field-group">
          <label class="field-label">BACK</label>
          <div class="value-box" style={getMaterialBoxStyle(configuration.CNC_FREZER.back)}>
            {#if readonly}
              <span>{configuration.CNC_FREZER.back}</span>
            {:else}
              <input 
                type="text" 
                class="value-input"
                style={getMaterialBoxStyle(configuration.CNC_FREZER.back)}
                bind:value={configuration.CNC_FREZER.back}
                on:input={emitChange}
              />
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- BENDER Section -->
    <div class="section">
      <div class="section-header">BENDER</div>
      <div class="section-content">
        <div class="field-group">
          <label class="field-label">SIDES</label>
          <div class="value-box" style={getMaterialBoxStyle(configuration.BENDER.sides)}>
            {#if readonly}
              <span>{configuration.BENDER.sides}</span>
            {:else}
              <input 
                type="text" 
                class="value-input"
                style={getMaterialBoxStyle(configuration.BENDER.sides)}
                bind:value={configuration.BENDER.sides}
                on:input={emitChange}
              />
            {/if}
          </div>
        </div>
        
        <div class="field-group">
          <label class="field-label">DEPTH</label>
          <div class="depth-box">
            {#if readonly}
              <span class="depth-value">{configuration.BENDER.depth}</span>
            {:else}
              <input 
                type="number" 
                class="depth-input"
                bind:value={configuration.BENDER.depth}
                on:input={emitChange}
              />
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- FRONT Section -->
    <div class="section">
      <div class="section-header">FRONT</div>
      <div class="section-content">
        <div class="field-group">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.FRONT.opal}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">OPAL</span>
          </label>
        </div>
        
        <OracalCodeStack 
          bind:codes={configuration.FRONT.oracalCodes}
          {readonly}
          on:change={emitChange}
        />
      </div>
    </div>
    
    <!-- PAINTING Section - Color Pickers for each element -->
    <div class="section section-wide">
      <div class="section-header">PAINTING</div>
      <div class="section-content">
        <!-- SIDES -->
        <div class="painting-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.PAINTING.sides}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">SIDES</span>
          </label>
          {#if configuration.PAINTING.sides}
            <div class="color-picker-wrapper" style={getColorBoxStyle(configuration.PAINTING.sidesColor)}>
              <CompactColorPicker
                bind:value={configuration.PAINTING.sidesColor}
                {readonly}
                on:change={emitChange}
              />
            </div>
          {/if}
        </div>
        
        <!-- BACK -->
        <div class="painting-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.PAINTING.back}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">BACK</span>
          </label>
          {#if configuration.PAINTING.back}
            <div class="color-picker-wrapper" style={getColorBoxStyle(configuration.PAINTING.backColor)}>
              <CompactColorPicker
                bind:value={configuration.PAINTING.backColor}
                {readonly}
                on:change={emitChange}
              />
            </div>
          {/if}
        </div>
        
        <!-- FRAME -->
        <div class="painting-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.PAINTING.frame}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">FRAME</span>
          </label>
          {#if configuration.PAINTING.frame}
            <div class="color-picker-wrapper" style={getColorBoxStyle(configuration.PAINTING.frameColor)}>
              <CompactColorPicker
                bind:value={configuration.PAINTING.frameColor}
                {readonly}
                on:change={emitChange}
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- ASSEMBLING Section - Redesigned -->
    <div class="section section-wide">
      <div class="section-header">ASSEMBLING</div>
      <div class="section-content">
        <!-- LED Row -->
        <div class="assembly-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.led}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">LED</span>
          </label>
          {#if configuration.ASSEMBLING.led}
            <div class="assembly-options">
              <select 
                class="mini-select"
                bind:value={configuration.ASSEMBLING.ledType}
                disabled={readonly}
                on:change={emitChange}
              >
                {#each ledTypes as type}
                  <option value={type}>{type}</option>
                {/each}
              </select>
              <select 
                class="mini-select"
                bind:value={configuration.ASSEMBLING.ledTemp}
                disabled={readonly}
                on:change={emitChange}
              >
                {#each ledTemps as temp}
                  <option value={temp}>{temp}</option>
                {/each}
              </select>
            </div>
          {/if}
        </div>
        
        <!-- TRAFO Row -->
        <div class="assembly-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.trafo}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">TRAFO</span>
          </label>
          {#if configuration.ASSEMBLING.trafo}
            <div class="assembly-options">
              <select 
                class="mini-select"
                bind:value={configuration.ASSEMBLING.trafoType}
                disabled={readonly}
                on:change={emitChange}
              >
                <option value="REGULAR">Regular</option>
                <option value="DIMMABLE">Dimmable</option>
              </select>
              <select 
                class="mini-select"
                class:separate={configuration.ASSEMBLING.trafoMounting === 'SEPARATE'}
                bind:value={configuration.ASSEMBLING.trafoMounting}
                disabled={readonly}
                on:change={emitChange}
              >
                <option value="ON_FRAME">On Frame</option>
                <option value="SEPARATE">Separate</option>
              </select>
            </div>
          {/if}
        </div>
        
        <!-- CABLES Row -->
        <div class="assembly-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.cables}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">CABLES</span>
          </label>
          {#if configuration.ASSEMBLING.cables}
            <div class="assembly-options">
              <div class="length-input-wrapper">
                <input 
                  type="text" 
                  class="length-input"
                  bind:value={configuration.ASSEMBLING.cablesLength}
                  disabled={readonly}
                  on:input={emitChange}
                  placeholder="Length"
                />
              </div>
            </div>
          {/if}
        </div>
        
        <!-- FRAME Row -->
        <div class="assembly-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.frame}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">FRAME</span>
          </label>
          {#if configuration.ASSEMBLING.frame}
            <div class="assembly-options frame-options">
              <label class="mini-checkbox">
                <input 
                  type="checkbox" 
                  bind:checked={configuration.ASSEMBLING.frameWaterholes}
                  disabled={readonly}
                  on:change={emitChange}
                />
                <span>Waterholes</span>
              </label>
              <label class="mini-checkbox warning-option" class:active={configuration.ASSEMBLING.frameMountingHoles}>
                <span class="warning-icon">⚠️</span>
                <input 
                  type="checkbox" 
                  bind:checked={configuration.ASSEMBLING.frameMountingHoles}
                  disabled={readonly}
                  on:change={emitChange}
                />
                <span>Mounting Holes</span>
              </label>
            </div>
          {/if}
        </div>
      </div>
    </div>
    
    <!-- DELIVERY Section - Redesigned -->
    <div class="section section-wide">
      <div class="section-header">DELIVERY</div>
      <div class="section-content delivery-content">
        <!-- Date -->
        <div class="delivery-row">
          <label class="field-label">DATE</label>
          <DeliveryDateDisplay 
            bind:date={configuration.DELIVERY.date}
            {readonly}
            on:change={emitChange}
          />
        </div>
        
        <!-- Carrier -->
        <div class="delivery-row">
          <label class="field-label">CARRIER</label>
          {#if readonly}
            <div class="carrier-display">{configuration.DELIVERY.carrier || '-'}</div>
          {:else}
            <select 
              class="carrier-select"
              bind:value={configuration.DELIVERY.carrier}
              on:change={emitChange}
            >
              <option value="">Select carrier...</option>
              {#each carriers as carrier}
                <option value={carrier}>{carrier}</option>
              {/each}
            </select>
          {/if}
        </div>
        
        <!-- Address -->
        <div class="delivery-row">
          <label class="field-label">ADDRESS</label>
          {#if readonly}
            <div class="address-display">{configuration.DELIVERY.address || '-'}</div>
          {:else}
            <textarea 
              class="address-input"
              bind:value={configuration.DELIVERY.address}
              on:input={emitChange}
              placeholder="Delivery address..."
              rows="2"
            ></textarea>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .profile-7st-visual {
    font-family: Arial, sans-serif;
    max-width: 100%;
    overflow-x: auto;
  }
  
  /* Profile Header with Sign Type */
  .profile-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 12px;
    flex-wrap: wrap;
  }
  
  .profile-name-input input {
    padding: 6px 12px;
    background-color: #E91E63;
    color: white;
    font-weight: 700;
    font-size: 14px;
    border-radius: 4px;
    border: none;
    outline: none;
    width: 200px;
  }

  .profile-name-input input::placeholder {
    color: rgba(255, 255, 255, 0.7);
  }
  
  .sign-type-toggle {
    display: flex;
    gap: 2px;
    border: 2px solid #000;
    border-radius: 4px;
    overflow: hidden;
  }
  
  .sign-type-btn {
    padding: 6px 12px;
    background: #f5f5f5;
    border: none;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .sign-type-btn:disabled {
    cursor: default;
  }
  
  .sign-type-btn.active {
    background: #4A5568;
    color: #fff;
  }
  
  .sign-type-btn:not(.active):hover:not(:disabled) {
    background: #e5e5e5;
  }
  
  /* Sections Container - Horizontal Layout */
  .sections-container {
    display: flex;
    gap: 2px;
    background: #1A1A1A;
    padding: 2px;
    border-radius: 6px;
  }
  
  .section {
    min-width: 120px;
    flex: 1;
    background: white;
    display: flex;
    flex-direction: column;
  }
  
  .section-wide {
    flex: 2;
    min-width: 200px;
  }
  
  .section-header {
    padding: 8px;
    background-color: #4A5568;
    color: white;
    font-weight: 700;
    font-size: 11px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .section-content {
    padding: 8px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
  }
  
  .delivery-content {
    gap: 6px;
  }
  
  /* Field Groups */
  .field-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .field-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    color: #333;
    letter-spacing: 0.5px;
  }
  
  /* Value Boxes */
  .value-box {
    border: 2px solid #000;
    border-radius: 3px;
    padding: 4px 6px;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 12px;
    font-family: 'Courier New', monospace;
  }
  
  .value-input {
    width: 100%;
    border: none;
    background: transparent;
    font-weight: 700;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    text-align: center;
    outline: none;
  }
  
  /* Depth Box */
  .depth-box {
    border: 2px solid #000;
    border-radius: 3px;
    padding: 8px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  
  .depth-value {
    font-size: 24px;
    font-weight: 700;
    color: #000;
  }
  
  .depth-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 24px;
    font-weight: 700;
    text-align: center;
    outline: none;
    -moz-appearance: textfield;
  }
  
  .depth-input::-webkit-outer-spin-button,
  .depth-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  /* Checkbox Fields */
  .checkbox-field {
    display: flex;
    align-items: center;
    gap: 4px;
    cursor: pointer;
  }
  
  .checkbox-field input[type="checkbox"] {
    width: 14px;
    height: 14px;
    margin: 0;
    cursor: pointer;
    accent-color: #4A5568;
  }
  
  .checkbox-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #333;
  }
  
  /* Painting Rows */
  .painting-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid #eee;
  }
  
  .painting-row:last-of-type {
    border-bottom: none;
  }
  
  .color-picker-wrapper {
    flex: 1;
    border-radius: 3px;
    padding: 2px;
  }
  
  /* Assembly Rows */
  .assembly-row {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    border-bottom: 1px solid #eee;
    flex-wrap: wrap;
  }
  
  .assembly-row:last-of-type {
    border-bottom: none;
  }
  
  .assembly-options {
    display: flex;
    gap: 4px;
    flex: 1;
    flex-wrap: wrap;
  }
  
  .frame-options {
    flex-direction: column;
    gap: 4px;
  }
  
  .mini-select {
    padding: 4px 6px;
    border: 2px solid #000;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    background: #fff;
    cursor: pointer;
    min-width: 70px;
  }
  
  .mini-select.separate {
    background: #DC2626;
    color: #fff;
    border-color: #DC2626;
  }
  
  .length-input-wrapper {
    display: flex;
    align-items: center;
  }
  
  .length-input {
    width: 60px;
    padding: 4px 6px;
    border: 2px solid #000;
    border-radius: 3px;
    font-size: 10px;
    font-weight: 600;
    text-align: center;
  }
  
  .mini-checkbox {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 9px;
    font-weight: 600;
    cursor: pointer;
    padding: 3px 6px;
    border: 1px solid #ddd;
    border-radius: 3px;
    background: #f9f9f9;
  }
  
  .mini-checkbox input {
    width: 12px;
    height: 12px;
    margin: 0;
  }
  
  .warning-option {
    border-color: #fca5a5;
    background: #fef2f2;
  }
  
  .warning-option.active {
    border-color: #DC2626;
    background: #fee2e2;
  }
  
  .warning-icon {
    font-size: 12px;
  }
  
  /* Delivery Section */
  .delivery-row {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .carrier-display,
  .address-display {
    padding: 6px 8px;
    border: 2px solid #000;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    background: #f5f5f5;
  }
  
  .carrier-select {
    padding: 6px 8px;
    border: 2px solid #000;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    background: #fff;
    cursor: pointer;
  }
  
  .address-input {
    padding: 6px 8px;
    border: 2px solid #000;
    border-radius: 3px;
    font-size: 11px;
    font-weight: 600;
    resize: vertical;
    min-height: 40px;
    font-family: inherit;
  }
  
  /* Responsive */
  @media (max-width: 1024px) {
    .sections-container {
      flex-direction: column;
    }
    
    .section {
      min-width: 100%;
    }
    
    .section-wide {
      min-width: 100%;
    }
  }
</style>
