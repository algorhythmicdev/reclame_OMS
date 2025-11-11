<!-- src/routes/admin-builder-test/+page.svelte -->
<script lang="ts">
  import { Settings } from 'lucide-svelte';
  import CanvasFormBuilder from '$lib/admin/components/CanvasFormBuilder.svelte';

  let builderOpen = false;
  let currentTemplateId: number | null = null;

  function openBuilder(templateId?: number) {
    currentTemplateId = templateId || null;
    builderOpen = true;
  }

  function handleSaved(event: CustomEvent) {
    console.log('Template saved:', event.detail.template);
    builderOpen = false;
  }

  function handleClose() {
    builderOpen = false;
  }
</script>

<div class="page-container">
  <div class="page-header">
    <h1>Profile Template Builder</h1>
    <p class="subtitle">Visual drag-and-drop form builder for creating profile templates</p>
  </div>

  <div class="content">
    <div class="card">
      <div class="card-header">
        <Settings size={24} />
        <h2>Canvas Form Builder Demo</h2>
      </div>
      <div class="card-body">
        <p>
          This tool allows you to visually design profile templates using a drag-and-drop interface.
          You can create sections, add fields, configure properties, and preview your forms in real-time.
        </p>

        <div class="features">
          <h3>Features:</h3>
          <ul>
            <li>✨ Drag-and-drop sections and fields from palette</li>
            <li>🎨 Customize section colors and field properties</li>
            <li>👁️ Live preview of your form design</li>
            <li>↩️ Undo/Redo support for all changes</li>
            <li>💾 Export/Import templates as JSON</li>
            <li>📝 Multi-language support (EN, RU, LV)</li>
            <li>🔧 Type-specific field configurations</li>
          </ul>
        </div>

        <div class="actions">
          <button class="btn-primary" on:click={() => openBuilder()}>
            <Settings size={20} />
            Open Canvas Builder
          </button>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h2>Quick Start Guide</h2>
      </div>
      <div class="card-body">
        <ol class="guide-steps">
          <li>
            <strong>Open the Builder:</strong>
            Click the "Open Canvas Builder" button above
          </li>
          <li>
            <strong>Add Sections:</strong>
            Drag section types from the left palette or click "Add Section"
          </li>
          <li>
            <strong>Add Fields:</strong>
            Drag field types into sections to build your form
          </li>
          <li>
            <strong>Configure Properties:</strong>
            Click on any element to edit its properties in the right panel
          </li>
          <li>
            <strong>Preview:</strong>
            Click the eye icon to see how your form will look
          </li>
          <li>
            <strong>Save:</strong>
            Click "Save Template" to persist your changes
          </li>
        </ol>
      </div>
    </div>
  </div>
</div>

<!-- Canvas Form Builder Modal -->
<CanvasFormBuilder
  bind:isOpen={builderOpen}
  templateId={currentTemplateId}
  on:saved={handleSaved}
  on:close={handleClose}
/>

<style>
  .page-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 40px 20px;
  }

  .page-header {
    margin-bottom: 40px;
  }

  .page-header h1 {
    margin: 0 0 8px 0;
    font-size: 36px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .subtitle {
    margin: 0;
    font-size: 18px;
    color: #6b7280;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .card {
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 20px 24px;
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  .card-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
  }

  .card-body {
    padding: 24px;
  }

  .card-body p {
    margin: 0 0 20px 0;
    line-height: 1.6;
    color: #4b5563;
  }

  .features {
    margin: 24px 0;
  }

  .features h3 {
    margin: 0 0 12px 0;
    font-size: 16px;
    font-weight: 700;
  }

  .features ul {
    margin: 0;
    padding-left: 20px;
  }

  .features li {
    margin: 8px 0;
    line-height: 1.6;
    color: #4b5563;
  }

  .actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  }

  .guide-steps {
    margin: 0;
    padding-left: 24px;
  }

  .guide-steps li {
    margin: 16px 0;
    line-height: 1.8;
    color: #4b5563;
  }

  .guide-steps strong {
    color: #1a1a1a;
    font-weight: 600;
  }
</style>
