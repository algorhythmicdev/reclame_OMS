<!-- src/lib/profiles/components/fields/OracalCodeStack.svelte -->
<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let codes: string[] = [];
  export let label: string = 'ORACAL Codes';
  export let readonly: boolean = false;
  export let maxCodes: number = 5;
  
  const dispatch = createEventDispatcher();
  
  function updateCode(index: number, value: string) {
    codes[index] = value;
    codes = [...codes];
    dispatch('change', codes);
  }
  
  function addCode() {
    if (codes.length < maxCodes) {
      codes = [...codes, ''];
      dispatch('change', codes);
    }
  }
  
  function removeCode(index: number) {
    codes = codes.filter((_, i) => i !== index);
    dispatch('change', codes);
  }
</script>

<div class="oracal-stack">
  {#if label}
    <span class="stack-label">{label}</span>
  {/if}
  
  <div class="code-boxes">
    {#each codes as code, i}
      <div class="code-box">
        {#if readonly}
          <span class="code-value">{code || '—'}</span>
        {:else}
          <input
            type="text"
            class="code-input"
            value={code}
            placeholder="8500-XXX"
            on:input={(e) => updateCode(i, e.currentTarget.value)}
          />
          {#if codes.length > 1}
            <button 
              type="button"
              class="remove-btn"
              on:click={() => removeCode(i)}
              title="Remove code"
            >
              ×
            </button>
          {/if}
        {/if}
      </div>
    {/each}
    
    {#if !readonly && codes.length < maxCodes}
      <button 
        type="button"
        class="add-btn"
        on:click={addCode}
        title="Add code"
      >
        +
      </button>
    {/if}
  </div>
</div>

<style>
  .oracal-stack {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .stack-label {
    font-size: 9px;
    font-weight: 600;
    text-transform: uppercase;
    color: #333;
    letter-spacing: 0.5px;
  }
  
  .code-boxes {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .code-box {
    display: flex;
    align-items: center;
    background: #2563EB;
    border: 2px solid #000;
    border-radius: 3px;
    min-height: 28px;
    position: relative;
  }
  
  .code-value {
    flex: 1;
    padding: 4px 8px;
    color: #fff;
    font-weight: 700;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    text-align: center;
  }
  
  .code-input {
    flex: 1;
    padding: 4px 8px;
    background: transparent;
    border: none;
    color: #fff;
    font-weight: 700;
    font-size: 12px;
    font-family: 'Courier New', monospace;
    text-align: center;
    outline: none;
  }
  
  .code-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
  
  .remove-btn {
    position: absolute;
    right: 2px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    padding: 0;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: #fff;
    font-size: 14px;
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s ease;
  }
  
  .remove-btn:hover {
    background: rgba(255, 255, 255, 0.4);
  }
  
  .add-btn {
    padding: 4px 8px;
    background: rgba(37, 99, 235, 0.3);
    border: 2px dashed #2563EB;
    border-radius: 3px;
    color: #2563EB;
    font-weight: 700;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.15s ease;
  }
  
  .add-btn:hover {
    background: rgba(37, 99, 235, 0.5);
    color: #fff;
  }
</style>
