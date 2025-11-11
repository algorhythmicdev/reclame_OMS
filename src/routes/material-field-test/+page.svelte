<script lang="ts">
  import MaterialField from '$lib/profiles/components/fields/MaterialField.svelte';
  
  let materialValue1 = {};
  let materialValue2 = {};
  let materialValue3 = {};
  
  $: console.log('Material 1:', materialValue1);
  $: console.log('Material 2:', materialValue2);
  $: console.log('Material 3:', materialValue3);
</script>

<div style="padding: 2rem; max-width: 1200px; margin: 0 auto;">
  <h1 style="margin-bottom: 1rem;">MaterialField Component Test</h1>
  <p style="margin-bottom: 2rem; color: #6b7280;">Testing the new MaterialField component with visual material selection</p>
  
  <div style="display: grid; gap: 2rem;">
    <!-- Test 1: All material types -->
    <div style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem;">Test 1: All Material Types</h2>
      <MaterialField 
        bind:value={materialValue1}
        label="Select Material (All Types)"
        materialTypes={['ACRYLIC', 'ALUMINUM', 'PVC']}
        required={true}
      />
      <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">
        <strong>Value:</strong><br/>
        <pre>{JSON.stringify(materialValue1, null, 2)}</pre>
      </div>
    </div>

    <!-- Test 2: Acrylic only -->
    <div style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem;">Test 2: Acrylic Only</h2>
      <MaterialField 
        bind:value={materialValue2}
        label="Select Acrylic Material"
        materialTypes={['ACRYLIC']}
        required={false}
      />
      <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">
        <strong>Value:</strong><br/>
        <pre>{JSON.stringify(materialValue2, null, 2)}</pre>
      </div>
    </div>

    <!-- Test 3: Aluminum and PVC -->
    <div style="padding: 1.5rem; border: 1px solid #e5e7eb; border-radius: 8px; background: white;">
      <h2 style="margin-bottom: 1rem; font-size: 1.25rem;">Test 3: Aluminum & PVC</h2>
      <MaterialField 
        bind:value={materialValue3}
        label="Select Metal or PVC Material"
        materialTypes={['ALUMINUM', 'PVC']}
        required={true}
      />
      <div style="margin-top: 1rem; padding: 1rem; background: #f3f4f6; border-radius: 4px; font-family: monospace; font-size: 0.875rem;">
        <strong>Value:</strong><br/>
        <pre>{JSON.stringify(materialValue3, null, 2)}</pre>
      </div>
    </div>
  </div>

  <div style="margin-top: 2rem; padding: 1rem; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
    <h3 style="margin: 0 0 0.5rem; font-size: 1rem;">Testing Instructions:</h3>
    <ul style="margin: 0; padding-left: 1.5rem;">
      <li>Select different material types to see the visual changes</li>
      <li>Verify colored boxes appear correctly with PLEXIGLAS materials</li>
      <li>Test thickness selection for each material type</li>
      <li>Check that the result box matches PDF form styling</li>
      <li>Verify text color contrast on different background colors</li>
    </ul>
  </div>
</div>

<style>
  pre {
    margin: 0;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
</style>
