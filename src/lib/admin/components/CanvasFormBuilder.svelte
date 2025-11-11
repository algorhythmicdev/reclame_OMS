<!-- src/lib/admin/components/CanvasFormBuilder.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { 
    Plus, Save, Eye, Undo, Redo, Download, Upload,
    X, ChevronDown, ChevronUp, Settings
  } from 'lucide-svelte';
  import HorizontalPalette from './builder/HorizontalPalette.svelte';
  import CanvasSection from './builder/CanvasSection.svelte';
  import PropertiesPanel from './builder/PropertiesPanel.svelte';

  export let isOpen: boolean = false;
  export let templateId: number | null = null;

  const dispatch = createEventDispatcher();

  interface Template {
    code: string;
    name: string;
    description: string;
    version: string;
    sections: Section[];
  }

  interface Section {
    id: string;
    name: string;
    display_name_en: string;
    display_name_ru: string;
    display_name_lv: string;
    order_index: number;
    is_required: boolean;
    fields: Field[];
    metadata: {
      color: string;
      icon: string;
    };
  }

  interface Field {
    id: string;
    field_key: string;
    field_type: string;
    label_en: string;
    label_ru: string;
    label_lv: string;
    order_index: number;
    is_required: boolean;
    options: string[];
    config: any;
    metadata: any;
  }

  let template: Template = {
    code: '',
    name: '',
    description: '',
    version: '1.0',
    sections: []
  };

  let selectedElement: any = null;
  let selectedType: 'template' | 'section' | 'field' | null = null;
  let propertiesPanelOpen = false;
  let showPreview = false;
  let historyStack: Template[] = [];
  let historyIndex = -1;
  let draggedComponent: any = null;
  let dropTargetSection: string | null = null;

  onMount(async () => {
    if (templateId) {
      await loadTemplate();
    } else {
      initializeNewTemplate();
    }
  });

  function initializeNewTemplate() {
    template = {
      code: `P${Math.floor(Math.random() * 100)}`,
      name: 'New Profile',
      description: '',
      version: '1.0',
      sections: []
    };
    pushHistory();
  }

  async function loadTemplate() {
    try {
      const response = await fetch(`/api/profiles/templates/${templateId}?admin=true`);
      if (response.ok) {
        template = await response.json();
        pushHistory();
      }
    } catch (err) {
      console.error('Failed to load template:', err);
    }
  }

  function pushHistory() {
    historyStack = historyStack.slice(0, historyIndex + 1);
    historyStack.push(JSON.parse(JSON.stringify(template)));
    historyIndex++;
    
    if (historyStack.length > 50) {
      historyStack.shift();
      historyIndex--;
    }
  }

  function undo() {
    if (historyIndex > 0) {
      historyIndex--;
      template = JSON.parse(JSON.stringify(historyStack[historyIndex]));
    }
  }

  function redo() {
    if (historyIndex < historyStack.length - 1) {
      historyIndex++;
      template = JSON.parse(JSON.stringify(historyStack[historyIndex]));
    }
  }

  function addSection(sectionType?: string) {
    const newSection: Section = {
      id: `section-${Date.now()}`,
      name: `SECTION_${template.sections.length + 1}`,
      display_name_en: sectionType || 'New Section',
      display_name_ru: 'Новая секция',
      display_name_lv: 'Jauna sadaļa',
      order_index: template.sections.length,
      is_required: false,
      fields: [],
      metadata: {
        color: '#1a1a1a',
        icon: 'square'
      }
    };

    template.sections = [...template.sections, newSection];
    pushHistory();
    selectElement(newSection, 'section');
  }

  function deleteSection(sectionId: string) {
    if (!confirm('Delete this section and all its fields?')) return;
    template.sections = template.sections.filter(s => s.id !== sectionId);
    pushHistory();
    if (selectedElement?.id === sectionId) {
      selectedElement = null;
      propertiesPanelOpen = false;
    }
  }

  function duplicateSection(section: Section) {
    const duplicate = JSON.parse(JSON.stringify(section));
    duplicate.id = `section-${Date.now()}`;
    duplicate.name = `${section.name}_COPY`;
    duplicate.display_name_en = `${section.display_name_en} (Copy)`;
    duplicate.order_index = template.sections.length;
    
    duplicate.fields = duplicate.fields.map((f: Field) => ({
      ...f,
      id: `field-${Date.now()}-${Math.random()}`
    }));

    template.sections = [...template.sections, duplicate];
    pushHistory();
  }

  function addFieldToSection(sectionId: string, fieldType: string) {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;

    const newField = createFieldFromType(fieldType, section.fields.length);
    section.fields = [...section.fields, newField];
    template = { ...template };
    pushHistory();
    selectElement(newField, 'field');
  }

  function createFieldFromType(fieldType: string, orderIndex: number): Field {
    const baseField: Field = {
      id: `field-${Date.now()}`,
      field_key: `field_${orderIndex + 1}`,
      field_type: fieldType,
      label_en: 'New Field',
      label_ru: 'Новое поле',
      label_lv: 'Jauns lauks',
      order_index: orderIndex,
      is_required: false,
      options: [],
      config: {},
      metadata: {}
    };

    switch (fieldType) {
      case 'material_field':
        baseField.config = {
          materialTypes: ['ACRYLIC'],
          showThickness: true
        };
        baseField.metadata = { visualBox: true };
        break;

      case 'color_ral':
        baseField.config = { showPreview: true };
        baseField.metadata = { visualBox: true, boxColor: 'ralValue' };
        break;

      case 'dropdown':
        baseField.options = ['Option 1', 'Option 2', 'Option 3'];
        break;

      case 'button_group':
        baseField.options = ['Option A', 'Option B'];
        baseField.config = { visualStyle: 'buttons' };
        break;

      case 'number':
        baseField.config = { min: 0, max: 100, step: 1, unit: 'mm' };
        break;

      case 'toggle':
        baseField.config = { default: false };
        break;

      case 'info_box':
        baseField.config = { 
          content: 'Important information here',
          type: 'info'
        };
        break;
    }

    return baseField;
  }

  function deleteField(sectionId: string, fieldId: string) {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;

    if (!confirm('Delete this field?')) return;
    section.fields = section.fields.filter(f => f.id !== fieldId);
    template = { ...template };
    pushHistory();
    if (selectedElement?.id === fieldId) {
      selectedElement = null;
      propertiesPanelOpen = false;
    }
  }

  function duplicateField(sectionId: string, field: Field) {
    const section = template.sections.find(s => s.id === sectionId);
    if (!section) return;

    const duplicate = JSON.parse(JSON.stringify(field));
    duplicate.id = `field-${Date.now()}`;
    duplicate.field_key = `${field.field_key}_copy`;
    duplicate.order_index = section.fields.length;

    section.fields = [...section.fields, duplicate];
    template = { ...template };
    pushHistory();
  }

  function selectElement(element: any, type: 'template' | 'section' | 'field') {
    selectedElement = element;
    selectedType = type;
    propertiesPanelOpen = true;
  }

  function updateProperties(updates: any) {
    if (selectedType === 'template') {
      template = { ...template, ...updates };
    } else if (selectedType === 'section' && selectedElement) {
      const section = template.sections.find(s => s.id === selectedElement.id);
      if (section) {
        Object.assign(section, updates);
      }
    } else if (selectedType === 'field' && selectedElement) {
      for (const section of template.sections) {
        const fieldIndex = section.fields.findIndex(f => f.id === selectedElement.id);
        if (fieldIndex !== -1) {
          Object.assign(section.fields[fieldIndex], updates);
          break;
        }
      }
    }
    template = { ...template };
    pushHistory();
  }

  function handleDragStart(event: DragEvent, component: any) {
    draggedComponent = component;
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(event: DragEvent, sectionId?: string) {
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    if (sectionId) {
      dropTargetSection = sectionId;
    }
  }

  function handleDrop(event: DragEvent, sectionId: string) {
    event.preventDefault();
    
    if (draggedComponent) {
      if (draggedComponent.type === 'section') {
        addSection(draggedComponent.label);
      } else {
        addFieldToSection(sectionId, draggedComponent.fieldType);
      }
    }
    
    draggedComponent = null;
    dropTargetSection = null;
  }

  async function saveTemplate() {
    try {
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
        alert('Template saved successfully!');
        dispatch('saved', { template });
      } else {
        const error = await response.json();
        alert(`Failed to save: ${error.message}`);
      }
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save template');
    }
  }

  function exportTemplate() {
    const dataStr = JSON.stringify(template, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${template.code}-template.json`;
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
      } catch (err) {
        alert('Invalid template file');
      }
    };
    reader.readAsText(file);
  }

  function closeBuilder() {
    if (historyIndex > 0) {
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
        on:componentdrag={(e) => draggedComponent = e.detail}
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
          <span>Properties: {selectedElement.label_en || selectedElement.display_name_en || selectedElement.name}</span>
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
          <div class="preview-placeholder">
            <Eye size={64} />
            <h3>Preview Mode</h3>
            <p>Preview functionality requires the template to be saved to the backend first.</p>
            <p>Save your template, then you can preview it in the main application.</p>
            <button class="btn-secondary" on:click={() => showPreview = false}>
              Back to Editor
            </button>
          </div>
        </div>
      {:else}
        <!-- Edit Mode -->
        <div class="canvas-editor">
          {#if template.sections.length === 0}
            <div class="empty-canvas">
              <Settings size={64} />
              <h3>Start Building Your Profile</h3>
              <p>Drag sections from the palette above to get started</p>
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
                  dropTarget={dropTargetSection === section.id}
                  selectedFieldId={selectedType === 'field' ? selectedElement?.id : null}
                  on:select={() => selectElement(section, 'section')}
                  on:delete={() => deleteSection(section.id)}
                  on:duplicate={() => duplicateSection(section)}
                  on:addField={(e) => addFieldToSection(section.id, e.detail.fieldType)}
                  on:selectField={(e) => selectElement(e.detail.field, 'field')}
                  on:deleteField={(e) => deleteField(section.id, e.detail.fieldId)}
                  on:duplicateField={(e) => duplicateField(section.id, e.detail.field)}
                  on:drop={(e) => handleDrop(e.detail.event, section.id)}
                  on:dragover={(e) => handleDragOver(e.detail.event, section.id)}
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
    background: #f9fafb;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* Toolbar (Top) */
  .builder-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 24px;
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
  }

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .tool-btn {
    width: 40px;
    height: 40px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.15);
    border: none;
    border-radius: 8px;
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
    margin: 0 4px;
  }

  .template-inputs {
    display: flex;
    gap: 8px;
  }

  .code-input,
  .name-input {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.95);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    color: #1a1a1a;
    font-size: 14px;
  }

  .code-input {
    width: 100px;
    font-family: 'Courier New', monospace;
    text-transform: uppercase;
  }

  .name-input {
    width: 280px;
  }

  .history-indicator {
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    color: white;
    font-size: 11px;
    font-family: 'Courier New', monospace;
  }

  .btn-save {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 24px;
    background: white;
    color: #667EEA;
    border: none;
    border-radius: 8px;
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
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    overflow-x: auto;
    overflow-y: hidden;
  }

  /* Properties Panel (Horizontal, Collapsible) */
  .properties-panel-horizontal {
    flex-shrink: 0;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
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
    gap: 8px;
    padding: 8px 24px;
    background: #e5e7eb;
    border: none;
    border-bottom: 1px solid #d1d5db;
    cursor: pointer;
    transition: all 0.15s ease;
    font-weight: 600;
    color: #1a1a1a;
  }

  .properties-toggle:hover {
    background: #d1d5db;
  }

  .element-type-badge {
    padding: 2px 8px;
    background: #EEF2FF;
    color: #667EEA;
    border-radius: 12px;
    font-size: 10px;
    text-transform: uppercase;
    font-weight: 700;
  }

  .properties-content {
    padding: 24px;
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
    padding: 32px;
    min-height: 100%;
  }

  .empty-canvas {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    padding: 64px;
    background: white;
    border: 3px dashed #e5e7eb;
    border-radius: 12px;
    color: #9ca3af;
    min-height: 400px;
  }

  .empty-canvas h3 {
    margin: 0;
    font-size: 24px;
    color: #1a1a1a;
  }

  .empty-canvas p {
    margin: 0;
    font-size: 16px;
  }

  .btn-add-section {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 32px;
    background: #667EEA;
    color: white;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 16px;
  }

  .btn-add-section:hover {
    background: #5568D3;
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
  }

  /* Sections Grid (Horizontal) */
  .sections-grid {
    display: flex;
    gap: 24px;
    padding: 16px;
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    min-height: 400px;
    overflow-x: auto;
  }

  .add-section-card {
    min-width: 180px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 32px;
    background: #f9fafb;
    border: 3px dashed #e5e7eb;
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
    color: #9ca3af;
    font-weight: 600;
  }

  .add-section-card:hover {
    border-color: #667EEA;
    color: #667EEA;
    background: #EEF2FF;
    transform: scale(1.02);
  }

  /* Preview */
  .preview-wrapper {
    padding: 32px;
    background: white;
    min-height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .preview-placeholder {
    text-align: center;
    max-width: 500px;
    padding: 64px 32px;
  }

  .preview-placeholder h3 {
    margin: 16px 0 8px 0;
    font-size: 24px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .preview-placeholder p {
    margin: 8px 0;
    color: #6b7280;
    line-height: 1.6;
  }

  .btn-secondary {
    margin-top: 24px;
    padding: 12px 24px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .btn-secondary:hover {
    background: #e5e7eb;
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
