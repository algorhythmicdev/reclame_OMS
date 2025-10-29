<script lang="ts">
  import { HelpCircle } from 'lucide-svelte';
  
  export let text: string = '';
  export let position: 'top' | 'bottom' | 'left' | 'right' = 'top';
  
  let showTooltip = false;
  let timeoutId: number;
  
  function handleMouseEnter() {
    timeoutId = window.setTimeout(() => {
      showTooltip = true;
    }, 500);
  }
  
  function handleMouseLeave() {
    clearTimeout(timeoutId);
    showTooltip = false;
  }
</script>

<span 
  class="tooltip-wrapper" 
  on:mouseenter={handleMouseEnter}
  on:mouseleave={handleMouseLeave}
  on:focus={handleMouseEnter}
  on:blur={handleMouseLeave}
  role="tooltip"
  tabindex="0">
  <HelpCircle size={16} class="tooltip-icon" aria-label={text} />
  {#if showTooltip}
    <span class="tooltip-content" data-position={position} class:show={showTooltip}>
      {text}
    </span>
  {/if}
</span>

<style>
  .tooltip-wrapper {
    display: inline-flex;
    position: relative;
    cursor: help;
    color: var(--muted);
    transition: color 0.2s ease;
  }
  
  .tooltip-wrapper:hover,
  .tooltip-wrapper:focus {
    color: var(--accent-1);
    outline: none;
  }
  
  :global(.tooltip-icon) {
    flex-shrink: 0;
  }
  
  .tooltip-content {
    position: absolute;
    z-index: 1000;
    padding: 8px 12px;
    background: var(--bg-1);
    border: 1px solid var(--border);
    border-radius: 8px;
    box-shadow: 0 8px 24px rgba(var(--shadow-rgb), 0.2);
    font-size: 0.85rem;
    line-height: 1.4;
    white-space: nowrap;
    max-width: 250px;
    white-space: normal;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  
  .tooltip-content.show {
    opacity: 1;
  }
  
  .tooltip-content[data-position="top"] {
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tooltip-content[data-position="bottom"] {
    top: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%);
  }
  
  .tooltip-content[data-position="left"] {
    right: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
  
  .tooltip-content[data-position="right"] {
    left: calc(100% + 8px);
    top: 50%;
    transform: translateY(-50%);
  }
</style>
