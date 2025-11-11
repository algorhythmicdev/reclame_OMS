<!-- src/lib/profiles/components/ProfileFormVisual.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import MaterialField from './fields/MaterialField.svelte';
  import ColorRAL from './fields/ColorRAL.svelte';
  import OracalSelector from './fields/OracalSelector.svelte';
  import ButtonGroup from './fields/ButtonGroup.svelte';
  import InfoBox from './fields/InfoBox.svelte';
  import type { ProfileTemplate } from '$lib/profiles/types';

  export let profileCode: string;
  export let configuration: any = {};
  export let readonly: boolean = false;

  let template: ProfileTemplate | null = null;
  let loading = false;

  onMount(async () => {
    await loadTemplate();
  });

  async function loadTemplate() {
    loading = true;
    try {
      const response = await fetch(`/api/profiles/templates/${profileCode}`);
      template = await response.json();
    } catch (err) {
      console.error('Failed to load template:', err);
    } finally {
      loading = false;
    }
  }

  function getFieldValue(sectionName: string, fieldKey: string): any {
    return configuration[sectionName]?.[fieldKey];
  }

  function updateField(sectionName: string, fieldKey: string, value: any) {
    if (!configuration[sectionName]) {
      configuration[sectionName] = {};
    }
    configuration[sectionName][fieldKey] = value;
    configuration = { ...configuration };
  }

  function getSectionHeaderColor(section: any): string {
    return section.metadata?.color || '#1a1a1a';
  }

  function getVisualBoxStyle(field: any, value: any): string {
    if (!field.metadata?.visualBox) return '';
    
    let bgColor = '#E5E7EB';
    let textColor = '#000';
    
    // Material field - use material color
    if (field.fieldType === 'material_field' && value?.materialCode) {
      bgColor = getMaterialBoxColor(value);
    }
    // RAL color field
    else if (field.fieldType === 'color_ral' && value) {
      bgColor = `#${value}`; // Assuming RAL hex
    }
    // Predefined box color
    else if (field.metadata?.boxColor) {
      bgColor = field.metadata.boxColor;
    }
    
    if (field.metadata?.boxTextColor) {
      textColor = field.metadata.boxTextColor;
    } else {
      // Auto-determine text color based on background
      textColor = isColorDark(bgColor) ? '#fff' : '#000';
    }
    
    return `background-color: ${bgColor}; color: ${textColor};`;
  }

  function getMaterialBoxColor(materialValue: any): string {
    // This would come from materials database
    if (materialValue.materialCode?.includes('WN071')) return '#F5F5F0';
    if (materialValue.materialCode?.includes('WN297')) return '#FAFAFA';
    if (materialValue.materialCode?.startsWith('ALU')) return '#C0C0C0';
    if (materialValue.materialCode?.startsWith('PVC')) return '#FFFFFF';
    return '#E5E7EB';
  }

  function isColorDark(hexColor: string): boolean {
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
  }

  function getFieldDisplayValue(field: any, value: any): string {
    if (!value) return '';
    
    if (field.fieldType === 'material_field') {
      return value.materialCode || '';
    } else if (field.fieldType === 'color_ral') {
      return `RAL ${value}`;
    } else if (field.fieldType === 'toggle') {
      return value ? 'YES' : 'NO';
    } else if (typeof value === 'string') {
      return value;
    }
    return String(value);
  }

  function initializeSectionConfig() {
    if (!template) return;
    template.sections?.forEach(section => {
      if (!configuration[section.name]) {
        configuration[section.name] = {};
      }
    });
  }

  $: if (template) {
    initializeSectionConfig();
  }
</script>

