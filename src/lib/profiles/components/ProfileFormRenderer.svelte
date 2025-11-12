<!-- src/lib/profiles/components/ProfileFormRenderer.svelte -->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import type { ProfileTemplate, ProfileSection, ProfileField, ProfileConfiguration } from '../types';
  import MaterialSelector from './fields/MaterialSelector.svelte';
  import ColorRAL from './fields/ColorRAL.svelte';
  import ThicknessSelector from './fields/ThicknessSelector.svelte';
  import DimensionInput from './fields/DimensionInput.svelte';
  import MultiSelectChips from './fields/MultiSelectChips.svelte';
  import ToggleSwitch from './fields/ToggleSwitch.svelte';
  import Dropdown from './fields/Dropdown.svelte';
  import { ChevronDown, ChevronUp, Info } from 'lucide-svelte';

  export let template: ProfileTemplate;
  export let configuration: ProfileConfiguration = {};
  export let readonly: boolean = false;

  const dispatch = createEventDispatcher();

  let collapsedSections = new Set<string>();
  let errors: Record<string, Record<string, string>> = {};

  // Initialize configuration for all sections and fields
  $: {
    template.sections.forEach(section => {
      if (!configuration[section.name]) {
        configuration[section.name] = {};
      }
      section.fields.forEach(field => {
        if (configuration[section.name][field.fieldKey] === undefined) {
          configuration[section.name][field.fieldKey] = field.defaultValue;
        }
      });
    });
  }

  function updateFieldValue(sectionName: string, fieldKey: string, value: any) {
    if (!configuration[sectionName]) {
      configuration[sectionName] = {};
    }
    configuration[sectionName][fieldKey] = value;
    configuration = { ...configuration };
    
    // Clear error
    if (errors[sectionName]?.[fieldKey]) {
      delete errors[sectionName][fieldKey];
      errors = { ...errors };
    }
    
    dispatch('change', { configuration });
  }

  function toggleSection(sectionName: string) {
    if (collapsedSections.has(sectionName)) {
      collapsedSections.delete(sectionName);
    } else {
      collapsedSections.add(sectionName);
    }
    collapsedSections = new Set(collapsedSections);
  }

  export function validate(): boolean {
    errors = {};
    let isValid = true;

    template.sections.forEach(section => {
      section.fields.forEach(field => {
        const value = configuration[section.name]?.[field.fieldKey];
        
        if (field.isRequired && (value === undefined || value === null || value === '')) {
          if (!errors[section.name]) {
            errors[section.name] = {};
          }
          errors[section.name][field.fieldKey] = 'This field is required';
          isValid = false;
        }

        // Additional validation rules
        if (field.validationRules) {
          field.validationRules.forEach(rule => {
            if (rule.type === 'min' && Number(value) < Number(rule.value)) {
              if (!errors[section.name]) errors[section.name] = {};
              errors[section.name][field.fieldKey] = rule.message || `Minimum value is ${rule.value}`;
              isValid = false;
            }
            if (rule.type === 'max' && Number(value) > Number(rule.value)) {
              if (!errors[section.name]) errors[section.name] = {};
              errors[section.name][field.fieldKey] = rule.message || `Maximum value is ${rule.value}`;
              isValid = false;
            }
          });
        }
      });
    });

    return isValid;
  }

  export function getData(): ProfileConfiguration {
    return configuration;
  }
</script>

