<script lang="ts">
  import { theme, type ThemeName } from '$lib/stores/theme';
  import { savePrefs } from '$lib/settings/service';
  import { t } from 'svelte-i18n';

  let currentTheme: ThemeName;
  $: theme.subscribe((v) => (currentTheme = v));

  const themes: ThemeName[] = ['LightVim','DarkVim','HighContrastVim'];

  function setTheme(newTheme: ThemeName) {
    theme.set(newTheme);
    savePrefs();
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">{$t('theme.title')}</h3>
  <div class="row" role="group" aria-label={$t('header.theme.label')}>
    {#each themes as option}
      <button
        class="tag"
        aria-pressed={currentTheme===option}
        on:click={() => setTheme(option)}
      >{$t(`header.theme.options.${option}`)}</button>
    {/each}
  </div>
</div>
