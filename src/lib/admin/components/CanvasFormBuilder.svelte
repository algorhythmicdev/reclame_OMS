<!-- src/lib/admin/components/CanvasFormBuilder.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { 
    Plus, Save, Eye, Undo, Redo, Download, Upload,
    X, ChevronDown, ChevronUp, Settings, Trash2, Copy, Edit
  } from 'lucide-svelte';
  import type { ProfileTemplate, ProfileSection, ProfileField } from '$lib/profiles/types';
  import HorizontalPalette from './builder/HorizontalPalette.svelte';
  import PropertiesPanel from './builder/PropertiesPanel.svelte';
  import CanvasSection from './builder/CanvasSection.svelte';
  import ProfileFormRenderer from '$lib/profiles/components/ProfileFormRenderer.svelte';

  export let isOpen: boolean = false;
  export let templateId: number | null = null;

  const dispatch = createEventDispatcher();

  // Template state
  let template: Partial<ProfileTemplate> = {
    code: '',
    name: '',
    version: 1,
    isActive: true,
    sections: [],
    metadata: {
      icon: 'layers',
      description: {
        en: '',
        ru: '',
        lv: ''
      },
      category: 'standard',
      manufacturingTime: 120
    }
  };

  // Editor state
  let selectedElement: any = null;
  let selectedType: 'template' | 'section' | 'field' | null = null;
  let propertiesPanelOpen = false;
  let showPreview = false;
  let hasUnsavedChanges = false;

  // History for undo/redo
  let historyStack: any[] = [];
  let historyIndex = -1;

  // Drag and drop state
  let draggedComponent: any = null;
  let dropTargetSectionId: string | null = null;

  onMount(async () => {
    if (templateId) {
      await loadTemplate(templateId);
    } else {
      initializeNewTemplate();
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', handleKeyboardShortcut);
    return () => window.removeEventListener('keydown', handleKeyboardShortcut);
  });

  function initializeNewTemplate() {
    template = {
      code: `P${Math.floor(Math.random() * 100)}`,
      name: 'New Profile Template',
      version: 1,
      isActive: true,
      sections: [],
      metadata: {
        icon: 'layers',
        description: {
          en: '',
          ru: '',
          lv: ''
        },
        category: 'standard',
        manufacturingTime: 120
      }
    };
    pushHistory();
  }

  async function loadTemplate(id: number) {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/profiles/templates/${id}?admin=true`);
      // template = await response.json();
      
      // Mock for now
      console.log('Loading template:', id);
      initializeNewTemplate();
      pushHistory();
    } catch (err) {
      console.error('Failed to load template:', err);
      alert('Failed to load template');
    }
  }

  // History Management
  function pushHistory() {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(JSON.parse(JSON.stringify(template)));
    historyIndex++;
    
    if (historyStack.length > 50) {
      historyStack.shift();
      historyIndex--;
    }
    hasUnsavedChanges = true;
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      template = JSON.parse(JSON.stringify(historyStack[historyIndex]));
      hasUnsavedChanges = true;
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      template = JSON.parse(JSON.stringify(historyStack[historyIndex]));
      hasUnsavedChanges = true;
    }
  }

  // Section Operations
  function addSection(sectionType?: string) {
    const newSection: ProfileSection = {
      id: Date.now(),
      name: sectionType || `SECTION_${(template.sections?.length || 0) + 1}`,
      displayName: {
        en: sectionType || 'New Section',
        ru: 'Новая секция',
        lv: 'Jauna sadaļa'
      },
      icon: '📐',
      orderIndex: template.sections?.length || 0,
      isRequired: false,
      fields: []
    };

    template.sections = [...(template.sections || []), newSection];
    pushHistory();
    selectElement(newSection, 'section');
  }

  function deleteSection(sectionId: number) {
    if (!confirm('Delete this section and all its fields?')) return;
    
    template.sections = template.sections?.filter(s => s.id !== sectionId) || [];
    pushHistory();
    
    if (selectedElement?.id === sectionId) {
      selectedElement = null;
      propertiesPanelOpen = false;
    }
  }

  function duplicateSection(section: ProfileSection) {
    const duplicate = JSON.parse(JSON.stringify(section));
    duplicate.id = Date.now();
    duplicate.name = `${section.name}_COPY`;
    duplicate.displayName = {
      en: `${section.displayName.en} (Copy)`,
      ru: `${section.displayName.ru} (Копия)`,
      lv: `${section.displayName.lv} (Kopija)`
    };
    duplicate.orderIndex = template.sections?.length || 0;
    
    duplicate.fields = duplicate.fields.map((f: ProfileField) => ({
      ...f,
      id: Date.now() + Math.random()
    }));

    template.sections = [...(template.sections || []), duplicate];
    pushHistory();
  }

  // Field Operations
  function addFieldToSection(sectionId: number, fieldType: string) {
    const section = template.sections?.find(s => s.id === sectionId);
    if (!section) return;

    const newField = createFieldFromType(fieldType, section.fields.length);
    section.fields = [...section.fields, newField];
    template = { ...template };
    pushHistory();
    selectElement(newField, 'field');
  }

  function createFieldFromType(fieldType: string, orderIndex: number): ProfileField {
    const baseField: ProfileField = {
      id: Date.now() + Math.random(),
      fieldKey: `field_${orderIndex + 1}`,
      fieldType: fieldType as any,
      label: {
        en: 'New Field',
        ru: 'Новое поле',
        lv: 'Jauns lauks'
      },
      orderIndex: orderIndex,
      isRequired: false,
      options: [],
      config: {}
    };

    // Type-specific defaults
    switch (fieldType) {
      case 'material_selector':
      case 'material_field':
        baseField.config = {
          materialTypes: ['ACRYLIC'],
          showThickness: true
        };
        baseField.defaultValue = 'OPAL_WHITE';
        break;

      case 'color_ral':
        baseField.config = { showPreview: true };
        baseField.defaultValue = '9005';
        break;

      case 'dropdown':
        baseField.options = ['Option 1', 'Option 2', 'Option 3'];
        baseField.config = { };
        break;

      case 'button_group':
        baseField.options = ['Option A', 'Option B'];
        baseField.config = { };
        break;

      case 'numeric_input':
      case 'number':
        baseField.config = { min: 0, max: 200, step: 10, unit: 'mm' };
        baseField.defaultValue = 60;
        break;

      case 'toggle':
        baseField.config = { };
        baseField.defaultValue = false;
        break;

      case 'date_input':
      case 'date':
        baseField.config = { minDate: 'today' };
        break;

      case 'info_box':
        baseField.config = { 
          content: 'Important information',
          type: 'info'
        };
        break;

      case 'thickness_selector':
        baseField.config = { unit: 'mm', step: 0.5, min: 1, max: 20 };
        baseField.options = [3, 5, 6, 8];
        baseField.defaultValue = 3;
        break;
    }

    return baseField;
  }

  function deleteField(sectionId: number, fieldId: number) {
    const section = template.sections?.find(s => s.id === sectionId);
    if (!section || !confirm('Delete this field?')) return;

    section.fields = section.fields.filter(f => f.id !== fieldId);
    template = { ...template };
    pushHistory();
    
    if (selectedElement?.id === fieldId) {
      selectedElement = null;
      propertiesPanelOpen = false;
    }
  }

  function duplicateField(sectionId: number, field: ProfileField) {
    const section = template.sections?.find(s => s.id === sectionId);
    if (!section) return;

    const duplicate = JSON.parse(JSON.stringify(field));
    duplicate.id = Date.now() + Math.random();
    duplicate.fieldKey = `${field.fieldKey}_copy`;
    duplicate.orderIndex = section.fields.length;

    section.fields = [...section.fields, duplicate];
    template = { ...template };
    pushHistory();
  }

  // Selection
  function selectElement(element: any, type: 'template' | 'section' | 'field') {
    selectedElement = element;
    selectedType = type;
    propertiesPanelOpen = true;
  }

  // Properties Update
  function updateProperties(updates: any) {
    if (selectedType === 'template') {
      template = { ...template, ...updates };
    } else if (selectedType === 'section' && selectedElement) {
      const section = template.sections?.find(s => s.id === selectedElement.id);
      if (section) {
        Object.assign(section, updates);
      }
    } else if (selectedType === 'field' && selectedElement) {
      for (const section of template.sections || []) {
        const field = section.fields.find(f => f.id === selectedElement.id);
        if (field) {
          Object.assign(field, updates);
          break;
        }
      }
    }
    template = { ...template };
    pushHistory();
  }

  // Drag and Drop
  function handleComponentDrag(event: CustomEvent) {
    draggedComponent = event.detail;
  }

  function handleDrop(event: CustomEvent) {
    const { sectionId } = event.detail;
    
    if (draggedComponent) {
      if (draggedComponent.type === 'section') {
        addSection(draggedComponent.label);
      } else if (draggedComponent.fieldType && sectionId) {
        addFieldToSection(sectionId, draggedComponent.fieldType);
      }
    }
    
    draggedComponent = null;
    dropTargetSectionId = null;
  }

  // Save Template
  async function saveTemplate() {
    if (!template.code || !template.name) {
      alert('Please enter both code and name for the template');
      return;
    }

    if (!template.sections || template.sections.length === 0) {
      alert('Template must have at least one section');
      return;
    }

    try {
      // TODO: Replace with actual API call
      /*
      const method = templateId ? 'PUT' : 'POST';
      const url = templateId 
        ? `/api/profiles/templates/${template.code}`
        : '/api/profiles/templates';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      });

      if (response.ok) {
        alert('✅ Template saved successfully!');
        hasUnsavedChanges = false;
        dispatch('saved', { template });
      }
      */
      
      // Mock success for now
      console.log('Saving template:', template);
      alert(`✅ Template ${template.code} saved successfully!`);
      hasUnsavedChanges = false;
      dispatch('saved', { template });
      
    } catch (err) {
      console.error('Save failed:', err);
      alert('❌ Failed to save template');
    }
  }

  // Export/Import
  function exportTemplate() {
    const dataStr = JSON.stringify(template, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.code || 'template'}-builder.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function importTemplate(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        template = imported;
        pushHistory();
        alert('Template imported successfully');
      } catch (err) {
        alert('Invalid template file');
      }
    };
    reader.readAsText(file);
  }

  // Keyboard Shortcuts
  function handleKeyboardShortcut(e: KeyboardEvent) {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

    // Ignore if typing in input
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      if (ctrlKey && e.key === 's') {
        e.preventDefault();
        saveTemplate();
      }
      return;
    }

    // Undo
    if (ctrlKey && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }

    // Redo
    if ((ctrlKey && e.key === 'y') || (ctrlKey && e.shiftKey && e.key === 'z')) {
      e.preventDefault();
      redo();
    }

    // Save
    if (ctrlKey && e.key === 's') {
      e.preventDefault();
      saveTemplate();
    }

    // Delete selected
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElement) {
      e.preventDefault();
      if (selectedType === 'section') {
        deleteSection(selectedElement.id);
      } else if (selectedType === 'field') {
        // Find parent section
        for (const section of template.sections || []) {
          if (section.fields.some(f => f.id === selectedElement.id)) {
            deleteField(section.id, selectedElement.id);
            break;
          }
        }
      }
    }

    // Escape to deselect
    if (e.key === 'Escape') {
      selectedElement = null;
      propertiesPanelOpen = false;
    }
  }

  function closeBuilder() {
    if (hasUnsavedChanges) {
      if (!confirm('You have unsaved changes. Close anyway?')) {
        return;
      }
    }
    isOpen = false;
    dispatch('close');
  }
</script>

{#if isOpen}
  <div class="builder-fullscreen">
    <!-- Top Toolbar -->
    <div class="builder-toolbar">
      <div class="toolbar-left">
        <button class="tool-btn" on:click={undo} disabled={historyIndex <= 0} title="Undo (Ctrl+Z)">
          <Undo size={20} />
        </button>
        <button class="tool-btn" on:click={redo} disabled={historyIndex >= historyStack.length - 1} title="Redo (Ctrl+Y)">
          <Redo size={20} />
        </button>
        
        <div class="toolbar-divider"></div>
        
        <div class="template-inputs">
          <input
            type="text"
            bind:value={template.code}
            placeholder="Code (P9)"
            class="code-input"
            maxlength="10"
          />
          <input
            type="text"
            bind:value={template.name}
            placeholder="Profile Name"
            class="name-input"
          />
        </div>
      </div>

      <div class="toolbar-right">
        <span class="history-indicator">
          {historyIndex + 1}/{historyStack.length}
        </span>
        
        <button 
          class="tool-btn" 
          class:active={showPreview}
          on:click={() => showPreview = !showPreview} 
          title="Toggle Preview"
        >
          <Eye size={20} />
        </button>
        
        <button class="tool-btn" on:click={exportTemplate} title="Export JSON">
          <Download size={20} />
        </button>
        
        <label class="tool-btn" title="Import JSON">
          <Upload size={20} />
          <input type="file" accept=".json" on:change={importTemplate} style="display: none;" />
        </label>
        
        <button class="btn-save" on:click={saveTemplate}>
          <Save size={18} />
          Save Template
        </button>
        
        <button class="tool-btn close-btn" on:click={closeBuilder}>
          <X size={20} />
        </button>
      </div>
    </div>

    <!-- Horizontal Components Palette -->
    <div class="palette-horizontal">
      <HorizontalPalette
        on:componentdrag={handleComponentDrag}
      />
    </div>

    <!-- Properties Panel (Collapsible) -->
    {#if selectedElement}
      <div class="properties-panel-horizontal" class:open={propertiesPanelOpen}>
        <button 
          class="properties-toggle"
          on:click={() => propertiesPanelOpen = !propertiesPanelOpen}
        >
          {#if propertiesPanelOpen}
            <ChevronUp size={20} />
          {:else}
            <ChevronDown size={20} />
          {/if}
          <span>
            Properties: {selectedElement.label?.en || selectedElement.displayName?.en || selectedElement.name || 'Template'}
          </span>
          <span class="element-type-badge">{selectedType}</span>
        </button>

        {#if propertiesPanelOpen}
          <div class="properties-content">
            <PropertiesPanel
              element={selectedElement}
              elementType={selectedType}
              on:update={(e) => updateProperties(e.detail)}
            />
          </div>
        {/if}
      </div>
    {/if}

    <!-- Main Canvas Area -->
    <div class="canvas-container">
      {#if showPreview}
        <!-- Preview Mode -->
        <div class="preview-wrapper">
          <div class="preview-header">
            <h3>Live Preview</h3>
            <button class="btn-secondary" on:click={() => showPreview = false}>
              Exit Preview
            </button>
          </div>
          <div class="preview-content">
            <ProfileFormRenderer
              template={template}
              configuration={{}}
              quantity={1}
            />
          </div>
        </div>
      {:else}
        <!-- Edit Mode -->
        <div class="canvas-editor">
          {#if !template.sections || template.sections.length === 0}
            <div class="empty-canvas">
              <Settings size={64} />
              <h3>Start Building Your Profile</h3>
              <p>Drag sections from the palette above or click the button below</p>
              <button class="btn-add-section" on:click={() => addSection()}>
                <Plus size={20} />
                Add First Section
              </button>
            </div>
          {:else}
            <div class="sections-grid">
              {#each template.sections as section (section.id)}
                <CanvasSection
                  {section}
                  selected={selectedElement?.id === section.id}
                  dropTarget={dropTargetSectionId === section.id}
                  selectedFieldId={selectedType === 'field' ? selectedElement?.id : null}
                  on:select={() => selectElement(section, 'section')}
                  on:delete={() => deleteSection(section.id)}
                  on:duplicate={() => duplicateSection(section)}
                  on:addField={(e) => addFieldToSection(section.id, e.detail.fieldType)}
                  on:selectField={(e) => selectElement(e.detail.field, 'field')}
                  on:deleteField={(e) => deleteField(section.id, e.detail.fieldId)}
                  on:duplicateField={(e) => duplicateField(section.id, e.detail.field)}
                  on:drop={(e) => handleDrop({ detail: { sectionId: section.id } })}
                />
              {/each}
              
              <!-- Add Section Button -->
              <button class="add-section-card" on:click={() => addSection()}>
                <Plus size={32} />
                <span>Add Section</span>
              </button>
            </div>
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .builder-fullscreen {
    position: fixed;
    inset: 0;
    z-index: 9999;
    background: var(--bg-1, #f9fafb);
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Toolbar */
  .builder-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md, 16px) var(--space-lg, 24px);
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
  }

  .tool-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: var(--radius-md, 8px);
    color: white;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tool-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.25);
  }

  .tool-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .tool-btn.active {
    background: rgba(255, 255, 255, 0.35);
  }

  .close-btn {
    background: rgba(239, 68, 68, 0.3);
  }

  .close-btn:hover {
    background: rgba(239, 68, 68, 0.5);
  }

  .toolbar-divider {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 var(--space-xs, 4px);
  }

  .template-inputs {
    display: flex;
    gap: var(--space-sm, 8px);
  }

  .code-input,
  .name-input {
    padding: var(--space-sm, 8px) var(--space-md, 16px);
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: var(--radius-md, 8px);
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
    font-size: var(--text-sm, 14px);
  }

  .code-input {
    width: 100px;
    font-family: var(--font-mono, 'Courier New', monospace);
    text-transform: uppercase;
  }

  .name-input {
    width: 280px;
  }

  .history-indicator {
    padding: var(--space-xs, 4px) var(--space-sm, 8px);
    background: rgba(255, 255, 255, 0.15);
    border-radius: var(--radius-md, 8px);
    color: white;
    font-size: var(--text-xs, 11px);
    font-family: var(--font-mono, 'Courier New', monospace);
  }

  .btn-save {
    display: flex;
    align-items: center;
    gap: var(--space-xs, 6px);
    padding: var(--space-sm, 8px) var(--space-lg, 24px);
    background: white;
    color: #667EEA;
    border: none;
    border-radius: var(--radius-md, 8px);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-save:hover {
    background: #f0f0ff;
    transform: translateY(-1px);
  }

  /* Horizontal Palette */
  .palette-horizontal {
    flex-shrink: 0;
    background: var(--bg-2, #f3f4f6);
    border-bottom: 1px solid var(--border, #e5e7eb);
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Properties Panel (Horizontal, Collapsible) */
  .properties-panel-horizontal {
    flex-shrink: 0;
    background: var(--bg-2, #f3f4f6);
    border-bottom: 1px solid var(--border, #e5e7eb);
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
  }

  .properties-panel-horizontal.open {
    max-height: 300px;
  }

  .properties-toggle {
    width: 100%;
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-sm, 8px) var(--space-lg, 24px);
    background: var(--bg-3, #e5e7eb);
    border: none;
    border-bottom: 1px solid var(--border, #e5e7eb);
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 600;
    color: var(--text-primary, #1a1a1a);
  }

  .properties-toggle:hover {
    background: var(--bg-4, #d1d5db);
  }

  .element-type-badge {
    padding: 2px 8px;
    background: var(--primary-bg, #EEF2FF);
    color: var(--primary, #667EEA);
    border-radius: var(--radius-full, 12px);
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
  }

  .properties-content {
    padding: var(--space-lg, 24px);
    overflow-y: auto;
    max-height: 250px;
  }

  /* Canvas Container */
  .canvas-container {
    flex: 1;
    overflow: auto;
    background: #f8f9fa;
  }

  .canvas-editor {
    padding: var(--space-2xl, 32px);
    min-height: 100%;
  }

  .empty-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-md, 16px);
    padding: var(--space-3xl, 64px);
    background: white;
    border: 3px dashed var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 12px);
    color: var(--text-muted, #9ca3af);
    min-height: 400px;
  }

  .empty-canvas h3 {
    margin: 0;
    font-size: var(--text-xl, 24px);
    color: var(--text-primary, #1a1a1a);
  }

  .empty-canvas p {
    margin: 0;
    font-size: var(--text-md, 16px);
  }

  .btn-add-section {
    display: flex;
    align-items: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-md, 12px) var(--space-xl, 32px);
    background: var(--primary, #667EEA);
    color: white;
    border: none;
    border-radius: var(--radius-lg, 12px);
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: var(--space-md, 16px);
  }

  .btn-add-section:hover {
    background: var(--primary-dark, #5568D3);
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }

  /* Sections Grid */
  .sections-grid {
    display: flex;
    gap: var(--space-lg, 24px);
    padding: var(--space-md, 16px);
    background: white;
    border: 2px solid var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 12px);
    min-height: 400px;
    overflow-x: auto;
  }

  .add-section-card {
    min-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm, 8px);
    padding: var(--space-xl, 32px);
    background: var(--bg-2, #f9fafb);
    border: 3px dashed var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 12px);
    cursor: pointer;
    transition: all 0.2s ease;
    color: var(--text-muted, #9ca3af);
    font-weight: 600;
  }

  .add-section-card:hover {
    border-color: var(--primary, #667EEA);
    color: var(--primary, #667EEA);
    background: var(--primary-bg, #EEF2FF);
    transform: scale(1.02);
  }

  /* Preview */
  .preview-wrapper {
    padding: var(--space-2xl, 32px);
    background: white;
    min-height: 100%;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-xl, 24px);
  }

  .preview-header h3 {
    margin: 0;
    font-size: var(--text-2xl, 24px);
    font-weight: 700;
  }

  .btn-secondary {
    padding: var(--space-sm, 12px) var(--space-lg, 24px);
    background: var(--bg-2, #f3f4f6);
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-md, 8px);
    font-weight: 600;
    cursor: pointer;
  }

  .preview-content {
    background: white;
    border: 1px solid var(--border, #e5e7eb);
    border-radius: var(--radius-lg, 12px);
    padding: var(--space-xl, 24px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Responsive */
  @media (max-width: 1024px) {
    .template-inputs {
      flex-direction: column;
    }

    .sections-grid {
      flex-direction: column;
    }

    .add-section-card {
      min-width: 100%;
    }
  }
</style>