<div class="profile-form-renderer">
  <!-- Profile Header -->
  <div class="form-header">
    <div class="profile-info">
      <div class="profile-badge" style="background-color: #ff6b35;">
        {template.code}
      </div>
      <div>
        <h3 class="profile-name">{template.name}</h3>
        {#if template.metadata?.description}
          <p class="profile-desc">{template.metadata.description.en}</p>
        {/if}
      </div>
    </div>
  </div>

  <!-- Sections -->
  <div class="form-sections">
    {#each template.sections.sort((a, b) => a.orderIndex - b.orderIndex) as section (section.id)}
      <div class="section" class:collapsed={collapsedSections.has(section.name)}>
        <button
          type="button"
          class="section-header"
          on:click={() => toggleSection(section.name)}
        >
          <div class="section-title">
            {#if section.icon}
              <span class="section-icon">{section.icon}</span>
            {/if}
            <h4>{section.displayName.en}</h4>
            {#if section.isRequired}
              <span class="required-badge">Required</span>
            {/if}
          </div>
          <div class="section-toggle">
            {#if collapsedSections.has(section.name)}
              <ChevronDown size={20} />
            {:else}
              <ChevronUp size={20} />
            {/if}
          </div>
        </button>

        {#if !collapsedSections.has(section.name)}
          <div class="section-content">
            <div class="fields-grid">
              {#each section.fields.sort((a, b) => a.orderIndex - b.orderIndex) as field (field.id)}
                <div class="field-wrapper">
                  {#if field.fieldType === 'material_selector'}
                    <MaterialSelector
                      bind:value={configuration[section.name][field.fieldKey]}
                      label={field.label.en}
                      required={field.isRequired}
                      disabled={readonly}
                      options={field.options || []}
                      placeholder={field.placeholder?.en}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'color_ral'}
                    <ColorRAL
                      bind:value={configuration[section.name][field.fieldKey]}
                      label={field.label.en}
                      required={field.isRequired}
                      disabled={readonly}
                      placeholder={field.placeholder?.en}
                      showPreview={field.config?.showPreview ?? true}
                      previewSize={field.config?.previewSize || 'md'}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'thickness_selector'}
                    <ThicknessSelector
                      bind:value={configuration[section.name][field.fieldKey]}
                      label={field.label.en}
                      required={field.isRequired}
                      disabled={readonly}
                      unit={field.config?.unit || 'mm'}
                      step={field.config?.step || 0.5}
                      min={field.config?.min || 0}
                      max={field.config?.max || 100}
                      standardOptions={field.options || []}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'dimension_input'}
                    <DimensionInput
                      bind:value={configuration[section.name][field.fieldKey]}
                      label={field.label.en}
                      required={field.isRequired}
                      disabled={readonly}
                      unit={field.config?.unit || 'mm'}
                      fields={field.config?.fields || ['width', 'height']}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'multi_select_chips'}
                    <MultiSelectChips
                      bind:value={configuration[section.name][field.fieldKey]}
                      options={field.options || []}
                      label={field.label.en}
                      required={field.isRequired}
                      disabled={readonly}
                      maxSelections={field.config?.maxSelections}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'toggle'}
                    <ToggleSwitch
                      bind:value={configuration[section.name][field.fieldKey]}
                      label={field.label.en}
                      disabled={readonly}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'dropdown'}
                    <Dropdown
                      bind:value={configuration[section.name][field.fieldKey]}
                      options={field.options || []}
                      label={field.label.en}
                      required={field.isRequired}
                      disabled={readonly}
                      placeholder={field.placeholder?.en || 'Select...'}
                      error={errors[section.name]?.[field.fieldKey]}
                      on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                    />

                  {:else if field.fieldType === 'numeric_input'}
                    <div class="numeric-field">
                      <label>
                        {field.label.en}
                        {#if field.isRequired}<span class="required">*</span>{/if}
                      </label>
                      <div class="number-input-wrapper">
                        <input
                          type="number"
                          bind:value={configuration[section.name][field.fieldKey]}
                          min={field.config?.min}
                          max={field.config?.max}
                          step={field.config?.step || 1}
                          disabled={readonly}
                          on:input={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                          placeholder={field.placeholder?.en}
                        />
                        {#if field.config?.unit}
                          <span class="unit">{field.config.unit}</span>
                        {/if}
                      </div>
                      {#if errors[section.name]?.[field.fieldKey]}
                        <span class="error-text">{errors[section.name][field.fieldKey]}</span>
                      {/if}
                    </div>

                  {:else if field.fieldType === 'date_input'}
                    <div class="date-field">
                      <label>
                        {field.label.en}
                        {#if field.isRequired}<span class="required">*</span>{/if}
                      </label>
                      <input
                        type="date"
                        bind:value={configuration[section.name][field.fieldKey]}
                        disabled={readonly}
                        on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                      />
                      {#if errors[section.name]?.[field.fieldKey]}
                        <span class="error-text">{errors[section.name][field.fieldKey]}</span>
                      {/if}
                    </div>

                  {:else if field.fieldType === 'text_input'}
                    <div class="text-field">
                      <label>
                        {field.label.en}
                        {#if field.isRequired}<span class="required">*</span>{/if}
                      </label>
                      <input
                        type="text"
                        bind:value={configuration[section.name][field.fieldKey]}
                        disabled={readonly}
                        placeholder={field.placeholder?.en}
                        on:input={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                      />
                      {#if errors[section.name]?.[field.fieldKey]}
                        <span class="error-text">{errors[section.name][field.fieldKey]}</span>
                      {/if}
                    </div>

                  {:else if field.fieldType === 'textarea'}
                    <div class="textarea-field">
                      <label>
                        {field.label.en}
                        {#if field.isRequired}<span class="required">*</span>{/if}
                      </label>
                      <textarea
                        bind:value={configuration[section.name][field.fieldKey]}
                        rows={field.config?.rows || 4}
                        disabled={readonly}
                        placeholder={field.placeholder?.en}
                        on:input={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                      />
                      {#if errors[section.name]?.[field.fieldKey]}
                        <span class="error-text">{errors[section.name][field.fieldKey]}</span>
                      {/if}
                    </div>

                  {:else if field.fieldType === 'checkbox'}
                    <label class="checkbox-field">
                      <input
                        type="checkbox"
                        bind:checked={configuration[section.name][field.fieldKey]}
                        disabled={readonly}
                        on:change={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                      />
                      <span>{field.label.en}</span>
                    </label>

                  {:else}
                    <!-- Fallback for unknown field types -->
                    <div class="unknown-field">
                      <span class="field-type-badge">{field.fieldType}</span>
                      <input
                        type="text"
                        bind:value={configuration[section.name][field.fieldKey]}
                        disabled={readonly}
                        on:input={() => updateFieldValue(section.name, field.fieldKey, configuration[section.name][field.fieldKey])}
                      />
                    </div>
                  {/if}

                  {#if field.helpText?.en}
                    <div class="field-help">
                      <Info size={12} />
                      <span>{field.helpText.en}</span>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>

<style>
  .profile-form-renderer {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 16px);
  }

  .form-header {
    padding: var(--space-lg, 16px);
    background: var(--bg-2, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 8px);
  }

  .profile-info {
    display: flex;
    align-items: center;
    gap: var(--space-md, 12px);
  }

  .profile-badge {
    padding: 8px 16px;
    color: white;
    font-weight: 700;
    border-radius: var(--radius-md, 6px);
    font-size: var(--text-lg, 1.125rem);
    font-family: var(--font-mono, monospace);
  }

  .profile-name {
    margin: 0;
    font-size: var(--text-lg, 1.125rem);
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
  }

  .profile-desc {
    margin: 4px 0 0 0;
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-muted, #6b7280);
  }

  .form-sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-md, 12px);
  }

  .section {
    background: var(--bg-2, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 8px);
    overflow: hidden;
  }

  .section-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md, 12px) var(--space-lg, 16px);
    background: var(--bg-3, #f3f4f6);
    border: none;
    cursor: pointer;
    transition: background 0.15s ease;
  }

  .section-header:hover {
    background: var(--bg-4, #e5e7eb);
  }

  .section-title {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
  }

  .section-icon {
    font-size: 20px;
  }

  .section-title h4 {
    margin: 0;
    font-size: var(--text-md, 1rem);
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
  }

  .required-badge {
    padding: 2px 8px;
    background: var(--danger-bg, #fee2e2);
    color: var(--danger, #dc2626);
    border-radius: var(--radius-full, 9999px);
    font-size: var(--text-xs, 0.75rem);
    font-weight: 600;
  }

  .section-toggle {
    color: var(--text-muted, #6b7280);
  }

  .section-content {
    padding: var(--space-lg, 16px);
    background: white;
  }

  .fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-lg, 16px);
  }

  .field-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
  }

  .field-help {
    display: flex;
    align-items: flex-start;
    gap: var(--space-xs, 4px);
    font-size: var(--text-xs, 0.75rem);
    color: var(--text-muted, #6b7280);
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    background: var(--bg-3, #f3f4f6);
    border-radius: var(--radius-sm, 4px);
  }

  /* Generic field styles */
  label {
    font-size: var(--text-sm, 0.875rem);
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
  }

  .required {
    color: var(--danger, #dc2626);
  }

  input[type="text"],
  input[type="number"],
  input[type="date"],
  textarea {
    padding: var(--space-sm, 8px) var(--space-md, 12px);
    background: var(--bg-2, #f9fafb);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-md, 6px);
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-primary, #1a1a1a);
    transition: all 0.15s ease;
    font-family: inherit;
  }

  input:focus,
  textarea:focus {
    outline: none;
    border-color: #ff6b35;
    box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
  }

  textarea {
    resize: vertical;
  }

  .error-text {
    color: var(--danger, #dc2626);
    font-size: var(--text-xs, 0.75rem);
  }

  .number-input-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
  }

  .number-input-wrapper input {
    flex: 1;
  }

  .unit {
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-muted, #6b7280);
    font-weight: 600;
  }

  .checkbox-field {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px);
    cursor: pointer;
  }

  .checkbox-field input[type="checkbox"] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }

  .unknown-field {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
  }

  .field-type-badge {
    padding: 2px 8px;
    background: var(--warning-bg, #fef3c7);
    color: var(--warning, #d97706);
    border-radius: var(--radius-sm, 4px);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
  }

  @media (max-width: 768px) {
    .fields-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
