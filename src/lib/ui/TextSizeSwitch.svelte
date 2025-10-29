<script lang="ts">
  import TypeIcon from 'lucide-svelte/icons/type';
  import { scale, type Scale } from '$lib/stores/scale';
  import { t } from 'svelte-i18n';

  const order: Scale[] = ['sm', 'md', 'lg', 'xl'];

  function handleClick() {
    const current = $scale;
    const next = order[(order.indexOf(current) + 1) % order.length];
    scale.set(next);
  }
</script>

<section class="card text-size-switch">
  <h3 style="margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
    <TypeIcon size={18} aria-hidden="true" />
    {$t('accessibility.text_size')}
  </h3>
  <button
    class="tag"
    style="width: 100%; justify-content: center; cursor: pointer;"
    on:click={handleClick}
    aria-label={`${$t('accessibility.text_size_toggle')}: ${$t(`accessibility.text_size_options.${$scale}.label`)}`}>
    <TypeIcon size={16} aria-hidden="true" />
    <span>{$t(`accessibility.text_size_options.${$scale}.label`)}</span>
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
