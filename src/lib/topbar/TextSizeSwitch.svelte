<script lang="ts">
  import { ui } from '$lib/state/ui';
  import Type from 'lucide-svelte/icons/type';
  
  const steps = [0.90, 1.00, 1.10, 1.20, 1.30];
  
  function inc() {
    ui.update(p => ({ ...p, fontScale: steps.find(s => s > p.fontScale) ?? p.fontScale }));
  }
  
  function dec() {
    ui.update(p => ({ ...p, fontScale: [...steps].reverse().find(s => s < p.fontScale) ?? p.fontScale }));
  }
</script>

<div class="row">
  <button class="icon" aria-label="Smaller text" on:click={dec}>T</button>
  <button class="icon" aria-label="Larger text" on:click={inc}><strong>T</strong></button>
</div>

<style>
:root{ font-size: calc(16px * var(--font-scale, 1)); }
</style>
