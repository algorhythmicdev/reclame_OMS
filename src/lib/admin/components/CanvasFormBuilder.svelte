<!-- src/lib/admin/components/CanvasFormBuilder.svelte -->
<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';
  import { 
    Plus, Save, Eye, Undo, Redo, Download, Upload,
    X
  } from 'lucide-svelte';
  import ComponentPalette from './builder/ComponentPalette.svelte';
  import CanvasSection from './builder/CanvasSection.svelte';
  import PropertiesPanel from './builder/PropertiesPanel.svelte';
  import ProfileFormVisual from '$lib/profiles/components/ProfileFormVisual.svelte';

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
  <div class="builder-overlay">
    <div class="builder-container">
      <!-- Top Toolbar -->
      <div class="builder-toolbar">
        <div class="toolbar-left">
          <button class="tool-btn" on:click={undo} disabled={historyIndex <= 0} title="Undo">
            <Undo size={20} />
          </button>
          <button class="tool-btn" on:click={redo} disabled={historyIndex >= historyStack.length - 1} title="Redo">
            <Redo size={20} />
          </button>
          <div class="toolbar-divider"></div>
          <input
            type="text"
            bind:value={template.code}
            placeholder="Profile Code (e.g., P9)"
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

        <div class="toolbar-right">
          <button class="tool-btn" on:click={() => showPreview = !showPreview} title="Preview">
            <Eye size={20} />
          </button>
          <button class="tool-btn" on:click={exportTemplate} title="Export JSON">
            <Download size={20} />
          </button>
          <label class="tool-btn" title="Import JSON">
            <Upload size={20} />
            <input type="file" accept=".json" on:change={importTemplate} style="display: none;" />
          </label>
          <button class="btn-primary" on:click={saveTemplate}>
            <Save size={18} />
            Save Template
          </button>
          <button class="tool-btn close-btn" on:click={closeBuilder}>
            <X size={20} />
          </button>
        </div>
      </div>

      <div class="builder-main">
        <!-- Left: Component Palette -->
        <div class="palette-sidebar">
          <ComponentPalette
            on:dragstart={(e) => handleDragStart(e.detail.event, e.detail.component)}
          />
        </div>

        <!-- Center: Canvas -->
        <div class="canvas-area">
          {#if showPreview}
            <!-- Preview Mode -->
            <div class="preview-mode">
              <div class="preview-header">
                <h3>Live Preview</h3>
                <button class="btn-secondary" on:click={() => showPreview = false}>
                  Exit Preview
                </button>
              </div>
              <div class="preview-content">
                <ProfileFormVisual
                  profileCode={template.code}
                  configuration={{}}
                />
              </div>
            </div>
          {:else}
            <!-- Edit Mode -->
            <div class="canvas-edit-mode">
              <div class="canvas-header">
                <h3>Form Canvas</h3>
                <button class="btn-secondary-small" on:click={() => addSection()}>
                  <Plus size={16} />
                  Add Section
                </button>
              </div>

              <!-- Sections -->
              <div 
                class="canvas-sections"
                on:dragover={(e) => handleDragOver(e)}
              >
                {#if template.sections.length === 0}
                  <div class="empty-canvas">
                    <Plus size={48} />
                    <p>Drag sections from the palette or click "Add Section"</p>
                  </div>
                {:else}
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
                {/if}
              </div>
            </div>
          {/if}
        </div>

        <!-- Right: Properties Panel -->
        {#if selectedElement && !showPreview}
          <div class="properties-sidebar">
            <PropertiesPanel
              element={selectedElement}
              elementType={selectedType}
              on:update={(e) => updateProperties(e.detail)}
            />
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .builder-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
  }

  .builder-container {
    width: 100vw;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f9fafb;
  }

  .builder-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
    gap: 16px;
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
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .tool-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.3);
  }

  .tool-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .toolbar-divider {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 4px;
  }

  .code-input,
  .name-input {
    padding: 8px 16px;
    background: rgba(255, 255, 255, 0.9);
    border: none;
    border-radius: 8px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .code-input {
    width: 120px;
    font-family: 'Courier New', monospace;
  }

  .name-input {
    width: 250px;
  }

  .btn-primary {
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

  .btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  .close-btn {
    background: rgba(239, 68, 68, 0.2);
  }

  .close-btn:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.4);
  }

  .builder-main {
    display: grid;
    grid-template-columns: 280px 1fr 350px;
    gap: 0;
    flex: 1;
    overflow: hidden;
  }

  .palette-sidebar {
    background: #f3f4f6;
    border-right: 1px solid #e5e7eb;
    overflow-y: auto;
  }

  .canvas-area {
    background: white;
    overflow: auto;
  }

  .canvas-edit-mode {
    padding: 32px;
  }

  .canvas-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .canvas-header h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }

  .btn-secondary-small {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .canvas-sections {
    display: flex;
    gap: 16px;
    padding: 16px;
    background: #f9fafb;
    border: 2px dashed #e5e7eb;
    border-radius: 12px;
    min-height: 400px;
    overflow-x: auto;
  }

  .empty-canvas {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 16px;
    color: #9ca3af;
    padding: 64px;
  }

  .properties-sidebar {
    background: white;
    border-left: 1px solid #e5e7eb;
    overflow-y: auto;
  }

  .preview-mode {
    padding: 32px;
    background: white;
  }

  .preview-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 32px;
  }

  .preview-header h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 700;
  }

  .btn-secondary {
    padding: 8px 24px;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
  }

  .preview-content {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 32px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
</style>
