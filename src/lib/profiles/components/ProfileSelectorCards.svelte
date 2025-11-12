<!-- src/lib/profiles/components/ProfileSelectorCards.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Check } from 'lucide-svelte';
  import type { ProfileTemplate } from '../types';
  import { getComplexityColor, formatManufacturingTime } from '../stores/profileTemplatesStore';

  export let templates: ProfileTemplate[] = [];
  export let selectedCode: string = '';

  const dispatch = createEventDispatcher();

  function selectTemplate(template: ProfileTemplate) {
    selectedCode = template.code;
    dispatch('select', template);
  }

  function getComplexityLabel(category?: string): string {
    switch (category) {
      case 'simple':
        return 'Simple';
      case 'medium':
        return 'Medium';
      case 'complex':
        return 'Complex';
      default:
        return 'Standard';
    }
  }
</script>

<div class="profile-selector">
  <h3 class="selector-title">Select Profile Type</h3>
  <p class="selector-subtitle">Choose the profile that best matches your order requirements</p>
  
  <div class="templates-grid">
    {#each templates as template (template.id)}
      {@const color = getComplexityColor(template.metadata?.category)}
      {@const isSelected = selectedCode === template.code}
      
      <button
        type="button"
        class="template-card"
        class:selected={isSelected}
        on:click={() => selectTemplate(template)}
        style="--card-color: {color};"
      >
        <div class="card-header">
          <div class="template-icon" style="background-color: {color}20;">
            {template.metadata?.icon || '📦'}
          </div>
          <div class="template-badge" style="background-color: {color};">
            {template.code}
          </div>
        </div>

        <div class="card-body">
          <h4 class="template-name">{template.name}</h4>
          <p class="template-description">{template.metadata?.description?.en || ''}</p>
          
          <div class="template-meta">
            <div class="meta-item">
              <span class="meta-icon">📐</span>
              <span>{template.sections.length} sections</span>
            </div>
            <div class="meta-item">
              <span class="meta-icon">⏱️</span>
              <span>{formatManufacturingTime(template.metadata?.manufacturingTime)}</span>
            </div>
          </div>

          <div class="complexity-badge" style="background-color: {color}20; color: {color};">
            {getComplexityLabel(template.metadata?.category)}
          </div>
        </div>

        {#if isSelected}
          <div class="selected-indicator" style="background-color: {color};">
            <Check size={20} color="white" />
          </div>
        {/if}
      </button>
    {/each}
  </div>
</div>

<style>
  .profile-selector {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg, 16px);
  }

  .selector-title {
    margin: 0;
    font-size: var(--text-xl, 1.25rem);
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
  }

  .selector-subtitle {
    margin: 0;
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-muted, #6b7280);
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-lg, 16px);
  }

  .template-card {
    position: relative;
    display: flex;
    flex-direction: column;
    padding: var(--space-lg, 16px);
    background: var(--bg-2, #f9fafb);
    border: 2px solid var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 8px);
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
  }

  .template-card:hover {
    border-color: var(--card-color);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }

  .template-card.selected {
    border-color: var(--card-color);
    border-width: 3px;
    background: var(--bg-1, #ffffff);
    box-shadow: 0 0 0 4px color-mix(in srgb, var(--card-color) 15%, transparent);
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-md, 12px);
  }

  .template-icon {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-lg, 8px);
    font-size: 24px;
  }

  .template-badge {
    padding: 4px 12px;
    color: white;
    font-weight: 700;
    border-radius: var(--radius-sm, 4px);
    font-size: var(--text-sm, 0.875rem);
    font-family: var(--font-mono, monospace);
  }

  .card-body {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm, 8px);
  }

  .template-name {
    margin: 0;
    font-size: var(--text-md, 1rem);
    font-weight: 700;
    color: var(--text-primary, #1a1a1a);
  }

  .template-description {
    margin: 0;
    font-size: var(--text-sm, 0.875rem);
    color: var(--text-muted, #6b7280);
    line-height: 1.4;
    min-height: 40px;
  }

  .template-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs, 4px);
    margin-top: var(--space-sm, 8px);
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 4px);
    font-size: var(--text-xs, 0.75rem);
    color: var(--text-muted, #6b7280);
  }

  .meta-icon {
    font-size: 14px;
  }

  .complexity-badge {
    padding: 4px 10px;
    border-radius: var(--radius-full, 9999px);
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    align-self: flex-start;
    margin-top: var(--space-sm, 8px);
  }

  .selected-indicator {
    position: absolute;
    top: -8px;
    right: -8px;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  }

  @media (max-width: 768px) {
    .templates-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
