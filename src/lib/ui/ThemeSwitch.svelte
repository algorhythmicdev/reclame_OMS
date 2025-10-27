<script lang="ts">
  import { theme, type ThemeName } from '$lib/stores/theme';
  import { savePrefs } from '$lib/settings/service';
  let t: ThemeName;
  $: theme.subscribe(v => t = v);

  const themes: ThemeName[] = ['LightVim','DarkVim','HighContrastVim'];

  function setTheme(newTheme: ThemeName) {
    theme.set(newTheme);
    savePrefs();
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Theme</h3>
  <div class="row" role="group" aria-label="Theme">
    {#each themes as option}
      <button
        class="tag"
        aria-pressed={t===option}
        on:click={() => setTheme(option)}
      >{option}</button>
    {/each}
  </div>
</div>
