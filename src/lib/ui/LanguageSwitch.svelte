<script lang="ts">
  import { locale, getLocaleFromNavigator } from 'svelte-i18n';
  import { setLocale } from '$lib/i18n';
  let lang = 'en';
  $: locale.subscribe(v => lang = v || 'en');

  function change(e: Event) {
    const v = (e.target as HTMLSelectElement).value as 'en'|'ru'|'lv';
    setLocale(v);
  }
</script>

<div class="card">
  <h3 style="margin:0 0 8px 0">Language</h3>
  <select class="rf-input" on:change={change} bind:value={lang} aria-label="Language">
    <option value="en">English</option>
    <option value="ru">Русский</option>
    <option value="lv">Latviešu</option>
  </select>
</div>
