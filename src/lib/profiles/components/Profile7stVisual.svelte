<!-- src/lib/profiles/components/Profile7stVisual.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import OracalCodeStack from './fields/OracalCodeStack.svelte';
  import DeliveryDateDisplay from './fields/DeliveryDateDisplay.svelte';
  
  // Configuration interface
  interface Profile7stConfiguration {
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
      placement: 'INTERIOR' | 'EXTERIOR';
    };
    PAINTING: {
      sides: boolean;
      sidesColor: string;
      back: boolean;
      backColor: string;
      frame: boolean;
      frameColor: string;
      colorLabel: string;
      pantoneRef: string;
    };
    ASSEMBLING: {
      led: boolean;
      trafo: boolean;
      cables: boolean;
      frame: boolean;
      ledType: string;
      ledTemp: string;
      ledMode: string;
      mountingHoles: boolean;
      waterholes: boolean;
      waterholesSize: string;
    };
    DELIVERY: {
      date: string;
    };
  }
  
  export let configuration: Profile7stConfiguration = {
    CNC_FREZER: { face: 'OPAL', back: 'ALU 1.5' },
    BENDER: { sides: 'ALU 1.2', depth: 140 },
    FRONT: { opal: true, oracalCodes: ['8500-031', '8500-020', '8500-052'], placement: 'EXTERIOR' },
    PAINTING: { sides: false, sidesColor: 'WHITE', back: false, backColor: 'WHITE', frame: false, frameColor: 'WHITE', colorLabel: 'БАЗА', pantoneRef: '072C' },
    ASSEMBLING: { led: true, trafo: true, cables: true, frame: true, ledType: 'Balt LED', ledTemp: '6500K', ledMode: 'SEPARATE', mountingHoles: true, waterholes: true, waterholesSize: '4mm' },
    DELIVERY: { date: '2025-11-14' }
  };
  export let readonly: boolean = false;
  export let deliveryDate: string = '';
  
  const dispatch = createEventDispatcher();
  
  // Sync deliveryDate prop with configuration (bidirectional sync)
  $: if (deliveryDate !== undefined) {
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
</script>

<div class="profile-7st-visual">
  <!-- Profile Badge -->
  <div class="profile-badge">
    <span>Profile 7st</span>
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
        
        <!-- Interior/Exterior Toggle -->
        <div class="placement-toggle">
          <button 
            type="button"
            class="placement-btn"
            class:active={configuration.FRONT.placement === 'INTERIOR'}
            disabled={readonly}
            on:click={() => { configuration.FRONT.placement = 'INTERIOR'; emitChange(); }}
          >
            INT
          </button>
          <button 
            type="button"
            class="placement-btn"
            class:active={configuration.FRONT.placement === 'EXTERIOR'}
            disabled={readonly}
            on:click={() => { configuration.FRONT.placement = 'EXTERIOR'; emitChange(); }}
          >
            EXT
          </button>
        </div>
        
        <OracalCodeStack 
          bind:codes={configuration.FRONT.oracalCodes}
          {readonly}
          on:change={emitChange}
        />
      </div>
    </div>
    
    <!-- PAINTING Section -->
    <div class="section section-wide">
      <div class="section-header">PAINTING</div>
      <div class="section-content">
        <!-- SIDES with color -->
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
            <div class="color-mini-box">
              {#if readonly}
                <span>{configuration.PAINTING.sidesColor}</span>
              {:else}
                <input 
                  type="text" 
                  class="color-mini-input"
                  bind:value={configuration.PAINTING.sidesColor}
                  on:input={emitChange}
                  placeholder="Color"
                />
              {/if}
            </div>
          {/if}
        </div>
        
        <!-- BACK with color -->
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
            <div class="color-mini-box">
              {#if readonly}
                <span>{configuration.PAINTING.backColor}</span>
              {:else}
                <input 
                  type="text" 
                  class="color-mini-input"
                  bind:value={configuration.PAINTING.backColor}
                  on:input={emitChange}
                  placeholder="Color"
                />
              {/if}
            </div>
          {/if}
        </div>
        
        <!-- FRAME with color -->
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
            <div class="color-mini-box">
              {#if readonly}
                <span>{configuration.PAINTING.frameColor}</span>
              {:else}
                <input 
                  type="text" 
                  class="color-mini-input"
                  bind:value={configuration.PAINTING.frameColor}
                  on:input={emitChange}
                  placeholder="Color"
                />
              {/if}
            </div>
          {/if}
        </div>
        
        <!-- Color Label -->
        <div class="color-label-box">
          {#if readonly}
            <span>{configuration.PAINTING.colorLabel}</span>
          {:else}
            <input 
              type="text" 
              class="color-label-input"
              bind:value={configuration.PAINTING.colorLabel}
              on:input={emitChange}
            />
          {/if}
        </div>
        
        <div class="pantone-ref">
          <span class="pantone-label">PANTONE</span>
          {#if readonly}
            <span class="pantone-value">{configuration.PAINTING.pantoneRef}</span>
          {:else}
            <input 
              type="text" 
              class="pantone-input"
              bind:value={configuration.PAINTING.pantoneRef}
              on:input={emitChange}
            />
          {/if}
        </div>
      </div>
    </div>
    
    <!-- ASSEMBLING Section -->
    <div class="section section-wide">
      <div class="section-header">ASSEMBLING</div>
      <div class="section-content">
        <div class="checkbox-group horizontal">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.led}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">LED</span>
          </label>
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.trafo}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">TRAFO</span>
          </label>
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.cables}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">CABLES</span>
          </label>
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.frame}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">FRAME</span>
          </label>
        </div>
        
        <div class="led-info">
          <div class="led-type-box">
            {#if readonly}
              <span>{configuration.ASSEMBLING.ledType}</span>
            {:else}
              <input 
                type="text" 
                class="led-input"
                bind:value={configuration.ASSEMBLING.ledType}
                on:input={emitChange}
              />
            {/if}
          </div>
          <div class="led-temp-box">
            {#if readonly}
              <span>{configuration.ASSEMBLING.ledTemp}</span>
            {:else}
              <input 
                type="text" 
                class="led-input"
                bind:value={configuration.ASSEMBLING.ledTemp}
                on:input={emitChange}
              />
            {/if}
          </div>
          <div 
            class="led-mode-badge"
            class:separate={configuration.ASSEMBLING.ledMode === 'SEPARATE'}
            class:regular={configuration.ASSEMBLING.ledMode === 'REGULAR'}
          >
            {#if readonly}
              <span>{configuration.ASSEMBLING.ledMode}</span>
            {:else}
              <select 
                class="led-mode-select"
                bind:value={configuration.ASSEMBLING.ledMode}
                on:change={emitChange}
              >
                <option value="REGULAR">REGULAR</option>
                <option value="SEPARATE">SEPARATE</option>
              </select>
            {/if}
          </div>
        </div>
        
        <div class="warning-box" class:active={configuration.ASSEMBLING.mountingHoles}>
          <span class="warning-icon">⚠️</span>
          <span class="warning-text">MOUNTING HOLES</span>
          {#if !readonly}
            <input 
              type="checkbox" 
              class="warning-checkbox"
              bind:checked={configuration.ASSEMBLING.mountingHoles}
              on:change={emitChange}
            />
          {/if}
        </div>
        
        <div class="waterholes-row">
          <label class="checkbox-field">
            <input 
              type="checkbox" 
              bind:checked={configuration.ASSEMBLING.waterholes}
              disabled={readonly}
              on:change={emitChange}
            />
            <span class="checkbox-label">WATERHOLES</span>
          </label>
          <div class="waterholes-size">
            {#if readonly}
              <span>{configuration.ASSEMBLING.waterholesSize}</span>
            {:else}
              <input 
                type="text" 
                class="waterholes-input"
                bind:value={configuration.ASSEMBLING.waterholesSize}
                on:input={emitChange}
              />
            {/if}
          </div>
        </div>
      </div>
    </div>
    
    <!-- DELIVERY Section -->
    <div class="section">
      <div class="section-header">DELIVERY</div>
      <div class="section-content delivery-content">
        <DeliveryDateDisplay 
          bind:date={configuration.DELIVERY.date}
          {readonly}
          on:change={emitChange}
        />
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
  
  .profile-badge {
    display: inline-block;
    padding: 6px 16px;
    background-color: #E91E63;
    color: white;
    font-weight: 700;
    font-size: 14px;
    border-radius: 4px;
    margin-bottom: 12px;
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
    justify-content: center;
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
  .checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .checkbox-group.horizontal {
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
  
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
  
  /* Placement Toggle (Interior/Exterior) */
  .placement-toggle {
    display: flex;
    gap: 2px;
    border: 2px solid #000;
    border-radius: 3px;
    overflow: hidden;
  }
  
  .placement-btn {
    flex: 1;
    padding: 4px 8px;
    background: #f5f5f5;
    border: none;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .placement-btn:disabled {
    cursor: default;
  }
  
  .placement-btn.active {
    background: #4A5568;
    color: #fff;
  }
  
  .placement-btn:not(.active):hover:not(:disabled) {
    background: #e5e5e5;
  }
  
  /* Painting Rows with Individual Colors */
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
  
  .color-mini-box {
    flex: 1;
    border: 2px solid #000;
    border-radius: 3px;
    padding: 4px 6px;
    background: #fff;
    min-width: 60px;
  }
  
  .color-mini-box span {
    font-size: 11px;
    font-weight: 600;
    display: block;
    text-align: center;
  }
  
  .color-mini-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    outline: none;
  }
  
  /* Color Display */
  .color-display {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .color-box {
    border: 2px solid #000;
    border-radius: 3px;
    padding: 8px;
    min-height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
  }
  
  .color-value {
    font-size: 16px;
    font-weight: 700;
    color: #000;
  }
  
  .color-input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 16px;
    font-weight: 700;
    text-align: center;
    outline: none;
  }
  
  .color-label-box {
    border: 2px solid #000;
    border-radius: 3px;
    padding: 4px;
    background: #f5f5f5;
    text-align: center;
  }
  
  .color-label-box span,
  .color-label-input {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #666;
  }
  
  .color-label-input {
    width: 100%;
    border: none;
    background: transparent;
    text-align: center;
    outline: none;
  }
  
  /* Pantone Reference */
  .pantone-ref {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 10px;
  }
  
  .pantone-label {
    color: #666;
    font-weight: 500;
  }
  
  .pantone-value {
    font-weight: 700;
    color: #000;
  }
  
  .pantone-input {
    width: 60px;
    border: 1px solid #ccc;
    border-radius: 2px;
    padding: 2px 4px;
    font-size: 10px;
    font-weight: 700;
    outline: none;
  }
  
  /* LED Info Row */
  .led-info {
    display: flex;
    gap: 4px;
    align-items: center;
    flex-wrap: wrap;
  }
  
  .led-type-box,
  .led-temp-box {
    border: 2px solid #000;
    border-radius: 3px;
    padding: 4px 8px;
    background: #fff;
    font-size: 11px;
    font-weight: 600;
  }
  
  .led-input {
    border: none;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    width: 60px;
    text-align: center;
    outline: none;
  }
  
  .led-mode-badge {
    border-radius: 3px;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }
  
  .led-mode-badge.separate {
    background: #DC2626;
    color: #fff;
  }
  
  .led-mode-badge.regular {
    background: #4A5568;
    color: #fff;
  }
  
  .led-mode-select {
    border: none;
    background: transparent;
    color: inherit;
    font-size: 10px;
    font-weight: 700;
    cursor: pointer;
    outline: none;
  }
  
  .led-mode-select option {
    color: #000;
  }
  
  /* Warning Box */
  .warning-box {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 8px;
    border: 2px solid #ccc;
    border-radius: 3px;
    background: #f9f9f9;
    transition: all 0.15s ease;
  }
  
  .warning-box.active {
    border-color: #DC2626;
    background: #FEF2F2;
  }
  
  .warning-icon {
    font-size: 14px;
  }
  
  .warning-text {
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    color: #333;
    flex: 1;
  }
  
  .warning-checkbox {
    width: 14px;
    height: 14px;
    cursor: pointer;
    accent-color: #DC2626;
  }
  
  /* Waterholes Row */
  .waterholes-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .waterholes-size {
    border: 2px solid #000;
    border-radius: 3px;
    padding: 2px 6px;
    background: #fff;
    font-size: 11px;
    font-weight: 600;
  }
  
  .waterholes-input {
    width: 40px;
    border: none;
    background: transparent;
    font-size: 11px;
    font-weight: 600;
    text-align: center;
    outline: none;
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
