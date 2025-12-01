<!-- src/routes/profile-7st-visual-test/+page.svelte -->
<script lang="ts">
  import Profile7stVisual from '$lib/profiles/components/Profile7stVisual.svelte';
  
  let configuration = {
    signType: 'EXTERIOR' as 'INTERIOR' | 'EXTERIOR',
    CNC_FREZER: { face: 'OPAL', back: 'ALU 1.5' },
    BENDER: { sides: 'ALU 1.2', depth: 140 },
    FRONT: { opal: true, oracalCodes: ['8500-031', '8500-020', '8500-052'] },
    PAINTING: { 
      sides: true, sidesColor: { system: 'RAL', code: '9016', hex: '#F7F7F2' },
      back: false, backColor: { system: '', code: '', hex: '' },
      frame: true, frameColor: { system: 'RAL', code: '9005', hex: '#0A0A0A' }
    },
    ASSEMBLING: { 
      led: true, ledType: 'Balt LED', ledTemp: '6500K',
      trafo: true, trafoType: 'REGULAR' as 'REGULAR' | 'DIMMABLE', trafoMounting: 'SEPARATE' as 'SEPARATE' | 'ON_FRAME',
      cables: true, cablesLength: '2m',
      frame: true, frameWaterholes: true, frameMountingHoles: true
    },
    DELIVERY: { date: '2025-11-14', carrier: 'DHL', address: '' }
  };
  
  let readonly = false;
  
  function handleChange(event: CustomEvent) {
    console.log('Configuration changed:', event.detail);
  }
</script>

<svelte:head>
  <title>Profile 7st Visual Test</title>
</svelte:head>

<div class="test-page">
  <header class="page-header">
    <h1>Profile 7st Visual Component Test</h1>
    <p>This page demonstrates the Profile7stVisual component that matches the PDF order form design.</p>
  </header>
  
  <div class="controls">
    <label class="toggle">
      <input type="checkbox" bind:checked={readonly} />
      <span>Read-only mode</span>
    </label>
  </div>
  
  <div class="preview-container">
    <h2>Component Preview</h2>
    <div class="preview-wrapper">
      <Profile7stVisual 
        bind:configuration
        {readonly}
        on:change={handleChange}
      />
    </div>
  </div>
  
  <div class="config-output">
    <h2>Current Configuration</h2>
    <pre>{JSON.stringify(configuration, null, 2)}</pre>
  </div>
</div>

<style>
  .test-page {
    padding: 24px;
    max-width: 1400px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  
  .page-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 2px solid #e5e7eb;
  }
  
  .page-header h1 {
    margin: 0 0 8px 0;
    color: #1a1a1a;
  }
  
  .page-header p {
    margin: 0;
    color: #6b7280;
  }
  
  .controls {
    margin-bottom: 24px;
    padding: 16px;
    background: #f9fafb;
    border-radius: 8px;
  }
  
  .toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    font-weight: 600;
  }
  
  .toggle input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  .preview-container {
    margin-bottom: 24px;
  }
  
  .preview-container h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #1a1a1a;
  }
  
  .preview-wrapper {
    padding: 24px;
    background: #fff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    overflow-x: auto;
  }
  
  .config-output {
    margin-top: 24px;
  }
  
  .config-output h2 {
    margin: 0 0 16px 0;
    font-size: 18px;
    color: #1a1a1a;
  }
  
  .config-output pre {
    padding: 16px;
    background: #1a1a1a;
    color: #22c55e;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
  }
</style>
