<script lang="ts">
  import { OracalSelector, ButtonGroup, InfoBox, QuantitySelector } from '$lib/profiles/components';

  let oracalValue = '';
  let ledTempValue = 'WHITE 6000K';
  let quantity = 1;
</script>

<div class="test-page">
  <header class="test-header">
    <h1>Profile 7st Components Test</h1>
    <p>Visual demonstration of all new Profile 7st form components</p>
  </header>

  <section class="test-section">
    <h2>1. ORACAL Film Selector</h2>
    <p class="description">ORACAL 8500 series film color selector with visual grid and search</p>
    <div class="demo-box">
      <OracalSelector 
        bind:value={oracalValue}
        label="ORACAL Film Color"
        series="8500"
        showColorPreview={true}
      />
      <div class="value-display">
        Selected value: <code>{oracalValue || 'None'}</code>
      </div>
    </div>
  </section>

  <section class="test-section">
    <h2>2. Button Group (LED Temperature)</h2>
    <p class="description">Visual button group with colored boxes matching PDF style</p>
    <div class="demo-box">
      <ButtonGroup
        bind:value={ledTempValue}
        label="LED Color Temperature"
        options={['WARM WHITE 3000K', 'WHITE 6000K', '9000K', 'BLACK DAYNIGHT KVILLER']}
        visualStyle="boxes"
      />
      <div class="value-display">
        Selected value: <code>{ledTempValue}</code>
      </div>
    </div>
  </section>

  <section class="test-section">
    <h2>3. Info Box</h2>
    <p class="description">Warning and info boxes for displaying notes</p>
    <div class="demo-box">
      <InfoBox
        content="<strong>Important:</strong> Акрил лицевик: фрезеруем / снимаем по максимуму (2-3mm in, 18-17mm out)"
        type="warning"
        icon="alert-circle"
      />
      
      <InfoBox
        content="This is an informational message with additional details about the manufacturing process."
        type="info"
        icon="info"
      />
      
      <InfoBox
        content="<strong>Critical:</strong> This profile requires special attention and careful handling."
        type="danger"
        icon="alert-triangle"
      />
    </div>
  </section>

  <section class="test-section">
    <h2>4. Quantity Selector</h2>
    <p class="description">Colorful vertical quantity buttons (1-10 pcs) matching PDF style</p>
    <div class="demo-box">
      <div style="display: flex; gap: 2rem; align-items: flex-start;">
        <QuantitySelector bind:quantity maxQuantity={10} />
        <div class="value-display" style="margin-top: 0;">
          Selected quantity: <code>{quantity} {quantity === 1 ? 'pc' : 'pcs'}</code>
        </div>
      </div>
    </div>
  </section>

  <section class="test-section">
    <h2>5. Complete Form Layout</h2>
    <p class="description">All components can be combined in the ProfileFormVisual component for a PDF-style horizontal layout</p>
    <div class="demo-box">
      <div class="form-preview">
        <div class="preview-header">
          <div class="profile-badge">Profile P7st</div>
          <span>OUTDOOR SIGN / INDOOR SIGN</span>
        </div>
        <div class="preview-sections">
          <div class="preview-section">
            <div class="section-header">CNC FREZER</div>
            <div class="section-content">FACE Material, BACK Material</div>
          </div>
          <div class="preview-section">
            <div class="section-header">BENDER</div>
            <div class="section-content">SIDES Material, Depth</div>
          </div>
          <div class="preview-section">
            <div class="section-header">FRONT</div>
            <div class="section-content">OPAL, Film/Print</div>
          </div>
          <div class="preview-section">
            <div class="section-header">PAINTING</div>
            <div class="section-content">SIDES Color, BACK Color</div>
          </div>
          <div class="preview-section">
            <div class="section-header">ASSEMBLING</div>
            <div class="section-content">LED, TRAFO, CABLES</div>
          </div>
          <div class="preview-section">
            <div class="section-header">DELIVERY</div>
            <div class="section-content">Date</div>
          </div>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .test-page {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }

  .test-header {
    margin-bottom: 3rem;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 1rem;
  }

  .test-header h1 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
    font-size: 2rem;
  }

  .test-header p {
    margin: 0;
    color: #6b7280;
    font-size: 1rem;
  }

  .test-section {
    margin-bottom: 3rem;
  }

  .test-section h2 {
    margin: 0 0 0.5rem 0;
    color: #1a1a1a;
    font-size: 1.5rem;
  }

  .description {
    margin: 0 0 1rem 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  .demo-box {
    background: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 1.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }

  .value-display {
    margin-top: 1rem;
    padding: 0.75rem;
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #374151;
  }

  .value-display code {
    background: #ffffff;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-family: 'Courier New', monospace;
    color: #1e40af;
    border: 1px solid #dbeafe;
  }

  /* Form Preview Styles */
  .form-preview {
    background: #f9fafb;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 1rem;
  }

  .preview-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e5e7eb;
  }

  .profile-badge {
    background: #E91E63;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-weight: 700;
    font-size: 1rem;
  }

  .preview-sections {
    display: flex;
    gap: 2px;
    background: #000;
    padding: 2px;
    border-radius: 6px;
    overflow-x: auto;
  }

  .preview-section {
    flex: 1;
    min-width: 120px;
    background: white;
    display: flex;
    flex-direction: column;
  }

  .section-header {
    background: #1a1a1a;
    color: white;
    padding: 0.5rem;
    font-size: 0.75rem;
    font-weight: 700;
    text-align: center;
    text-transform: uppercase;
  }

  .section-content {
    padding: 0.75rem 0.5rem;
    font-size: 0.75rem;
    color: #6b7280;
    text-align: center;
  }
</style>