{#if loading}
  <div class="loading">Loading form...</div>
{:else if template}
  <div class="profile-form-visual">
    <!-- Form Header -->
    <div class="form-header">
      <div class="profile-badge" style="background-color: #E91E63;">
        Profile {profileCode}
      </div>
      <h2>{template.name}</h2>
    </div>

    <!-- Sections (Horizontal Layout like PDF) -->
    <div class="sections-container">
      {#each template.sections || [] as section}
        <div class="section">
          <!-- Section Header (Black Box) -->
          <div 
            class="section-header" 
            style="background-color: {getSectionHeaderColor(section)};"
          >
            {section.displayName?.en || section.display_name_en || section.name}
          </div>

          <!-- Section Fields (Vertical within section) -->
          <div class="section-fields">
            {#each section.fields || [] as field}
              {@const fieldValue = getFieldValue(section.name, field.fieldKey || field.field_key)}
              <div 
                class="field-wrapper"
                class:full-width={field.metadata?.fullWidth}
                class:visual-box-field={field.metadata?.visualBox}
              >
                {#if field.fieldType === 'material_field' || field.field_type === 'material_field'}
                  <MaterialField
                    bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                    label={field.label?.en || field.label_en || field.fieldKey}
                    required={field.isRequired || field.is_required}
                    disabled={readonly}
                    materialTypes={field.options || field.config?.materialTypes || []}
                    on:change={() => updateField(section.name, field.fieldKey || field.field_key, configuration[section.name][field.fieldKey || field.field_key])}
                  />
                {:else if field.fieldType === 'color_ral' || field.field_type === 'color_ral'}
                  <ColorRAL
                    bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                    label={field.label?.en || field.label_en || field.fieldKey}
                    required={field.isRequired || field.is_required}
                    disabled={readonly}
                    showPreview={field.config?.showPreview !== false}
                  />
                {:else if field.fieldType === 'oracal_selector' || field.field_type === 'oracal_selector'}
                  <OracalSelector
                    bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                    label={field.label?.en || field.label_en || field.fieldKey}
                    required={field.isRequired || field.is_required}
                    disabled={readonly}
                    series={field.config?.series || '8500'}
                    showColorPreview={field.config?.showColorPreview !== false}
                  />
                {:else if field.fieldType === 'button_group' || field.field_type === 'button_group'}
                  <ButtonGroup
                    bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                    label={field.label?.en || field.label_en || field.fieldKey}
                    required={field.isRequired || field.is_required}
                    disabled={readonly}
                    options={field.options || field.config?.options || []}
                    visualStyle={field.config?.visualStyle || 'buttons'}
                  />
                {:else if field.fieldType === 'info_box' || field.field_type === 'info_box'}
                  <InfoBox
                    content={field.config?.content || ''}
                    type={field.config?.type || 'info'}
                    icon={field.config?.icon || 'alert-circle'}
                    fullWidth={field.metadata?.fullWidth || false}
                  />
                {:else if field.fieldType === 'dropdown' || field.field_type === 'dropdown'}
                  <div class="field">
                    <label>{field.label?.en || field.label_en || field.fieldKey}</label>
                    <select 
                      bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                      disabled={readonly}
                    >
                      <option value="">Select...</option>
                      {#each (field.options || field.config?.options || []) as option}
                        <option value={option}>{option}</option>
                      {/each}
                    </select>
                  </div>
                {:else if field.fieldType === 'toggle' || field.field_type === 'toggle'}
                  <label class="toggle-field">
                    <input 
                      type="checkbox"
                      bind:checked={configuration[section.name][field.fieldKey || field.field_key]}
                      disabled={readonly}
                    />
                    <span>{field.label?.en || field.label_en || field.fieldKey}</span>
                  </label>
                {:else if field.fieldType === 'numeric_input' || field.field_type === 'numeric_input'}
                  <div class="field">
                    <label>{field.label?.en || field.label_en || field.fieldKey}</label>
                    <input 
                      type="number"
                      bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                      min={field.config?.min}
                      max={field.config?.max}
                      step={field.config?.step}
                      disabled={readonly}
                    />
                    {#if field.config?.unit}
                      <span class="unit">{field.config.unit}</span>
                    {/if}
                  </div>
                {:else if field.fieldType === 'textarea' || field.field_type === 'textarea'}
                  <div class="field">
                    <label>{field.label?.en || field.label_en || field.fieldKey}</label>
                    <textarea
                      bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                      rows={field.config?.rows || 3}
                      placeholder={field.placeholder?.en || field.placeholder_en || field.config?.placeholder || ''}
                      disabled={readonly}
                    ></textarea>
                  </div>
                {:else if field.fieldType === 'date_input' || field.field_type === 'date_input'}
                  <div class="field">
                    <label>{field.label?.en || field.label_en || field.fieldKey}</label>
                    <input 
                      type="date"
                      bind:value={configuration[section.name][field.fieldKey || field.field_key]}
                      disabled={readonly}
                    />
                  </div>
                {/if}

                <!-- Visual Box Display (PDF Style) -->
                {#if field.metadata?.visualBox && fieldValue}
                  <div 
                    class="visual-box"
                    style={getVisualBoxStyle(field, fieldValue)}
                  >
                    {getFieldDisplayValue(field, fieldValue)}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .profile-form-visual {
    font-family: Arial, sans-serif;
    max-width: 100%;
    overflow-x: auto;
  }

  .form-header {
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
    margin-bottom: var(--space-xl, 24px);
  }

  .profile-badge {
    padding: var(--space-xs, 4px) var(--space-md, 12px);
    color: white;
    font-weight: 700;
    border-radius: var(--radius-sm, 4px);
    font-size: var(--text-lg, 1.125rem);
  }

  .form-header h2 {
    margin: 0;
    font-size: var(--text-xl, 1.25rem);
  }

  /* Sections Container - Horizontal Layout */
  .sections-container {
    display: flex;
    gap: 2px;
    background: #000;
    padding: 2px;
    border-radius: var(--radius-md, 6px);
    overflow-x: auto;
  }

  .section {
    min-width: 150px;
    flex: 1;
    background: white;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    padding: var(--space-sm, 8px);
    color: white;
    font-weight: 700;
    font-size: 11px;
    text-align: center;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .section-fields {
    padding: var(--space-sm, 8px);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
    flex: 1;
  }

  .field-wrapper {
    position: relative;
  }

  .field-wrapper.full-width {
    grid-column: 1 / -1;
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .field label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    color: #333;
  }

  .field input,
  .field select,
  .field textarea {
    padding: 4px 6px;
    border: 1px solid #ccc;
    border-radius: 3px;
    font-size: 11px;
  }

  .field .unit {
    font-size: 10px;
    color: #666;
    margin-left: 4px;
  }

  .toggle-field {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    cursor: pointer;
  }

  .toggle-field input[type="checkbox"] {
    width: 16px;
    height: 16px;
  }

  /* Visual Box (PDF Style) */
  .visual-box {
    margin-top: 6px;
    padding: 6px 10px;
    border: 2px solid #000;
    border-radius: 3px;
    font-weight: 700;
    font-size: 12px;
    text-align: center;
    min-height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    font-family: 'Courier New', monospace;
  }

  .loading {
    padding: var(--space-2xl, 32px);
    text-align: center;
    color: var(--text-muted, #6b7280);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .sections-container {
      flex-direction: column;
    }

    .section {
      min-width: 100%;
    }
  }
</style>
