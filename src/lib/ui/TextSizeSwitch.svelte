<script lang="ts">
  import { textSize, cycleTextSize, type TextSize } from '$lib/stores/text-size';
  import { Type } from 'lucide-svelte';
  import { t } from 'svelte-i18n';

  const labels: Record<TextSize, string> = {
    normal: 'Normal',
    large: 'Large',
    'x-large': 'Extra Large'
  };

  function handleClick() {
    cycleTextSize();
  }
</script>

<section class="card text-size-switch">
  <h3 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
    <Type size={18} aria-hidden="true" />
    {$t('accessibility.text_size')}
  </h3>
  <button 
    class="tag" 
    style="width: 100%; justify-content: center; cursor: pointer;"
    on:click={handleClick}
    aria-label={$t('accessibility.text_size_toggle')}>
    <Type size={16} aria-hidden="true" />
    <span>{labels[$textSize]}</span>
  </button>
  <p class="muted" style="font-size: 0.85rem; margin: 8px 0 0 0;">
    {$t('accessibility.text_size_hint')}
  </p>
</section>

<style>
  .text-size-switch {
    display: grid;
    gap: 8px;
  }
</style>
