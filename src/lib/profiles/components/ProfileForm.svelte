<!-- src/lib/profiles/components/ProfileForm.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import type { ProfileTemplate, ProfileConfiguration, ProfileField } from '$lib/profiles/types';
  import MaterialSelector from './fields/MaterialSelector.svelte';
  import ColorRAL from './fields/ColorRAL.svelte';
  import ThicknessSelector from './fields/ThicknessSelector.svelte';
  import DimensionInput from './fields/DimensionInput.svelte';
  import MultiSelectChips from './fields/MultiSelectChips.svelte';
  import ToggleSwitch from './fields/ToggleSwitch.svelte';
  import Dropdown from './fields/Dropdown.svelte';
  import { ChevronDown, ChevronUp, AlertCircle } from 'lucide-svelte';

  export let profileCode: string; // e.g., 'P7st'
  export let configuration: ProfileConfiguration = {};
  export let readonly: boolean = false;

  let profileTemplate: ProfileTemplate | null = null;
  let loading = false;
  let errors: Record<string, Record<string, string>> = {};
  let collapsedSections: Set<string> = new Set();

  const formData = writable<ProfileConfiguration>(configuration);

  onMount(async () => {
    await loadProfileTemplate();
  });

  async function loadProfileTemplate() {
    loading = true;
    try {
      const response = await fetch(`/api/profiles/templates/${profileCode}`);
      profileTemplate = await response.json();

      // Initialize form data structure
      if (profileTemplate) {
        profileTemplate.sections.forEach(section => {
          if (!configuration[section.name]) {
            configuration[section.name] = {};
          }
        });
        formData.set(configuration);
      }
    } catch (err) {
      console.error('Failed to load profile template:', err);
    } finally {
      loading = false;
    }
  }

  function updateFieldValue(sectionName: string, fieldKey: string, value: any) {
    formData.update(data => {
      if (!data[sectionName]) {
        data[sectionName] = {};
      }
      data[sectionName][fieldKey] = value;
      return { ...data };
    });

    // Clear error for this field
    if (errors[sectionName]?.[fieldKey]) {
      delete errors[sectionName][fieldKey];
      errors = { ...errors };
    }
  }

  function getFieldValue(sectionName: string, fieldKey: string): any {
    return $formData[sectionName]?.[fieldKey];
  }

  function toggleSection(sectionName: string) {
    if (collapsedSections.has(sectionName)) {
      collapsedSections.delete(sectionName);
    } else {
      collapsedSections.add(sectionName);
    }
    collapsedSections = collapsedSections;
  }

  function isFieldVisible(field: ProfileField, sectionName: string): boolean {
    if (!field.conditionalLogic || field.conditionalLogic.length === 0) {
      return true;
    }

    // Evaluate conditional logic
    return field.conditionalLogic.every(rule => {
      const targetValue = getFieldValue(sectionName, rule.field_key);

      switch (rule.operator) {
        case 'equals':
          return targetValue === rule.value;
        case 'not_equals':
          return targetValue !== rule.value;
        case 'contains':
          return Array.isArray(targetValue) && targetValue.includes(rule.value);
        case 'greater_than':
          return Number(targetValue) > Number(rule.value);
        case 'less_than':
          return Number(targetValue) < Number(rule.value);
        default:
          return true;
      }
    });
  }

  function validateField(field: ProfileField, value: any): string | null {
    if (field.isRequired && (!value || (Array.isArray(value) && value.length === 0))) {
      return 'This field is required';
    }

    if (field.validationRules) {
      for (const rule of field.validationRules) {
        switch (rule.type) {
          case 'min':
            if (Number(value) < Number(rule.value)) {
              return rule.message || `Value must be at least ${rule.value}`;
            }
            break;
          case 'max':
            if (Number(value) > Number(rule.value)) {
              return rule.message || `Value must be at most ${rule.value}`;
            }
            break;
          case 'pattern':
            if (typeof value === 'string' && rule.value && !new RegExp(rule.value).test(value)) {
              return rule.message || 'Invalid format';
            }
            break;
        }
      }
    }

    return null;
  }

  export function validate(): boolean {
    if (!profileTemplate) return false;

    errors = {};
    let isValid = true;

    profileTemplate.sections.forEach(section => {
      section.fields.forEach(field => {
        if (isFieldVisible(field, section.name)) {
          const value = getFieldValue(section.name, field.fieldKey);
          const error = validateField(field, value);
          
          if (error) {
            if (!errors[section.name]) {
              errors[section.name] = {};
            }
            errors[section.name][field.fieldKey] = error;
            isValid = false;
          }
        }
      });
    });

    return isValid;
  }

  export function getData(): ProfileConfiguration {
    return $formData;
  }
