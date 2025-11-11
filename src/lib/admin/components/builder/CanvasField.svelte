<!-- src/lib/admin/components/builder/CanvasField.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { GripVertical, Copy, Trash2 } from 'lucide-svelte';

  export let field: any;
  export let selected: boolean = false;

  const dispatch = createEventDispatcher();

  const fieldTypeIcons: Record<string, string> = {
    'material_field': '🔲',
    'color_ral': '🎨',
    'dropdown': '▼',
    'button_group': '🔘',
    'toggle': '⚡',
    'number': '🔢',
    'text': '📝',
    'textarea': '📄',
    'date': '📅',
    'oracal_selector': '📋',
    'signtrim_selector': '✨',
    'info_box': 'ℹ️'
  };

  function handleClick(event: MouseEvent) {
    event.stopPropagation();
    dispatch('select');
  }
</script>

<div 
  class="canvas-field"
  class:selected
  class:visual-box={field.metadata?.visualBox}
  draggable="true"
  on:click={handleClick}
  role="button"
  tabindex="0"
>
  <GripVertical size={12} class="drag-handle" />
  
  <span class="field-icon">
    {fieldTypeIcons[field.field_type] || '❓'}
  </span>

  <div class="field-info">
    <span class="field-label">{field.label_en}</span>
    <span class="field-type">{field.field_type}</span>
  </div>

  <div class="field-actions">
    <button 
      class="field-action-btn"
      on:click|stopPropagation={() => dispatch('duplicate')}
      title="Duplicate"
    >
      <Copy size={12} />
    </button>
    <button 
      class="field-action-btn danger"
      on:click|stopPropagation={() => dispatch('delete')}
      title="Delete"
    >
      <Trash2 size={12} />
    </button>
  </div>

  {#if field.is_required}
    <span class="required-badge">*</span>
  {/if}

  {#if field.metadata?.visualBox}
    <span class="visual-badge" title="Shows as visual box">📦</span>
  {/if}
</div>

<style>
  .canvas-field {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .canvas-field:hover {
    border-color: #667EEA;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .canvas-field.selected {
    border-color: #667EEA;
    background: #EEF2FF;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }

  .canvas-field.visual-box {
    border-left: 4px solid #10b981;
  }

  .drag-handle {
    color: #9ca3af;
    opacity: 0.4;
    flex-shrink: 0;
    cursor: grab;
  }

  .canvas-field:active .drag-handle {
    cursor: grabbing;
  }

  .field-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .field-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .field-label {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .field-type {
    font-size: 10px;
    color: #6b7280;
    font-family: 'Courier New', monospace;
  }

  .field-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.15s ease;
  }

  .canvas-field:hover .field-actions {
    opacity: 1;
  }

  .field-action-btn {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.15s ease;
  }

  .field-action-btn:hover {
    border-color: #667EEA;
    color: #667EEA;
  }

  .field-action-btn.danger:hover {
    border-color: #ef4444;
    color: #ef4444;
  }

  .required-badge {
    position: absolute;
    top: -6px;
    right: -6px;
    width: 18px;
    height: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #ef4444;
    color: white;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
  }

  .visual-badge {
    position: absolute;
    bottom: -6px;
    right: -6px;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #10b981;
    border-radius: 50%;
    font-size: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
</style>