</script>

<div class="profile-form">
  {#if loading}
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading profile template...</p>
    </div>
  {:else if profileTemplate}
    <div class="form-header">
      <h2>{profileTemplate.name}</h2>
      {#if profileTemplate.metadata?.description}
        <p class="description">{profileTemplate.metadata.description.en}</p>
      {/if}
    </div>

    <div class="form-sections">
      {#each profileTemplate.sections as section (section.id)}
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
              <h3>{section.displayName.en}</h3>
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
                  {#if isFieldVisible(field, section.name)}
                    <div class="field-wrapper">
                      {#if field.fieldType === 'material_selector'}
                        <MaterialSelector
                          bind:value={$formData[section.name][field.fieldKey]}
                          label={field.label.en}
                          required={field.isRequired}
                          disabled={readonly}
                          options={field.options || []}
                          placeholder={field.placeholder?.en}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'color_ral'}
                        <ColorRAL
                          bind:value={$formData[section.name][field.fieldKey]}
                          label={field.label.en}
                          required={field.isRequired}
                          disabled={readonly}
                          placeholder={field.placeholder?.en}
                          showPreview={field.config?.showPreview ?? true}
                          previewSize={field.config?.previewSize || 'md'}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'thickness_selector'}
                        <ThicknessSelector
                          bind:value={$formData[section.name][field.fieldKey]}
                          label={field.label.en}
                          required={field.isRequired}
                          disabled={readonly}
                          unit={field.config?.unit || 'mm'}
                          step={field.config?.step || 0.5}
                          min={field.config?.min || 0}
                          max={field.config?.max || 100}
                          standardOptions={field.options || []}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'dimension_input'}
                        <DimensionInput
                          bind:value={$formData[section.name][field.fieldKey]}
                          label={field.label.en}
                          required={field.isRequired}
                          disabled={readonly}
                          unit={field.config?.unit || 'mm'}
                          fields={field.config?.fields || ['width', 'height']}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'multi_select_chips'}
                        <MultiSelectChips
                          bind:value={$formData[section.name][field.fieldKey]}
                          options={field.options || []}
                          label={field.label.en}
                          required={field.isRequired}
                          disabled={readonly}
                          maxSelections={field.config?.maxSelections}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'toggle'}
                        <ToggleSwitch
                          bind:value={$formData[section.name][field.fieldKey]}
                          label={field.label.en}
                          disabled={readonly}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'dropdown'}
                        <Dropdown
                          bind:value={$formData[section.name][field.fieldKey]}
                          options={field.options || []}
                          label={field.label.en}
                          required={field.isRequired}
                          disabled={readonly}
                          placeholder={field.placeholder?.en || 'Select...'}
                          error={errors[section.name]?.[field.fieldKey]}
                        />
                      {:else if field.fieldType === 'checkbox'}
                        <label class="checkbox-field">
                          <input
                            type="checkbox"
                            bind:checked={$formData[section.name][field.fieldKey]}
                            disabled={readonly}
                          />
                          <span>{field.label.en}</span>
                        </label>
                      {/if}

                      {#if field.helpText?.en}
                        <div class="field-help">
                          <AlertCircle size={12} />
                          {field.helpText.en}
                        </div>
                      {/if}
                    </div>
                  {/if}
                {/each}
              </div>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {:else}
    <div class="error-state">
      <AlertCircle size={48} />
      <p>Failed to load profile template</p>
    </div>
  {/if}
</div>

<style>
  .profile-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 16px);
  }

  .loading-state,
  .error-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl, 48px);
    gap: var(--space-md, 12px);
    color: var(--text-muted, #6b7280);
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border, #e5e7eb);
    border-top-color: var(--primary, #3b82f6);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .form-header h2 {
    font-size: var(--text-2xl, 1.5rem);
    font-weight: 700;
    margin: 0 0 var(--space-xs, 4px) 0;
  }

  .description {
    color: var(--text-muted, #6b7280);
    font-size: var(--text-sm, 0.875rem);
    margin: 0;
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

  .section-title h3 {
    font-size: var(--text-lg, 1.125rem);
    font-weight: 600;
    margin: 0;
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
  }

  .fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-lg, 16px);
  }

  .field-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
  }

  .field-help {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    font-size: var(--text-xs, 0.75rem);
    color: var(--text-muted, #6b7280);
    padding: var(--space-xs, 4px);
    background: var(--bg-3, #f3f4f6);
    border-radius: var(--radius-sm, 4px);
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
</style>
